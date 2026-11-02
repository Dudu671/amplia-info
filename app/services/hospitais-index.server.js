import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { HOSPITAIS_TYPES, HOSPITAIS_UNAVAILABLE, normalizeCnes, UF_CODES } from "./hospitais-domain.js";

export const CNES_SOURCE = "https://s3.sa-east-1.amazonaws.com/ckan.saude.gov.br/CNES/cnes_estabelecimentos_json.zip";
export const INDEX_DIR = resolve(process.env.HOSPITAIS_INDEX_DIR || "data/hospitais");
const requiredColumns = ["CO_CNES", "NO_FANTASIA", "NO_RAZAO_SOCIAL", "CO_UF", "CO_IBGE", "TP_UNIDADE", "CO_MOTIVO_DESAB"];
const validUfs = new Set(Object.values(UF_CODES));

export function indexCandidate(row) {
    if (!row || requiredColumns.some((column) => !Object.hasOwn(row, column))) throw new Error("Esquema CNES incompatível.");
    const cnes = normalizeCnes(row.CO_CNES);
    const uf = String(row.CO_UF).trim();
    const city = String(row.CO_IBGE).trim();
    const type = Number(row.TP_UNIDADE);
    if (!validUfs.has(uf) || !/^\d{6}$/.test(city) || !city.startsWith(uf) || !Number.isInteger(type) || type <= 0) {
        throw new Error("Localidade ou tipo CNES inválido.");
    }
    if (String(row.CO_MOTIVO_DESAB ?? "").trim() || !HOSPITAIS_TYPES.includes(type)) return null;
    return { cnes, name: String(row.NO_FANTASIA ?? "").trim(), legalName: String(row.NO_RAZAO_SOCIAL ?? "").trim(), uf, city, type };
}

export function validateHospitalIndex(index) {
    if (index?.schema !== 1 || !/^[a-f0-9]{64}$/.test(index.version) || !Number.isFinite(Date.parse(index.updatedAt))
        || !Number.isFinite(Date.parse(index.sourceUpdatedAt)) || index.source !== CNES_SOURCE
        || !Array.isArray(index.records) || !index.records.length || !index.types || !index.cities) throw new Error("Índice CNES inválido.");
    const seen = new Set();
    for (const record of index.records) {
        if (normalizeCnes(record.cnes) !== record.cnes || seen.has(record.cnes) || !validUfs.has(record.uf)
            || !/^\d{6}$/.test(record.city) || !record.city.startsWith(record.uf)
            || !HOSPITAIS_TYPES.includes(record.type) || typeof record.name !== "string" || typeof record.legalName !== "string"
            || !index.types[record.type] || !index.cities[record.city]) throw new Error("Integridade CNES inválida.");
        seen.add(record.cnes);
    }
    const { version, ...content } = index;
    if (createHash("sha256").update(JSON.stringify(content)).digest("hex") !== version) throw new Error("Checksum CNES inválido.");
    return index;
}

export function createHospitalIndex(records, { types, cities, sourceUpdatedAt, now = new Date() }) {
    const unique = new Map();
    for (const record of records) {
        if (unique.has(record.cnes)) throw new Error("CNES duplicado na carga.");
        unique.set(record.cnes, record);
    }
    const content = { schema: 1, updatedAt: now.toISOString(), sourceUpdatedAt, source: CNES_SOURCE,
        types, cities, records: [...unique.values()].sort((a, b) => a.cnes.localeCompare(b.cnes)) };
    return validateHospitalIndex({ version: createHash("sha256").update(JSON.stringify(content)).digest("hex"), ...content });
}

async function atomicJson(path, data) {
    const temporary = `${path}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(data));
    await rename(temporary, path);
}

export async function publishHospitalIndex(index, directory = INDEX_DIR) {
    validateHospitalIndex(index);
    await mkdir(directory, { recursive: true });
    let manifest = { current: null, previous: [] };
    try { manifest = JSON.parse(await readFile(resolve(directory, "current.json"), "utf8")); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    // O manifesto só muda depois de o snapshot completo estar persistido.
    await atomicJson(resolve(directory, `${index.version}.json`), index);
    const now = Date.now();
    const previous = manifest.previous.filter((entry) => entry.expiresAt > now && entry.version !== index.version);
    if (manifest.current && manifest.current !== index.version) previous.push({ version: manifest.current, expiresAt: now + 48 * 60 * 60 * 1000 });
    await atomicJson(resolve(directory, "current.json"), { current: index.version, previous });
}

export async function loadHospitalIndex(version, directory = INDEX_DIR) {
    try {
        const manifest = JSON.parse(await readFile(resolve(directory, "current.json"), "utf8"));
        const selected = version || manifest.current;
        if (!/^[a-f0-9]{64}$/.test(selected) || (selected !== manifest.current
            && !manifest.previous.some((entry) => entry.version === selected && entry.expiresAt > Date.now()))) throw new Error("Versão expirada.");
        return validateHospitalIndex(JSON.parse(await readFile(resolve(directory, `${selected}.json`), "utf8")));
    } catch (cause) {
        throw new Error(HOSPITAIS_UNAVAILABLE, { cause });
    }
}
