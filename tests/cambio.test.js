import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { getCotacao, isoDateInSaoPaulo, listMoedas, selectCotacao, shiftIsoDate } from "../app/services/cambio.js";

afterEach(() => mock.restoreAll());

test("prefere o boletim de fechamento mais recente", () => {
    const cotacao = selectCotacao([
        { tipo_boletim: "ABERTURA", cotacao_compra: 1, cotacao_venda: 1.1 },
        { tipo_boletim: "FECHAMENTO PTAX", cotacao_compra: 5.42, cotacao_venda: 5.43 },
        { tipo_boletim: "INTERMEDIÁRIO", cotacao_compra: 5.1, cotacao_venda: 5.2 },
    ]);

    assert.equal(cotacao.cotacao_compra, 5.42);
    assert.equal(cotacao.tipo_boletim, "FECHAMENTO PTAX");
});

test("lista as moedas disponíveis para a PTAX", async () => {
    mock.method(globalThis, "fetch", async () => Response.json([
        { simbolo: "USD", nome: "Dólar dos Estados Unidos" },
        { simbolo: "EUR", nome: "Euro" },
        { simbolo: "", nome: "Inválida" },
    ]));

    assert.deepEqual(await listMoedas(), [
        { symbol: "EUR", name: "Euro" },
        { symbol: "USD", name: "Dólar dos Estados Unidos" },
    ]);
});

test("começa pelo dia anterior e recua quando a data não tem cotação", async () => {
    const yesterday = shiftIsoDate(isoDateInSaoPaulo(), -1);
    const dayBefore = shiftIsoDate(yesterday, -1);
    const urls = [];
    mock.method(globalThis, "fetch", async (url) => {
        urls.push(String(url));
        if (urls.length === 1) return new Response("sem cotação", { status: 404 });
        return Response.json({
            moeda: "USD",
            data: dayBefore,
            cotacoes: [{ tipo_boletim: "FECHAMENTO PTAX", cotacao_compra: 5.42, cotacao_venda: 5.43 }],
        });
    });

    const quote = await getCotacao("USD");

    assert.equal(quote.currency, "USD");
    assert.equal(quote.date, dayBefore);
    assert.equal(quote.buy, 5.42);
    assert.equal(quote.sell, 5.43);
    assert.ok(urls[0].endsWith(`/USD/${yesterday}`));
    assert.ok(urls[1].endsWith(`/USD/${dayBefore}`));
});

test("não apresenta falha de rede como falta de cotação", async () => {
    mock.method(globalThis, "fetch", async () => { throw new TypeError("Failed to fetch"); });

    await assert.rejects(getCotacao("USD"), { message: "Não foi possível consultar o câmbio." });
});
