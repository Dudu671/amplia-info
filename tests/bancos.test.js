import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { filterBancos, searchBancos } from "../app/services/bancos.js";

afterEach(() => mock.restoreAll());

const banks = [
    { ispb: "00000000", name: "BCO DO BRASIL S.A.", code: 1, fullName: "Banco do Brasil S.A." },
    { ispb: "60746948", name: "BCO BRADESCO S.A.", code: 237, fullName: "Banco Bradesco S.A." },
    { ispb: "60701190", name: "ITAÚ UNIBANCO S.A.", code: 341, fullName: "ITAÚ UNIBANCO S.A." },
];

test("encontra banco pelo nome, pelo código e pelo ISPB", () => {
    assert.equal(filterBancos(banks, "itau")[0].code, 341);
    assert.equal(filterBancos(banks, "001")[0].ispb, "00000000");
    assert.equal(filterBancos(banks, "60746948")[0].code, 237);
    assert.deepEqual(filterBancos(banks, "1").map((bank) => bank.code), [1]);
});

test("busca a lista da Brasil API e limita os resultados exibidos", async () => {
    const many = Array.from({ length: 25 }, (_, index) => ({
        ispb: String(index).padStart(8, "0"),
        name: `BANCO TESTE ${index}`,
        code: index + 1,
        fullName: `Banco Teste ${index}`,
    }));
    const fetchMock = mock.method(globalThis, "fetch", async () => Response.json(many));

    const result = await searchBancos("banco teste");

    assert.equal(result.total, 25);
    assert.equal(result.items.length, 20);
    assert.equal(result.items[0].code, 1);
    assert.match(String(fetchMock.mock.calls[0].arguments[0]), /\/api\/banks\/v1$/);
});
