import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { crc32 } from "node:zlib";
import { test } from "node:test";
import { buildCityDictionary, readCnesArchive, runDailyHospitalUpdate, updateHospitalIndex } from "../scripts/update-hospitais-index.js";
import { loadHospitalIndex, publishHospitalIndex } from "../app/services/hospitais-index.server.js";
import { hospitalIndex, hospitalRecord } from "./helpers/hospitais.js";
import { UF_CODES } from "../app/services/hospitais-domain.js";

function archiveBuffer(content, name = "cnes_estabelecimentos.json") {
    const data = Buffer.from(content);
    const filename = Buffer.from(name);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50);
    header.writeUInt16LE(20, 4);
    header.writeUInt32LE(crc32(data), 14);
    header.writeUInt32LE(data.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(filename.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(crc32(data), 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(filename.length, 28);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50);
    end.writeUInt16LE(1, 8);
    end.writeUInt16LE(1, 10);
    end.writeUInt32LE(central.length + filename.length, 12);
    end.writeUInt32LE(header.length + filename.length + data.length, 16);
    return Buffer.concat([header, filename, data, central, filename, end]);
}

test("importador lê o array oficial em fluxo e rejeita JSON truncado ou ZIP incompatível", async () => {
    const directory = await mkdtemp(join(tmpdir(), "hospitais-zip-test-"));
    try {
        const archive = join(directory, "source.zip");
        await writeFile(archive, archiveBuffer('[{"CO_CNES":"19"},{"CO_CNES":"27"}]'));
        const rows = [];
        for await (const row of readCnesArchive(archive)) rows.push(row);
        assert.deepEqual(rows, [{ CO_CNES: "19" }, { CO_CNES: "27" }]);
        for (const [json, name] of [['[{"CO_CNES":"19"}', "cnes_estabelecimentos.json"], ["[]", "outro.json"]]) {
            await writeFile(archive, archiveBuffer(json, name));
            await assert.rejects(async () => { for await (const row of readCnesArchive(archive)) assert.ok(row); });
        }
    } finally { await rm(directory, { recursive: true, force: true }); }
});

test("HOSP-26 worker executa atualização inicial e diária, inclusive após falha", async () => {
    const events = [];
    const stopped = new Error("Fim do teste");
    await assert.rejects(runDailyHospitalUpdate({
        update: async () => { events.push("update"); if (events.length === 1) throw new Error("Fonte offline"); },
        sleep: async (delay) => { events.push(delay); if (events.length >= 4) throw stopped; },
    }), (error) => error === stopped);
    assert.deepEqual(events, ["update", 86400000, "update", 86400000]);
});

test("atualização com falha de download conserva índice e registra resultado e duração", async () => {
    const directory = await mkdtemp(join(tmpdir(), "hospitais-update-test-"));
    const errors = [];
    try {
        const index = hospitalIndex();
        await publishHospitalIndex(index, directory);
        await assert.rejects(updateHospitalIndex({ directory, fetchImpl: async () => new Response("Falha", { status: 503 }),
            logger: { error: (value) => errors.push(JSON.parse(value)) } }), /HTTP 503/);
        assert.deepEqual(await loadHospitalIndex(undefined, directory), index);
        assert.equal(errors[0].result, "error");
        assert.equal(typeof errors[0].durationMs, "number");
        await assert.rejects(runDailyHospitalUpdate({ once: true, update: async () => { throw new Error("Erro"); } }), /Erro/);
    } finally { await rm(directory, { recursive: true, force: true }); }
});

test("carga truncada não publica índice incompleto e dicionário IBGE rejeita incompatibilidades", async () => {
    const directory = await mkdtemp(join(tmpdir(), "hospitais-truncated-test-"));
    try {
        const index = hospitalIndex();
        await publishHospitalIndex(index, directory);
        const archive = join(directory, "source.zip");
        await writeFile(archive, archiveBuffer("[]"));
        await assert.rejects(updateHospitalIndex({ directory, archive, sourceUpdatedAt: index.sourceUpdatedAt,
            types: index.types, cities: index.cities, logger: { error() {} } }), /Cobertura/);
        assert.equal((await loadHospitalIndex(undefined, directory)).version, index.version);
        assert.deepEqual(buildCityDictionary([{ id: 5300108, nome: "Brasília" }, { id: 3550308, nome: "São Paulo" }]), { 530010: "Brasília", 355030: "São Paulo" });
        assert.throws(() => buildCityDictionary([{ id: 123, nome: "Inválido" }]));
    } finally { await rm(directory, { recursive: true, force: true }); }
});

test("HOSP-27 carga nacional que perde mais de 20% dos candidatos preserva a versão anterior", async () => {
    const directory = await mkdtemp(join(tmpdir(), "hospitais-coverage-test-"));
    try {
        const previous = hospitalIndex(Array.from({ length: 20000 }, (_, i) => hospitalRecord(i + 1)));
        await publishHospitalIndex(previous, directory);
        const ufs = Object.values(UF_CODES);
        // A carga ainda supera todos os mínimos nacionais: 100 mil registros,
        // 11 mil candidatos e 27 UFs. Mesmo assim perde 45% da base anterior.
        const active = Array.from({ length: 11000 }, (_, i) => {
            const uf = ufs[i % ufs.length];
            return { CO_CNES: String(i + 1), NO_FANTASIA: `Hospital ${i + 1}`, NO_RAZAO_SOCIAL: "Entidade",
                CO_UF: uf, CO_IBGE: `${uf}0000`, TP_UNIDADE: "5", CO_MOTIVO_DESAB: "" };
        });
        const excluded = { ...active[0], TP_UNIDADE: "4" };
        const archive = join(directory, "national.zip");
        await writeFile(archive, archiveBuffer(JSON.stringify([...active, ...Array(89000).fill(excluded)])));
        const cities = Object.fromEntries(ufs.map((uf) => [`${uf}0000`, `Município de teste ${uf}`]));
        await assert.rejects(updateHospitalIndex({ directory, archive, sourceUpdatedAt: previous.sourceUpdatedAt,
            types: previous.types, cities, logger: { error() {}, info() {} } }), /Cobertura CNES incompleta/);
        const current = await loadHospitalIndex(undefined, directory);
        assert.equal(current.version, previous.version);
        assert.equal(current.sourceUpdatedAt, previous.sourceUpdatedAt);
        assert.equal(current.records.length, 20000);
    } finally { await rm(directory, { recursive: true, force: true }); }
});
