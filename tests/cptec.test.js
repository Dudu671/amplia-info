import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { chooseCities, chooseLocation, describeUv, forecastDayTitle, formatHumidity, formatObservationTime, formatWind, getPrevisao, getTemperaturaAtual, normalizeCurrentTemperature, normalizeForecast, searchCidades, weatherIconKind } from "../app/services/cptec.js";

afterEach(() => mock.restoreAll());

test("prefere a cidade com o nome exato e descreve o dia da previsão", () => {
    const cities = [
        { nome: "São Paulo", id: 1, estado: "SP" },
        { nome: "São Paulo do Potengi", id: 2, estado: "RN" },
    ];

    assert.deepEqual(chooseCities(cities, "sao paulo").map((city) => city.id), [1]);
    assert.equal(forecastDayTitle("2026-11-02", "2026-11-02"), "Hoje");
    assert.equal(forecastDayTitle("2026-11-03", "2026-11-02"), "Amanhã");
    assert.equal(forecastDayTitle("2026-11-04", "2026-11-02"), "Quarta-feira");
});

test("omite o índice UV quando ele não vem informado e encurta a condição", () => {
    assert.equal(describeUv(0), null);
    assert.deepEqual(describeUv(8), { value: 8, level: "Muito Alto" });
    assert.equal(weatherIconKind("pn"), "partly");
    assert.equal(weatherIconKind("c"), "rain");
    assert.equal(weatherIconKind("ps"), "sun");

    const forecast = normalizeForecast({
        cidade: "Ribeirão Preto",
        estado: "SP",
        atualizado_em: "2026-11-02",
        clima: [{ data: "2026-11-03", condicao: "pn", condicao_desc: "Parcialmente Nublado", min: 20, max: 32, indice_uv: 0 }],
    });

    assert.equal(forecast.days[0].shortCondition, "Parc. nublado");
    assert.equal(forecast.days[0].uv, null);
    assert.equal(forecast.updatedAt, "2026-11-02");
});

test("busca a cidade e a previsão de seis dias na Brasil API", async () => {
    const urls = [];
    mock.method(globalThis, "fetch", async (url) => {
        urls.push(String(url));
        if (urls.length === 1) return Response.json([{ nome: "Ribeirão Preto", id: 4355, estado: "SP" }]);
        return Response.json({
            cidade: "Ribeirão Preto",
            estado: "SP",
            atualizado_em: "2026-11-02",
            clima: [{ data: "2026-11-03", condicao: "pn", condicao_desc: "Parcialmente Nublado", min: 20, max: 32, indice_uv: 0 }],
        });
    });

    assert.equal((await searchCidades("Ribeirão Preto"))[0].id, 4355);
    assert.equal((await getPrevisao(4355)).city, "Ribeirão Preto");
    assert.match(urls[0], /\/cptec\/v1\/cidade\/Ribeir%C3%A3o%20Preto$/);
    assert.match(urls[1], /\/cptec\/v1\/clima\/previsao\/4355\/6$/);
});

test("escolhe a cidade no estado certo e formata a temperatura atual", () => {
    const results = [
        { name: "Ouro", country_code: "BR", admin1: "Santa Catarina", latitude: -27.3, longitude: -51.6 },
        { name: "Ouro", country_code: "BR", admin1: "Rio Grande do Norte", latitude: -6.7, longitude: -35.3 },
    ];

    assert.equal(chooseLocation(results, "Ouro", "SC").admin1, "Santa Catarina");
    assert.equal(chooseLocation(results, "Ouro", "BA"), null);
    assert.equal(formatHumidity(45.4), "45%");
    assert.equal(formatWind(12.2, 40), "12 km/h NE");
    assert.deepEqual(normalizeCurrentTemperature({
        current: {
            temperature_2m: 25.6,
            time: "2026-11-02T16:15",
            relative_humidity_2m: 45,
            wind_speed_10m: 12.2,
            wind_direction_10m: 40,
            uv_index: 8.2,
            weather_code: 0,
        },
    }), {
        temperature: 26,
        observedAt: "2026-11-02T16:15",
        humidity: "45%",
        wind: "12 km/h NE",
        uv: { value: 8, level: "Muito Alto" },
        condition: "Ensolarado",
        conditionCode: "ps",
    });
    assert.equal(formatObservationTime("2026-11-02T16:15"), "16:15");
    assert.equal(normalizeCurrentTemperature({ current: {} }), null);
});

test("consulta a temperatura atual pelas coordenadas da cidade", async () => {
    const urls = [];
    mock.method(globalThis, "fetch", async (url) => {
        urls.push(String(url));
        if (urls.length === 1) {
            return Response.json({ results: [{ name: "Ribeirão Preto", country_code: "BR", admin1: "São Paulo", latitude: -21.18, longitude: -47.81 }] });
        }
        return Response.json({ current: { temperature_2m: 25, time: "2026-11-02T16:15", relative_humidity_2m: 45, wind_speed_10m: 12, wind_direction_10m: 40, uv_index: 8, weather_code: 0 } });
    });

    assert.equal((await getTemperaturaAtual({ nome: "Ribeirão Preto", estado: "SP" })).humidity, "45%");
    assert.match(urls[0], /geocoding-api\.open-meteo\.com/);
    assert.match(urls[1], /latitude=-21\.18&longitude=-47\.81/);
    assert.match(urls[1], /relative_humidity_2m/);
    assert.match(urls[1], /wind_speed_unit=kmh/);
});

test("trata cidade inexistente como lista vazia", async () => {
    mock.method(globalThis, "fetch", async () => new Response("{}", { status: 404 }));

    assert.deepEqual(await searchCidades("zzz"), []);
});

test("não trata uma previsão vazia como resultado", async () => {
    mock.method(globalThis, "fetch", async () => Response.json({ cidade: "Ribeirão Preto", clima: [] }));

    await assert.rejects(getPrevisao(4355), { message: "Não há previsão disponível para esta cidade." });
});
