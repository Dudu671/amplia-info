import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { compareYearOptions, formatModelYear, formatYearLabel, getPreco, listAnos, listMarcas, listModelos, toFipeOptions } from "../app/services/fipe.js";

afterEach(() => mock.restoreAll());

test("ordena as opções pelo rótulo e descarta itens incompletos", () => {
    assert.deepEqual(toFipeOptions([
        { nome: "Fiat", valor: "21" },
        { nome: "Agrale", valor: 2 },
        { nome: "", valor: "3" },
    ], "nome"), [
        { value: "2", label: "Agrale" },
        { value: "21", label: "Fiat" },
    ]);
    assert.equal(toFipeOptions({ message: "erro" }, "nome"), null);
});

test("lista marcas, modelos e anos na ordem da consulta", async () => {
    const urls = [];
    mock.method(globalThis, "fetch", async (url) => {
        urls.push(String(url));
        if (urls.length === 1) return Response.json([{ nome: "Fiat", valor: "21" }]);
        if (urls.length === 2) return Response.json([{ modelo: "147 C/ CL", valor: "437" }]);
        return Response.json([
            { nome: "2026", valor: "2026-3" },
            { nome: "32000", valor: "32000-3" },
        ]);
    });

    assert.deepEqual(await listMarcas("carros"), [{ value: "21", label: "Fiat" }]);
    assert.deepEqual(await listModelos("carros", "21"), [{ value: "437", label: "147 C/ CL" }]);
    assert.deepEqual(await listAnos("carros", "21", "437"), [
        { value: "32000-3", label: "Zero KM" },
        { value: "2026-3", label: "2026" },
    ]);
    assert.equal(formatYearLabel("32000 Diesel", "32000-3"), "Zero KM Diesel");
    assert.ok(compareYearOptions({ value: "2020-5", label: "2020 Flex" }, { value: "1987-1", label: "1987 Gasolina" }) < 0);
    assert.match(urls[0], /\/fipe\/marcas\/v1\/carros$/);
    assert.match(urls[1], /\/fipe\/veiculos\/v1\/carros\/21$/);
    assert.match(urls[2], /\/fipe\/anos\/v1\/carros\/21\/437$/);
});

test("consulta o preço e preserva o mês de referência sem espaços extras", async () => {
    const fetchMock = mock.method(globalThis, "fetch", async () => Response.json({
        valor: "R$ 6.155,00",
        marca: "Fiat",
        modelo: "147 C/ CL",
        anoModelo: 1987,
        combustivel: "Gasolina",
        codigoFipe: "001124-0",
        mesReferencia: "novembro de 2026 ",
    }));

    const price = await getPreco("carros", "21", "437", "1987-1");

    assert.equal(price.price, "R$ 6.155,00");
    assert.equal(price.referenceMonth, "novembro de 2026");
    assert.equal(formatModelYear(price.modelYear, "1987 Gasolina"), "1987");
    assert.equal(formatModelYear(32000, "Zero KM Gasolina"), "Zero KM Gasolina");
    assert.equal(formatModelYear(32000, "32000"), "Zero KM");
    assert.match(String(fetchMock.mock.calls[0].arguments[0]), /\/fipe\/detalhes\/v1\/carros\/21\/437\/1987-1$/);
});

test("não trata uma resposta inválida como lista vazia", async () => {
    mock.method(globalThis, "fetch", async () => Response.json({ message: "erro" }));

    await assert.rejects(listMarcas("carros"), { message: "Não foi possível carregar as marcas." });
});
