import { getJson } from "./http.js";
import { BRASIL_API_URL } from "./brasilapi.js";

const CURRENCIES_URL = `${BRASIL_API_URL}/cambio/v1/moedas`;
const QUOTE_ATTEMPTS = 7;

export function isoDateInSaoPaulo(date = new Date()) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(date);
}

export function shiftIsoDate(isoDate, days) {
    const date = new Date(`${isoDate}T12:00:00-03:00`);
    date.setUTCDate(date.getUTCDate() + days);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(date);
}

export function selectCotacao(cotacoes) {
    if (!Array.isArray(cotacoes) || cotacoes.length === 0) return null;
    return [...cotacoes].reverse().find((cotacao) => cotacao.tipo_boletim?.toUpperCase().includes("FECHAMENTO")) ?? cotacoes.at(-1);
}

export async function listMoedas(signal) {
    const moedas = await getJson(CURRENCIES_URL, {
        signal,
        errorMessage: "Não foi possível carregar as moedas.",
    });
    if (!Array.isArray(moedas)) throw new Error("Não foi possível carregar as moedas.");

    return moedas
        .filter((moeda) => moeda.simbolo && moeda.nome)
        .map((moeda) => ({ symbol: moeda.simbolo, name: moeda.nome }))
        .sort((moeda, other) => moeda.symbol.localeCompare(other.symbol, "pt-BR"));
}

export async function getCotacao(moeda, signal) {
    let date = shiftIsoDate(isoDateInSaoPaulo(), -1);

    for (let attempt = 0; attempt < QUOTE_ATTEMPTS; attempt += 1) {
        try {
            const data = await getJson(`${BRASIL_API_URL}/cambio/v1/cotacao/${moeda}/${date}`, {
                signal,
                errorMessage: "Não foi possível consultar o câmbio.",
            });
            const cotacao = selectCotacao(data?.cotacoes);
            if (!cotacao || typeof cotacao.cotacao_compra !== "number" || typeof cotacao.cotacao_venda !== "number") {
                throw new Error("Não foi possível interpretar a cotação.");
            }

            return {
                currency: data.moeda ?? moeda,
                date: data.data ?? date,
                buy: cotacao.cotacao_compra,
                sell: cotacao.cotacao_venda,
                bulletin: cotacao.tipo_boletim ?? "",
            };
        } catch (error) {
            if (error.name === "AbortError") throw error;
            if (error.status !== 400 && error.status !== 404) throw error;
            date = shiftIsoDate(date, -1);
        }
    }

    throw new Error("Não há cotação PTAX disponível para esta moeda nos últimos dias.");
}
