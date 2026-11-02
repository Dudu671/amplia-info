import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { filterHospitalCandidates, normalizeHospitalFilters, normalizeCnes } from "../app/services/hospitais-domain.js";
import { indexCandidate, loadHospitalIndex, publishHospitalIndex } from "../app/services/hospitais-index.server.js";
import { hospitalIndex, hospitalRecord } from "./helpers/hospitais.js";

test("HOSP-01 busca no índice inteiro e intersecta nome, UF e município", () => {
    const records = Array.from({ length: 30 }, (_, i) => hospitalRecord(i + 1));
    records.push(hospitalRecord(100, { name: "Santa Luzia", city: "350950" }));
    records.push(hospitalRecord(101, { name: "Santa Luzia", city: "530010", uf: "53" }));
    assert.deepEqual(filterHospitalCandidates(records, normalizeHospitalFilters({ name: "luzia", state: "SP", city: "3509502" })).map((r) => r.cnes), ["0000100"]);
    assert.equal(filterHospitalCandidates(records, normalizeHospitalFilters()).length, 32);
});

test("HOSP-02 busca ignora caixa, acentos e espaços extremos em fantasia e razão social", () => {
    const records = [hospitalRecord(1, { name: "São José" }), hospitalRecord(2, { legalName: "Fundação São José" })];
    for (const name of ["São José", "  SAO JOSE  ", "são josé"]) {
        assert.deepEqual(filterHospitalCandidates(records, normalizeHospitalFilters({ name })).map((r) => r.cnes), ["0000001", "0000002"]);
    }
    assert.equal(filterHospitalCandidates(records, normalizeHospitalFilters({ name: "sao fundacao" })).length, 0);
});

test("HOSP-03 homônimos mantêm seus CNES independentes e normalizam zeros", () => {
    const records = [hospitalRecord(1, { name: "Santa Casa" }), hospitalRecord(2, { name: "Santa Casa" })];
    assert.equal(filterHospitalCandidates(records, normalizeHospitalFilters({ name: "santa" })).length, 2);
    assert.equal(normalizeCnes(19), "0000019");
    assert.equal(normalizeCnes("0000019"), "0000019");
    assert.throws(() => normalizeCnes("../19"));
    assert.throws(() => hospitalIndex([hospitalRecord(19), hospitalRecord("0000019")]));
});

test("HOSP-25 índice inclui somente seis tipos oficiais ativos e rejeita esquema desconhecido", () => {
    const row = { CO_CNES: "19", NO_FANTASIA: "Unidade", NO_RAZAO_SOCIAL: "Entidade", CO_UF: "35", CO_IBGE: "355030", TP_UNIDADE: "5", CO_MOTIVO_DESAB: "" };
    for (const type of [1, 2, 5, 7, 62, 73]) assert.equal(indexCandidate({ ...row, TP_UNIDADE: String(type) }).type, type);
    for (const type of [4, 22, 67]) assert.equal(indexCandidate({ ...row, TP_UNIDADE: String(type) }), null);
    assert.equal(indexCandidate({ ...row, CO_MOTIVO_DESAB: "08" }), null);
    assert.throws(() => indexCandidate({ CO_CNES: 19 }), /Esquema/);
    assert.throws(() => indexCandidate({ ...row, CO_IBGE: "530010" }));
});

test("códigos IBGE de Brasília e São Paulo são convertidos para os seis dígitos CNES", () => {
    assert.equal(normalizeHospitalFilters({ state: "DF", city: "5300108" }).city, "530010");
    assert.equal(normalizeHospitalFilters({ state: "SP", city: "3550308" }).city, "355030");
    assert.throws(() => normalizeHospitalFilters({ state: "DF", city: "3550308" }));
    assert.throws(() => normalizeHospitalFilters({ state: "XX" }));
    assert.throws(() => normalizeHospitalFilters({ city: "São Paulo" }));
});

test("HOSP-27 publicação inválida mantém o último índice e a data; versões antigas permanecem acessíveis", async () => {
    const directory = await mkdtemp(join(tmpdir(), "hospitais-index-test-"));
    try {
        const a = hospitalIndex();
        await publishHospitalIndex(a, directory);
        await assert.rejects(publishHospitalIndex({ ...a, records: [] }, directory));
        await assert.rejects(publishHospitalIndex({ ...a, records: [hospitalRecord(3)] }, directory));
        assert.deepEqual(await loadHospitalIndex(undefined, directory), a);
        const b = hospitalIndex([hospitalRecord(2)], "2026-11-03T12:00:00.000Z");
        await publishHospitalIndex(b, directory);
        assert.equal((await loadHospitalIndex(undefined, directory)).version, b.version);
        assert.deepEqual(await loadHospitalIndex(a.version, directory), a);
        const manifest = JSON.parse(await readFile(join(directory, "current.json")));
        manifest.previous[0].expiresAt = 0;
        await writeFile(join(directory, "current.json"), JSON.stringify(manifest));
        await assert.rejects(loadHospitalIndex(a.version, directory), /temporariamente indisponível/);
    } finally { await rm(directory, { recursive: true, force: true }); }
});

test("HOSP-29 ausência ou corrupção do índice informa indisponibilidade", async () => {
    const directory = await mkdtemp(join(tmpdir(), "hospitais-missing-test-"));
    try {
        await assert.rejects(loadHospitalIndex(undefined, directory), /A pesquisa de hospitais está temporariamente indisponível/);
        const index = hospitalIndex();
        await publishHospitalIndex(index, directory);
        await writeFile(join(directory, `${index.version}.json`), "{inválido");
        await assert.rejects(loadHospitalIndex(undefined, directory), /temporariamente indisponível/);
        await assert.rejects(loadHospitalIndex("../../secrets", directory), /temporariamente indisponível/);
    } finally { await rm(directory, { recursive: true, force: true }); }
});
