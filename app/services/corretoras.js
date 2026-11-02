import { getJson } from "./http.js";
import { BRASIL_API_URL } from "./brasilapi.js";
import { normalizeText } from "../utils/text.js";

const BROKERS_URL = `${BRASIL_API_URL}/cvm/corretoras/v1`;
export const BROKER_RESULT_LIMIT = 20;

export function filterCorretoras(brokers, query) {
    const normalized = normalizeText(query.trim());
    if (normalized.length < 2) return [];

    return brokers.filter((broker) => {
        const name = normalizeText(`${broker.nome_social ?? ""} ${broker.nome_comercial ?? ""}`);
        return name.includes(normalized);
    });
}

function compareCorretoras(broker, otherBroker) {
    const name = broker.nome_comercial || broker.nome_social || "";
    const otherName = otherBroker.nome_comercial || otherBroker.nome_social || "";
    return name.localeCompare(otherName, "pt-BR");
}

export async function searchCorretoras(query, signal) {
    const term = query.trim();
    if (normalizeText(term).length < 2) {
        throw new Error("Digite pelo menos 2 caracteres do nome da corretora.");
    }

    const brokers = await getJson(BROKERS_URL, {
        signal,
        errorMessage: "Não foi possível consultar as corretoras.",
    });
    if (!Array.isArray(brokers)) throw new Error("Não foi possível interpretar a lista de corretoras.");

    const matches = filterCorretoras(brokers, term).sort(compareCorretoras);
    return { items: matches.slice(0, BROKER_RESULT_LIMIT), total: matches.length };
}
