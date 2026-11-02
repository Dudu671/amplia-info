import { getJson } from "./http.js";
import { normalizeText } from "../utils/text.js";

const VIACEP_URL = "https://viacep.com.br/ws";
export const CEP_RESULT_LIMIT = 50;

export function toViaCepSegment(value) {
    return encodeURIComponent(String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim());
}

export function normalizeAddress(item) {
    const cep = String(item?.cep ?? "").trim();
    const street = String(item?.logradouro ?? "").trim();
    if (!cep || !street) return null;
    return {
        cep,
        street,
        complement: String(item.complemento ?? "").trim(),
        unit: String(item.unidade ?? "").trim(),
        neighborhood: String(item.bairro ?? "").trim(),
        city: String(item.localidade ?? "").trim(),
        state: String(item.uf ?? "").trim(),
        ddd: String(item.ddd ?? "").trim(),
    };
}

function matchScore(street, term) {
    const name = normalizeText(street);
    if (name === term) return 3;
    if (name.startsWith(term) || name.endsWith(` ${term}`)) return 2;
    if (name.includes(term)) return 1;
    return 0;
}

export function rankAddresses(addresses, query) {
    const term = normalizeText(query);
    return [...addresses].sort((address, other) => (
        matchScore(other.street, term) - matchScore(address.street, term) || address.cep.localeCompare(other.cep)
    ));
}

export function formatAddressLine(address) {
    const place = address.city && address.state ? `${address.city}/${address.state}` : address.city;
    return [address.street, address.complement, address.neighborhood, place].filter(Boolean).join(" · ");
}

export async function searchEnderecos(state, city, street, signal) {
    const term = street.trim();
    if (normalizeText(term).length < 3) throw new Error("Digite pelo menos 3 letras do logradouro.");

    const data = await getJson(`${VIACEP_URL}/${toViaCepSegment(state)}/${toViaCepSegment(city)}/${toViaCepSegment(term)}/json/`, {
        signal,
        errorMessage: "Não foi possível buscar o CEP.",
    });
    if (data?.erro) return { addresses: [], limited: false };
    if (!Array.isArray(data)) throw new Error("Não foi possível buscar o CEP.");

    const addresses = rankAddresses(data.map(normalizeAddress).filter(Boolean), term);
    return { addresses, limited: addresses.length >= CEP_RESULT_LIMIT };
}
