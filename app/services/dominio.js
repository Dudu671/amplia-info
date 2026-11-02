import { getJson } from "./http.js";
import { BRASIL_API_URL } from "./brasilapi.js";

export const DOMAIN_TYPES = [".com.br", ".net.br", ".org.br"];

const NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const EXTENSION_PATTERN = /^\.?[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.br(?![\s\S])/i;
const INVALID_INPUT = "Digite apenas o nome do domínio, de 1 a 63 caracteres, com letras sem acento, números e hífen no interior.";
const REJECTED = "O domínio foi rejeitado pela fonte. Confira o nome e a extensão informados.";
const UNAVAILABLE = "Não foi possível consultar o domínio agora. Tente novamente.";
const INVALID_RESPONSE = "Não foi possível interpretar os dados do domínio. Tente novamente.";
const STATUSES = [
    ["AVAILABLE", "Disponível para registro."],
    ["AVAILABLE_WITH_TICKET", "Disponível com solicitações concorrentes."],
    ["REGISTERED", "Já registrado."],
    ["UNAVAILABLE", "Indisponível para registro."],
    ["INVALID_QUERY", REJECTED],
    ["RELEASE_WAITING", "Aguardando processo de liberação."],
    ["RELEASE_IN_PROGRESS", "Disponível no processo de liberação em andamento."],
    ["RELEASE_IN_PROGRESS_WITH_TICKETS", "Disponível no processo de liberação com solicitações concorrentes."],
    ["ERROR", UNAVAILABLE],
    ["DOMAIN_PROCESS_RELEASE", "Em processo de liberação competitivo."],
    ["UNKNOW", "Situação desconhecida."],
];

function expirationDate(value) {
    if (typeof value !== "string") return "";
    const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?)?$/.exec(value);
    if (!match || match[0] !== value || !Number.isFinite(Date.parse(value))) return "";
    const [, year, month, day] = match;
    const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
    if (Number(year) < 1 || date.getUTCFullYear() !== Number(year)
        || date.getUTCMonth() + 1 !== Number(month) || date.getUTCDate() !== Number(day)) return "";
    return `${day}/${month}/${year}`;
}

function uniqueStrings(values) {
    const seen = new Set();
    return values.filter((value) => {
        const key = value.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function domainSummary(data, name, fqdn) {
    if (!data || Array.isArray(data) || typeof data !== "object"
        || !Number.isInteger(data.status_code) || data.status_code < 0
        || typeof data.status !== "string" || !data.status.trim()
        || typeof data.fqdn !== "string" || data.fqdn.toLowerCase() !== fqdn) {
        throw new Error(INVALID_RESPONSE);
    }
    const knownStatus = STATUSES[data.status_code];
    if (knownStatus && data.status !== knownStatus[0]) throw new Error(INVALID_RESPONSE);
    if (data.status_code === 4) throw new Error(REJECTED);
    if (data.status_code === 8) throw new Error(UNAVAILABLE);

    const hosts = Array.isArray(data.hosts)
        ? uniqueStrings(data.hosts.filter((host) => typeof host === "string").map((host) => host.trim()).filter(Boolean)) : [];
    const suggestions = Array.isArray(data.suggestions)
        ? uniqueStrings(data.suggestions.filter((extension) => typeof extension === "string" && EXTENSION_PATTERN.test(extension))
            .map((extension) => `${name}.${extension.replace(/^\./, "").toLowerCase()}`)).filter((domain) => domain !== fqdn) : [];
    const receivedAt = new Date();

    return {
        fqdn,
        status: knownStatus?.[1] || "Situação não reconhecida pela aplicação",
        expiresAt: expirationDate(data["expires-at"]),
        hosts,
        suggestions,
        consultedAt: `Consultado em ${receivedAt.toLocaleDateString("pt-BR")} às ${receivedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    };
}

function queryError(error) {
    if (error.status === 400) return new Error(REJECTED, { cause: error });
    if (error.status === 429) return new Error("Limite de consultas atingido. Aguarde e tente novamente.", { cause: error });
    if (error.cause instanceof SyntaxError) return new Error(INVALID_RESPONSE, { cause: error });
    return new Error(UNAVAILABLE, { cause: error });
}

export async function getDomain(value, extension, signal) {
    const name = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (!NAME_PATTERN.test(name) || !DOMAIN_TYPES.includes(extension)) throw new Error(INVALID_INPUT);
    if (signal?.aborted) throw new DOMException("Consulta cancelada", "AbortError");
    const fqdn = `${name}${extension}`;
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    const cancelled = new Promise((_, reject) => {
        controller.signal.addEventListener("abort", () => {
            reject(timedOut ? new Error(UNAVAILABLE) : new DOMException("Consulta cancelada", "AbortError"));
        }, { once: true });
    });
    signal?.addEventListener("abort", abort, { once: true });
    const timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, 15_000);

    let data;
    try {
        data = await Promise.race([
            getJson(`${BRASIL_API_URL}/registrobr/v1/${encodeURIComponent(fqdn)}`, { signal: controller.signal, errorMessage: UNAVAILABLE }),
            cancelled,
        ]);
    } catch (error) {
        if (controller.signal.aborted) {
            if (timedOut) throw new Error(UNAVAILABLE, { cause: error });
            throw new DOMException("Consulta cancelada", "AbortError");
        }
        throw queryError(error);
    } finally {
        clearTimeout(timeout);
        signal?.removeEventListener("abort", abort);
    }
    return domainSummary(data, name, fqdn);
}
