import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { filterCorretoras, searchCorretoras } from "../app/services/corretoras.js";

afterEach(() => mock.restoreAll());

const brokers = [
    { cnpj: "02332886000104", nome_social: "XP INVESTIMENTOS CCTVM S.A.", nome_comercial: "XP INVESTIMENTOS", status: "EM FUNCIONAMENTO NORMAL" },
    { cnpj: "76621457000185", nome_social: "4UM DTVM S.A.", nome_comercial: "4UM INVESTIMENTOS", status: "CANCELADA" },
];

test("filtra pelo nome comercial ou pela razão social e ignora termos curtos", () => {
    assert.equal(filterCorretoras(brokers, "xp")[0].cnpj, "02332886000104");
    assert.equal(filterCorretoras(brokers, "dtvm")[0].status, "CANCELADA");
    assert.deepEqual(filterCorretoras(brokers, "a"), []);
});

test("pede ao menos dois caracteres antes de consultar a CVM", async () => {
    const fetchMock = mock.method(globalThis, "fetch", async () => Response.json(brokers));

    await assert.rejects(searchCorretoras("x"), { message: "Digite pelo menos 2 caracteres do nome da corretora." });
    assert.equal(fetchMock.mock.calls.length, 0);
});

test("consulta a lista da CVM na Brasil API", async () => {
    const fetchMock = mock.method(globalThis, "fetch", async () => Response.json(brokers));

    const result = await searchCorretoras("investimentos");

    assert.equal(result.total, 2);
    assert.match(String(fetchMock.mock.calls[0].arguments[0]), /\/api\/cvm\/corretoras\/v1$/);
});
