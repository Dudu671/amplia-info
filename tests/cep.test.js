import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { formatAddressLine, normalizeAddress, rankAddresses, searchEnderecos, toViaCepSegment } from "../app/services/cep.js";

afterEach(() => mock.restoreAll());

test("ordena o logradouro mais próximo e descarta endereço incompleto", () => {
    const addresses = rankAddresses([
        normalizeAddress({ cep: "08190-461", logradouro: "Viela Paulista", bairro: "Vila Itaim", localidade: "São Paulo", uf: "SP", ddd: "11" }),
        normalizeAddress({ cep: "01310-000", logradouro: "Avenida Paulista", complemento: "até 610 - lado par", bairro: "Bela Vista", localidade: "São Paulo", uf: "SP", ddd: "11" }),
        normalizeAddress({ cep: "", logradouro: "Sem CEP" }),
    ].filter(Boolean), "Paulista");

    assert.deepEqual(addresses.map((address) => address.cep), ["01310-000", "08190-461"]);
    assert.equal(formatAddressLine(addresses[0]), "Avenida Paulista · até 610 - lado par · Bela Vista · São Paulo/SP");
    assert.equal(toViaCepSegment("São Paulo"), "Sao%20Paulo");
});

test("busca o logradouro na ViaCEP e trata lista vazia", async () => {
    const urls = [];
    mock.method(globalThis, "fetch", async (url) => {
        urls.push(String(url));
        if (urls.length === 1) {
            return Response.json([{ cep: "01310-000", logradouro: "Avenida Paulista", bairro: "Bela Vista", localidade: "São Paulo", uf: "SP", ddd: "11" }]);
        }
        return Response.json([]);
    });

    const found = await searchEnderecos("SP", "São Paulo", "Paulista");
    assert.equal(found.addresses[0].cep, "01310-000");
    assert.equal(found.limited, false);
    assert.match(urls[0], /\/ws\/SP\/Sao%20Paulo\/Paulista\/json\/$/);

    const missing = await searchEnderecos("SP", "São Paulo", "zzzzzz");
    assert.deepEqual(missing.addresses, []);
});

test("pede ao menos três letras antes de consultar", async () => {
    await assert.rejects(searchEnderecos("SP", "São Paulo", "ab"), { message: "Digite pelo menos 3 letras do logradouro." });
});
