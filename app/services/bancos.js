import { getJson } from "./http.js";
import { BRASIL_API_URL } from "./brasilapi.js";
import { normalizeText } from "../utils/text.js";

const BANKS_URL = `${BRASIL_API_URL}/banks/v1`;
export const BANK_RESULT_LIMIT = 20;

export function filterBancos(banks, query) {
    const term = query.trim();
    if (!term) return [];

    const normalized = normalizeText(term);
    const digits = term.replace(/\D/g, "");
    const hasLetters = /[a-z]/i.test(normalized);

    return banks.filter((bank) => {
        const name = normalizeText(`${bank.name ?? ""} ${bank.fullName ?? ""}`);
        const nameMatch = hasLetters && name.includes(normalized);
        const code = bank.code == null ? "" : String(bank.code);
        const codeMatch = digits.length > 0 && digits.length <= 3 && code === String(Number(digits));
        const ispbMatch = digits.length > 3 && String(bank.ispb ?? "").includes(digits);

        if (hasLetters) return nameMatch || codeMatch;
        return codeMatch || ispbMatch;
    });
}

function compareBancos(bank, otherBank) {
    const code = bank.code ?? Number.POSITIVE_INFINITY;
    const otherCode = otherBank.code ?? Number.POSITIVE_INFINITY;
    if (code !== otherCode) return code - otherCode;
    return (bank.fullName || bank.name || "").localeCompare(otherBank.fullName || otherBank.name || "", "pt-BR");
}

export async function searchBancos(query, signal) {
    const banks = await getJson(BANKS_URL, {
        signal,
        errorMessage: "Não foi possível consultar os bancos.",
    });
    if (!Array.isArray(banks)) throw new Error("Não foi possível interpretar a lista de bancos.");

    const matches = filterBancos(banks, query).sort(compareBancos);
    return { items: matches.slice(0, BANK_RESULT_LIMIT), total: matches.length };
}
