import { getJson } from "./http.js";
import { BRASIL_API_URL } from "./brasilapi.js";
import { normalizeText } from "../utils/text.js";

const CPTEC_URL = `${BRASIL_API_URL}/cptec/v1`;
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const STATE_NAMES = {
    AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará",
    DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso",
    MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
    PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo",
    SE: "Sergipe", TO: "Tocantins",
};
const SHORT_CONDITIONS = {
    "Parcialmente Nublado": "Parc. nublado",
    "Predomínio de Sol": "Sol",
    "Pancadas de Chuva": "Pancadas",
    "Chuvas Isoladas": "Chuvas isoladas",
    "Encoberto com Chuvas Isoladas": "Chuvas isoladas",
};

export function chooseCities(cities, query) {
    if (!Array.isArray(cities)) return [];
    const normalized = normalizeText(query.trim());
    const named = cities.filter((city) => city?.nome && city.id != null);
    const exact = named.filter((city) => normalizeText(city.nome) === normalized);
    return exact.length ? exact : named;
}

function uvLevel(value) {
    if (value <= 2) return "Baixo";
    if (value <= 5) return "Moderado";
    if (value <= 7) return "Alto";
    if (value <= 10) return "Muito Alto";
    return "Extremo";
}

export function describeUv(index) {
    const value = Number(index);
    if (!Number.isFinite(value) || value <= 0) return null;
    return { value, level: uvLevel(value) };
}

export function describeCurrentUv(index) {
    const value = Number(index);
    if (!Number.isFinite(value) || value < 0) return null;
    const rounded = Math.round(value);
    return { value: rounded, level: uvLevel(rounded) };
}

const COMPASS = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];
const WEATHER_CODES = new Map([
    [0, ["Ensolarado", "ps"]],
    [1, ["Ensolarado", "ps"]],
    [2, ["Parcialmente Nublado", "pn"]],
    [3, ["Nublado", "n"]],
    [45, ["Nevoeiro", "n"]],
    [48, ["Nevoeiro", "n"]],
    [51, ["Chuvisco", "c"]],
    [53, ["Chuvisco", "c"]],
    [55, ["Chuvisco", "c"]],
    [56, ["Chuvisco", "c"]],
    [57, ["Chuvisco", "c"]],
    [61, ["Chuva", "c"]],
    [63, ["Chuva", "c"]],
    [65, ["Chuva", "c"]],
    [66, ["Chuva", "c"]],
    [67, ["Chuva", "c"]],
    [71, ["Neve", "n"]],
    [73, ["Neve", "n"]],
    [75, ["Neve", "n"]],
    [77, ["Neve", "n"]],
    [80, ["Pancadas de Chuva", "pp"]],
    [81, ["Pancadas de Chuva", "pp"]],
    [82, ["Pancadas de Chuva", "pp"]],
    [85, ["Neve", "n"]],
    [86, ["Neve", "n"]],
    [95, ["Tempestade", "t"]],
    [96, ["Tempestade", "t"]],
    [99, ["Tempestade", "t"]],
]);

export function describeWeatherCode(code) {
    const item = WEATHER_CODES.get(Number(code));
    if (!item) return null;
    return { label: item[0], code: item[1] };
}

export function formatHumidity(value) {
    const humidity = Number(value);
    if (!Number.isFinite(humidity)) return null;
    return `${Math.round(humidity)}%`;
}

export function formatWind(speed, direction) {
    const value = Number(speed);
    const degrees = Number(direction);
    if (!Number.isFinite(value) || !Number.isFinite(degrees)) return null;
    const point = COMPASS[Math.round((((degrees % 360) + 360) % 360) / 45) % 8];
    return `${Math.round(value)} km/h ${point}`;
}

export function shortCondition(description) {
    return SHORT_CONDITIONS[description] ?? description ?? "";
}

export function chooseLocation(results, cityName, state) {
    if (!Array.isArray(results)) return null;
    const name = normalizeText(cityName ?? "");
    const stateName = normalizeText(STATE_NAMES[state] ?? "");
    return results.find((item) => (
        item?.country_code === "BR"
        && normalizeText(item.name) === name
        && Number.isFinite(Number(item.latitude))
        && Number.isFinite(Number(item.longitude))
        && (!stateName || normalizeText(item.admin1) === stateName)
    )) ?? null;
}

