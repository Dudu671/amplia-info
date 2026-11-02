import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { handleHospitalRequest, mapHospitalDetail, searchHospitalPage } from "../app/services/hospitais-search.server.js";
import { HOSPITAIS_ERROR, HOSPITAIS_UNAVAILABLE } from "../app/services/hospitais-domain.js";
import { hospitalDetail, hospitalIndex, hospitalRecord } from "./helpers/hospitais.js";

afterEach(() => mock.restoreAll());
const records = Array.from({ length: 45 }, (_, i) => hospitalRecord(i + 1));
const index = hospitalIndex(records);
const options = { loadIndex: async () => index, getDetail: async (cnes) => hospitalDetail(cnes) };

test("HOSP-07 consulta cada CNES da página na API do Ministério e limita concorrência a quatro", async () => {
    let active = 0;
    let maximum = 0;
    const calls = [];
    mock.method(globalThis, "fetch", async (url, { signal }) => {
        calls.push(String(url));
        assert.ok(signal instanceof AbortSignal);
        maximum = Math.max(maximum, ++active);
        await new Promise((resolve) => setTimeout(resolve, 1));
        active--;
        return Response.json(hospitalDetail(String(url).split("/").at(-1)));
    });
    const result = await searchHospitalPage({}, { loadIndex: options.loadIndex });
    assert.equal(result.items.length, 20);
    assert.equal(calls.length, 20);
    assert.match(calls[0], /^https:\/\/apidadosabertos.saude.gov.br\/cnes\/estabelecimentos\/0000001$/);
    assert.equal(maximum, 4);
    assert.equal(result.items[0].name, "Hospital 0000001");
});

test("HOSP-08 mapeia campos oficiais, nome alternativo, ausências e telefone sem inventar DDD", () => {
    const card = mapHospitalDetail(hospitalDetail(1), records[0], index);
    assert.deepEqual(card, { cnes: "0000001", name: "Hospital 1", type: "HOSPITAL GERAL", address: "Rua Saúde, 12 - Centro - São Paulo/SP - CEP 01001000", phone: "1234-5678" });
    const alternative = mapHospitalDetail(hospitalDetail(1, { nome_fantasia: " ", endereco_estabelecimento: null,
        numero_estabelecimento: null, bairro_estabelecimento: null, codigo_cep_estabelecimento: null, numero_telefone_estabelecimento: null }), records[0], index);
    assert.equal(alternative.name, "Razão social");
    assert.equal(alternative.address, "São Paulo/SP");
    assert.equal(alternative.phone, "");
    assert.equal(mapHospitalDetail(hospitalDetail(1, { nome_fantasia: null, nome_razao_social: null }), records[0], index).name, "Hospital sem nome informado");
    assert.equal(mapHospitalDetail(hospitalDetail(1, { codigo_tipo_unidade: 73 }), records[0], index).type, "PRONTO ATENDIMENTO");
    assert.throws(() => mapHospitalDetail(hospitalDetail(2), records[0], index));
    assert.throws(() => mapHospitalDetail(hospitalDetail(1, { codigo_motivo_desabilitacao_estabelecimento: "08" }), records[0], index));
});

test("HOSP-13 primeira página contém até 20; pesquisa vazia é sucesso sem detalhes", async () => {
    const first = await searchHospitalPage({}, options);
    assert.equal(first.items.length, 20);
    assert.equal(first.items[0].cnes, "0000001");
    const empty = await searchHospitalPage({ name: "não existe" }, { ...options, getDetail: () => assert.fail("Não deve consultar detalhes") });
    assert.deepEqual(empty, { items: [], nextCursor: null, indexDate: index.sourceUpdatedAt });
});

