import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { createHospitalSearch } from "../app/services/hospitais-search.js";
import { searchHospitais } from "../app/services/hospitais.js";
import { HOSPITAIS_ERROR, HOSPITAIS_UNAVAILABLE } from "../app/services/hospitais-domain.js";

afterEach(() => mock.restoreAll());
const card = (id) => ({ cnes: String(id).padStart(7, "0"), name: `Hospital ${id}`, type: "HOSPITAL GERAL", address: "Brasília/DF", phone: "1234" });
const page = (ids, nextCursor = null) => ({ items: ids.map(card), nextCursor, indexDate: "2026-10-31T06:50:56.000Z" });
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; };

test("serviço usa rota interna, IBGE, cursor e AbortSignal", async () => {
    const controller = new AbortController();
    const fetchMock = mock.method(globalThis, "fetch", async () => Response.json(page([1])));
    const result = await searchHospitais({ name: "  São José  ", state: "DF", city: "5300108" }, { cursor: "abc", signal: controller.signal });
    assert.equal(result.items[0].cnes, "0000001");
    const [url, options] = fetchMock.mock.calls[0].arguments;
    assert.ok(url.startsWith("/api/hospitais?"));
    assert.deepEqual(Object.fromEntries(new URL(url, "http://localhost").searchParams), { name: "São José", state: "DF", city: "5300108", cursor: "abc" });
    assert.equal(options.signal, controller.signal);
});

test("serviço diferencia índice ausente, HTTP, esquema incompatível e cancelamento", async () => {
    for (const [response, message] of [[new Response("Falha", { status: 503 }), HOSPITAIS_UNAVAILABLE],
        [new Response("Falha", { status: 500 }), HOSPITAIS_ERROR], [Response.json([]), HOSPITAIS_ERROR],
        [Response.json({ ...page([1]), indexDate: "inválida" }), HOSPITAIS_ERROR], [Response.json({ ...page([1]), items: [{}] }), HOSPITAIS_ERROR]]) {
        mock.method(globalThis, "fetch", async () => response);
        await assert.rejects(searchHospitais({}), { message });
        mock.restoreAll();
    }
    mock.method(globalThis, "fetch", async () => { throw new DOMException("Cancelado", "AbortError"); });
    await assert.rejects(searchHospitais({}), { name: "AbortError" });
});

test("HOSP-06 continuação mantém filtros submetidos após edição do formulário", async () => {
    const calls = [];
    const search = createHospitalSearch(async (filters) => { calls.push(filters); return page([calls.length], calls.length === 1 ? "a" : null); });
    const filters = { name: "Santa", state: "DF", city: "5300108" };
    await search.submit(filters);
    filters.name = "Outro";
    await search.loadMore();
    assert.deepEqual(calls, [{ name: "Santa", state: "DF", city: "5300108" }, { name: "Santa", state: "DF", city: "5300108" }]);
});

test("HOSP-12 contagem cresce 20, 40 e 45 e nova pesquisa reinicia lista", async () => {
    let count = 0;
    const search = createHospitalSearch(async () => {
        const start = count++ * 20;
        return page(Array.from({ length: Math.max(0, Math.min(20, 45 - start)) }, (_, i) => start + i + 1), count < 3 ? String(count) : null);
    });
    await search.submit({});
    assert.equal(search.getSnapshot().items.length, 20);
    await search.loadMore();
    assert.equal(search.getSnapshot().items.length, 40);
    await search.loadMore();
    assert.equal(search.getSnapshot().items.length, 45);
    assert.equal(search.getSnapshot().nextCursor, null);
    await search.submit({ name: "Novo" });
    assert.equal(search.getSnapshot().items.length, 0);
});

test("HOSP-15 CNES com zeros equivalentes não duplicam cards", async () => {
    let count = 0;
    const search = createHospitalSearch(async () => ++count === 1 ? page([1, 2], "a") : { ...page([2, 3]), items: [{ ...card(2), cnes: "2" }, card(3)] });
    await search.submit({});
    await search.loadMore();
    assert.deepEqual(search.getSnapshot().items.map((r) => Number(r.cnes)), [1, 2, 3]);
});

test("HOSP-16 impede solicitações duplicadas na primeira página e continuação", async () => {
    let calls = 0;
    let pending = deferred();
    const search = createHospitalSearch(() => { calls++; return pending.promise; });
    const first = search.submit({ name: "a" });
    await search.submit({ name: "a" });
    assert.equal(calls, 1);
    assert.equal(search.getSnapshot().status, "loading");
    pending.resolve(page([1], "a"));
    await first;
    pending = deferred();
    const second = search.loadMore();
    await search.loadMore();
    assert.equal(calls, 2);
    assert.equal(search.getSnapshot().loadingMore, true);
    pending.resolve(page([2]));
    await second;
});

test("HOSP-18 falha adicional preserva cards, data e cursor para repetir", async () => {
    const cursors = [];
    const search = createHospitalSearch(async (_, { cursor }) => {
        cursors.push(cursor);
        if (cursors.length === 1) return page([1], "cursor-a");
        if (cursors.length === 2) throw new Error("Offline");
        return page([2]);
    });
    await search.submit({});
    const date = search.getSnapshot().indexDate;
    await search.loadMore();
    assert.deepEqual(search.getSnapshot().items, [card(1)]);
    assert.equal(search.getSnapshot().indexDate, date);
    assert.equal(search.getSnapshot().error, HOSPITAIS_ERROR);
    assert.equal(search.getSnapshot().nextCursor, "cursor-a");
    await search.loadMore();
    assert.deepEqual(cursors, [undefined, "cursor-a", "cursor-a"]);
    assert.equal(search.getSnapshot().items.length, 2);
    assert.equal(search.getSnapshot().error, "");
});

test("HOSP-23 descarta resposta atrasada de busca substituída ou desmontada", async () => {
    const pending = deferred();
    const signals = [];
    let calls = 0;
    const search = createHospitalSearch(async (_, { signal }) => { signals.push(signal); return ++calls === 1 ? pending.promise : page([2]); });
    const first = search.submit({ name: "a" });
    await search.submit({ name: "b" });
    assert.equal(signals[0].aborted, true);
    pending.resolve(page([1]));
    await first;
    assert.deepEqual(search.getSnapshot().items, [card(2)]);
    const late = deferred();
    const closing = createHospitalSearch(() => late.promise);
    const loading = closing.submit({});
    closing.cancel();
    late.resolve(page([3]));
    await loading;
    assert.equal(closing.getSnapshot().items.length, 0);
});
