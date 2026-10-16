import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { getJson } from "../app/services/http.js";

afterEach(() => mock.restoreAll());

test("retorna os dados JSON e encaminha o sinal de cancelamento", async () => {
    const controller = new AbortController();
    const fetchMock = mock.method(globalThis, "fetch", async () => Response.json([{ id: 1 }]));

    const data = await getJson("https://example.com/dados", { signal: controller.signal });

    assert.deepEqual(data, [{ id: 1 }]);
    assert.equal(fetchMock.mock.calls[0].arguments[1].signal, controller.signal);
    assert.equal(fetchMock.mock.calls[0].arguments[1].headers.Accept, "application/json");
});

test("não apresenta falhas de rede como resultados vazios", async () => {
    mock.method(globalThis, "fetch", async () => { throw new TypeError("Failed to fetch"); });

    await assert.rejects(getJson("https://example.com/dados", { errorMessage: "Consulta indisponível." }), {
        message: "Consulta indisponível.",
    });
});

test("rejeita respostas HTTP com erro", async () => {
    mock.method(globalThis, "fetch", async () => new Response("Falha", { status: 503 }));

    await assert.rejects(getJson("https://example.com/dados"), { message: "Não foi possível carregar os dados." });
});

test("rejeita JSON inválido sem expor a mensagem técnica", async () => {
    mock.method(globalThis, "fetch", async () => new Response("<html>Erro</html>"));

    await assert.rejects(getJson("https://example.com/dados"), { message: "Não foi possível carregar os dados." });
});

test("preserva cancelamentos para que a tela ignore requisições antigas", async () => {
    const abortError = new DOMException("Requisição cancelada", "AbortError");
    mock.method(globalThis, "fetch", async () => { throw abortError; });

    await assert.rejects(getJson("https://example.com/dados"), (error) => error === abortError);
});