export function normalizeCurrentTemperature(data) {
    const current = data?.current;
    const temperature = Number(current?.temperature_2m);
    const observedAt = current?.time;
    if (!Number.isFinite(temperature) || !observedAt) return null;
    const weather = describeWeatherCode(current.weather_code);
    return {
        temperature: Math.round(temperature),
        observedAt: String(observedAt),
        humidity: formatHumidity(current.relative_humidity_2m),
        wind: formatWind(current.wind_speed_10m, current.wind_direction_10m),
        uv: describeCurrentUv(current.uv_index),
        condition: weather?.label ?? null,
        conditionCode: weather?.code ?? null,
    };
}

export function formatObservationTime(observedAt) {
    return String(observedAt ?? "").match(/T(\d{2}:\d{2})/)?.[1] ?? "";
}

export function formatDayMonth(isoDate) {
    const [, month, day] = String(isoDate ?? "").split("-");
    if (!day || !month) return "";
    return `${day}/${month}`;
}

function addIsoDays(isoDate, days) {
    const date = new Date(`${isoDate}T12:00:00-03:00`);
    date.setUTCDate(date.getUTCDate() + days);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(date);
}

const SUN = new Set(["ps", "cl"]);
const PARTLY = new Set(["pn"]);
const STORM = new Set(["t"]);
const RAIN = new Set(["c", "ci", "ch", "cm", "cn", "cv", "pp", "pc", "pt", "pm", "np", "pcm", "pct", "pcn", "npt", "npn", "ncn", "nct", "ncm", "npm", "npp", "ppn", "ppt", "ppm"]);

export function weatherIconKind(code) {
    const key = String(code ?? "").toLowerCase();
    if (STORM.has(key)) return "storm";
    if (SUN.has(key)) return "sun";
    if (PARTLY.has(key)) return "partly";
    if (RAIN.has(key) || key.startsWith("pc") || key.startsWith("pp")) return "rain";
    return "cloud";
}

export function forecastDayTitle(isoDate, today) {
    if (isoDate === today) return "Hoje";
    if (isoDate === addIsoDays(today, 1)) return "Amanhã";
    const date = new Date(`${isoDate}T12:00:00-03:00`);
    const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "America/Sao_Paulo" }).format(date);
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

export function normalizeForecast(data) {
    if (!data?.cidade || !Array.isArray(data.clima) || data.clima.length === 0) return null;

    const days = data.clima
        .filter((day) => day?.data)
        .map((day) => {
            const condition = day.condicao_desc || "Sem descrição";
            return {
                date: String(day.data).slice(0, 10),
                conditionCode: day.condicao ?? "",
                condition,
                shortCondition: shortCondition(condition),
                min: day.min,
                max: day.max,
                uv: describeUv(day.indice_uv),
            };
        });

    if (!days.length) return null;
    return {
        city: data.cidade,
        state: data.estado ?? "",
        updatedAt: String(data.atualizado_em ?? "").slice(0, 10),
        days,
    };
}

export async function searchCidades(name, signal) {
    try {
        const cities = await getJson(`${CPTEC_URL}/cidade/${encodeURIComponent(name.trim())}`, {
            signal,
            errorMessage: "Não foi possível buscar a cidade.",
        });
        if (!Array.isArray(cities)) throw new Error("Não foi possível buscar a cidade.");
        return cities;
    } catch (error) {
        if (error.status === 404) return [];
        throw error;
    }
}

export async function getTemperaturaAtual(city, signal) {
    const name = city?.nome?.trim();
    if (!name) return null;

    const located = await getJson(`${GEOCODING_URL}?name=${encodeURIComponent(name)}&countryCode=BR&count=10&language=pt&format=json`, {
        signal,
        errorMessage: "Não foi possível consultar a temperatura atual.",
    });
    const place = chooseLocation(located?.results, name, city.estado);
    if (!place) return null;

    const weather = await getJson(`${FORECAST_URL}?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,uv_index,weather_code&timezone=America%2FSao_Paulo&wind_speed_unit=kmh`, {
        signal,
        errorMessage: "Não foi possível consultar a temperatura atual.",
    });
    return normalizeCurrentTemperature(weather);
}

export async function getPrevisao(cityId, signal) {
    const data = await getJson(`${CPTEC_URL}/clima/previsao/${encodeURIComponent(cityId)}/6`, {
        signal,
        errorMessage: "Não foi possível consultar a previsão.",
    });
    const forecast = normalizeForecast(data);
    if (!forecast) throw new Error("Não há previsão disponível para esta cidade.");
    return forecast;
}