test("HOSP-14 continuação usa a versão do cursor mesmo após publicar índice novo", async () => {
    const first = await searchHospitalPage({}, options);
    const newer = hospitalIndex([hospitalRecord(100)], "2026-11-03T12:00:00.000Z");
    const requested = [];
    const second = await searchHospitalPage({}, { ...options, cursor: first.nextCursor, loadIndex: async (version) => {
        requested.push(version);
        return version === index.version ? index : newer;
    } });
    assert.deepEqual(requested, [index.version]);
    assert.equal(second.items[0].cnes, "0000021");
    assert.equal(second.items.length, 20);
    assert.equal(second.indexDate, first.indexDate);
    await assert.rejects(searchHospitalPage({ name: "outro" }, { ...options, cursor: first.nextCursor }));
    await assert.rejects(searchHospitalPage({}, { ...options, cursor: first.nextCursor, now: Date.now() + 25 * 3600000 }));
    await assert.rejects(searchHospitalPage({}, { ...options, cursor: "inválido" }));
});

test("HOSP-17 percorre exatamente 45 unidades em 20, 20 e 5 sem próxima página", async () => {
    const first = await searchHospitalPage({}, options);
    const second = await searchHospitalPage({}, { ...options, cursor: first.nextCursor });
    const third = await searchHospitalPage({}, { ...options, cursor: second.nextCursor });
    assert.deepEqual([first.items.length, second.items.length, third.items.length], [20, 20, 5]);
    assert.equal(new Set([...first.items, ...second.items, ...third.items].map((r) => r.cnes)).size, 45);
    assert.equal(third.nextCursor, null);
});

test("HOSP-22 falhas HTTP, JSON incompatível e timeout rejeitam o lote inteiro", async () => {
    for (const response of [new Response("Erro", { status: 503 }), Response.json({ resultados: [] }), new Response("<html>Erro</html>")]) {
        mock.method(globalThis, "fetch", async () => response.clone());
        await assert.rejects(searchHospitalPage({}, { loadIndex: options.loadIndex }), { message: HOSPITAIS_ERROR });
        mock.restoreAll();
    }
    await assert.rejects(searchHospitalPage({}, { ...options, getDetail: async (cnes) => {
        if (cnes === "0000002") throw new Error("HTTP 500");
        return hospitalDetail(cnes);
    } }), { message: HOSPITAIS_ERROR });
    // Mantém o event loop ativo enquanto o AbortSignal.timeout dispara.
    const keepAlive = setTimeout(() => {}, 1000);
    try {
        await assert.rejects(searchHospitalPage({}, { loadIndex: options.loadIndex, timeoutMs: 1,
            getDetail: async (_, signal) => new Promise((resolve, reject) => signal.addEventListener("abort", () => reject(signal.reason), { once: true })) }), { message: HOSPITAIS_ERROR });
    } finally { clearTimeout(keepAlive); }
});

test("endpoint encaminha filtros e cancelamento e devolve erros públicos sem detalhes técnicos", async () => {
    const request = new Request("http://localhost/api/hospitais?name=Santa&state=SP&city=3550308&cursor=abc");
    const response = await handleHospitalRequest(request, async (filters, args) => {
        assert.deepEqual(filters, { name: "Santa", state: "SP", city: "3550308" });
        assert.equal(args.cursor, "abc");
        assert.equal(args.signal, request.signal);
        return { items: [], nextCursor: null, indexDate: index.sourceUpdatedAt };
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal((await response.json()).items.length, 0);
    const missing = await handleHospitalRequest(new Request("http://localhost/api/hospitais"), async () => { throw new Error(HOSPITAIS_UNAVAILABLE); });
    assert.equal(missing.status, 503);
    assert.deepEqual(await missing.json(), { message: HOSPITAIS_UNAVAILABLE });
    const failed = await handleHospitalRequest(request, async () => { throw new Error("senha e stack privados"); });
    assert.equal(failed.status, 502);
    assert.deepEqual(await failed.json(), { message: HOSPITAIS_ERROR });
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(searchHospitalPage({}, { ...options, signal: controller.signal }), { name: "AbortError" });
});
