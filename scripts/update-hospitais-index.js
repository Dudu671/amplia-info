import { createWriteStream } from "node:fs";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import yauzl from "yauzl";
import { streamArray } from "stream-json/streamers/stream-array.js";
import { getJson } from "../app/services/http.js";
import { CNES_SOURCE, INDEX_DIR, createHospitalIndex, indexCandidate, loadHospitalIndex, publishHospitalIndex } from "../app/services/hospitais-index.server.js";
import { HOSPITAIS_TYPES } from "../app/services/hospitais-domain.js";

const DAY = 24 * 60 * 60 * 1000;
const openZip = promisify(yauzl.open);

export async function* readCnesArchive(path) {
    const zip = await openZip(path, { lazyEntries: true, autoClose: false });
    try {
        const entry = await new Promise((resolve, reject) => {
            zip.once("error", reject);
            zip.once("end", () => reject(new Error("Arquivo CNES ausente no ZIP.")));
            zip.on("entry", (item) => {
                if (item.fileName === "cnes_estabelecimentos.json") resolve(item);
                else zip.readEntry();
            });
            zip.readEntry();
        });
        const input = await promisify(zip.openReadStream.bind(zip))(entry);
        const parser = streamArray.withParserAsStream();
        const processing = pipeline(input, parser);
        // A rejeição é observada mesmo quando o consumidor encerra antes do EOF.
        processing.catch(() => {});
        try {
            for await (const { value } of parser) yield value;
            await processing;
        } finally {
            input.destroy();
            parser.destroy();
        }
    } finally { zip.close(); }
}

export function buildCityDictionary(municipalities) {
    if (!Array.isArray(municipalities) || !municipalities.length) throw new Error("Municípios IBGE inválidos.");
    const dictionary = {};
    for (const city of municipalities) {
        const code = String(city.id);
        if (!/^\d{7}$/.test(code) || typeof city.nome !== "string" || !city.nome.trim()) throw new Error("Município IBGE inválido.");
        dictionary[code.slice(0, 6)] = city.nome;
    }
    return dictionary;
}

export async function updateHospitalIndex({ directory = INDEX_DIR, archive, sourceUpdatedAt, types, cities,
    fetchImpl = globalThis.fetch, now = new Date(), logger = console } = {}) {
    const started = Date.now();
    let temporary;
    let previous;
    try {
        try { previous = await loadHospitalIndex(undefined, directory); } catch { /* Primeira carga. */ }
        temporary = await mkdtemp(join(tmpdir(), "amplia-cnes-"));
        if (!archive) {
            const response = await fetchImpl(CNES_SOURCE, { signal: AbortSignal.timeout(5 * 60 * 1000) });
            if (!response.ok || !response.body) throw new Error(`Download CNES: HTTP ${response.status}`);
            const modified = response.headers.get("last-modified");
            if (!modified || !Number.isFinite(Date.parse(modified))) throw new Error("Data da fonte CNES ausente.");
            sourceUpdatedAt = new Date(modified).toISOString();
            archive = join(temporary, "cnes.zip");
            await pipeline(response.body, createWriteStream(archive));
        }
        if (!types) {
            const data = await getJson("https://apidadosabertos.saude.gov.br/cnes/tipounidades", { signal: AbortSignal.timeout(30000) });
            if (!Array.isArray(data?.tipos_unidade)) throw new Error("Tipos CNES inválidos.");
            types = Object.fromEntries(data.tipos_unidade.map((type) => [Number(type.codigo_tipo_unidade), type.descricao_tipo_unidade]));
        }
        if (HOSPITAIS_TYPES.some((type) => typeof types[type] !== "string" || !types[type].trim())) throw new Error("Dicionário CNES incompleto.");
        cities ??= buildCityDictionary(await getJson("https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome", { signal: AbortSignal.timeout(60000) }));
        const records = [];
        let sourceCount = 0;
        for await (const row of readCnesArchive(archive)) {
            sourceCount++;
            const record = indexCandidate(row);
            if (record) records.push(record);
        }
        // Uma carga nacional truncada nunca substitui uma base já válida.
        if (sourceCount < 100000 || records.length < 10000 || new Set(records.map((record) => record.uf)).size !== 27
            || (previous && records.length < previous.records.length * 0.8)) throw new Error("Cobertura CNES incompleta.");
        const index = createHospitalIndex(records, { types, cities, sourceUpdatedAt, now });
        await publishHospitalIndex(index, directory);
        logger.info(JSON.stringify({ event: "cnes-index", result: "success", version: index.version,
            records: records.length, sourceCount, durationMs: Date.now() - started }));
        return index;
    } catch (error) {
        logger.error(JSON.stringify({ event: "cnes-index", result: "error", version: previous?.version ?? null, message: error.message, durationMs: Date.now() - started }));
        throw error;
    } finally { if (temporary) await rm(temporary, { recursive: true, force: true }); }
}

export async function runDailyHospitalUpdate({ update = updateHospitalIndex, sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay)), once = false } = {}) {
    do {
        try { await update(); } catch (error) { if (once) throw error; }
        if (once) return;
        await sleep(DAY);
    } while (true);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    await mkdir(INDEX_DIR, { recursive: true });
    await runDailyHospitalUpdate({ once: !process.argv.includes("--watch") });
}
