import { getJson } from "./http.js";
import { BRASIL_API_URL } from "./brasilapi.js";
import { formatPhoneNumber } from "../utils/format.js";

const CNPJ_PATTERN = /^[A-Z0-9]{12}[0-9]{2}$/;
const INVALID_INPUT = "Informe um CNPJ com 14 caracteres: os 12 primeiros podem conter letras e números; os 2 últimos devem ser números.";
const UNAVAILABLE = "Não foi possível consultar o CNPJ agora. Tente novamente.";
const INVALID_RESPONSE = "Não foi possível interpretar os dados do CNPJ. Tente novamente.";
const REGISTRATION_STATUSES = { 1: "Nula", 2: "Ativa", 3: "Suspensa", 4: "Inapta", 8: "Baixada" };

function text(value) {
    if (typeof value === "string") return value.trim();
    return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

export function normalizeCnpj(value) {
    return String(value ?? "").replace(/[\s./-]/g, "").toUpperCase();
}

export function formatCompanyCnpj(value) {
    const cnpj = normalizeCnpj(value);
    return cnpj.replace(/^([A-Z0-9]{2})([A-Z0-9]{3})([A-Z0-9]{3})([A-Z0-9]{4})([0-9]{2})$/, "$1.$2.$3/$4-$5");
}

function civilDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
    if (!match) return "";
    const [, year, month, day] = match;
    const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
    if (Number(year) < 1 || date.getUTCFullYear() !== Number(year)
        || date.getUTCMonth() + 1 !== Number(month) || date.getUTCDate() !== Number(day)) return "";
    return `${day}/${month}/${year}`;
}

function registrationStatus(company) {
    const description = text(company.descricao_situacao_cadastral).toLocaleLowerCase("pt-BR");
    return Object.values(REGISTRATION_STATUSES).find((status) => status.toLocaleLowerCase("pt-BR") === description)
        || (Object.hasOwn(REGISTRATION_STATUSES, company.situacao_cadastral)
            ? REGISTRATION_STATUSES[company.situacao_cadastral] : "Situação não informada");
}

function booleanLabel(value) {
    return typeof value === "boolean" ? (value ? "Sim" : "Não") : "";
}

export function companySummary(company, receivedAt = new Date()) {
    const cnae = text(company.cnae_fiscal);
    const activityCode = /^\d{1,7}$/.test(cnae)
        ? cnae.padStart(7, "0").replace(/^(\d{4})(\d)(\d{2})$/, "$1-$2/$3") : cnae;
    const natureCode = text(company.codigo_natureza_juridica).replace(/^(\d{3})(\d)$/, "$1-$2");
    const branch = text(company.descricao_identificador_matriz_filial)
        || (String(company.identificador_matriz_filial) === "1" ? "Matriz"
            : String(company.identificador_matriz_filial) === "2" ? "Filial" : "");
    const street = [text(company.descricao_tipo_de_logradouro), text(company.logradouro)].filter(Boolean).join(" ");
    const address = [street, text(company.numero), text(company.complemento)].filter(Boolean).join(", ");
    const abroad = text(company.uf).toUpperCase() === "EX";
    const city = abroad
        ? [text(company.nome_cidade_no_exterior) || text(company.municipio), text(company.uf), text(company.pais)].filter(Boolean).join(" / ")
        : [text(company.municipio), text(company.uf)].filter(Boolean).join(" / ");
    const cep = text(company.cep).replace(/^(\d{5})(\d{3})$/, "$1-$2");
    const phones = [...new Set([company.ddd_telefone_1, company.ddd_telefone_2]
        .map((phone) => formatPhoneNumber(text(phone))).filter(Boolean))];
    const sections = [
        {
            title: "Dados da empresa", icon: "company", details: [
                { label: "Nome fantasia", value: text(company.nome_fantasia) },
                { label: "Estabelecimento", value: branch },
                { label: "Atividade principal", value: [activityCode, text(company.cnae_fiscal_descricao)].filter(Boolean).join(" — ") },
                { label: "Data de abertura", value: civilDate(company.data_inicio_atividade) },
                { label: "Data da situação cadastral", value: civilDate(company.data_situacao_cadastral) },
                { label: "Porte", value: text(company.porte) },
                { label: "Natureza jurídica", value: [natureCode, text(company.natureza_juridica)].filter(Boolean).join(" — ") },
            ],
        },
        {
            title: "Endereço", icon: "address", details: [
                { label: "Endereço cadastral", value: address },
                { label: "Bairro", value: text(company.bairro) },
                { label: abroad ? "Localização" : "Município / UF", value: city },
                { label: "CEP", value: cep },
            ],
        },
        {
            title: "Contatos", icon: "contact", details: [
                ...phones.map((phone, index) => ({ label: index === 0 ? "Telefone" : "Outro telefone", value: phone })),
                { label: "E-mail", value: text(company.email) },
            ],
        },
        {
            title: "Enquadramento", icon: "classification", details: [
                { label: "Simples Nacional", value: booleanLabel(company.opcao_pelo_simples) },
                { label: "MEI", value: booleanLabel(company.opcao_pelo_mei) },
            ],
        },
    ].map((section) => ({ ...section, details: section.details.filter(({ value }) => value !== "") }))
        .filter(({ details }) => details.length > 0);

    return {
        cnpj: normalizeCnpj(company.cnpj),
        formattedCnpj: formatCompanyCnpj(company.cnpj),
        name: text(company.razao_social),
        status: registrationStatus(company),
        sections,
        consultedAt: `Consultado em ${receivedAt.toLocaleDateString("pt-BR")} às ${receivedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    };
}

function queryError(error, cnpj) {
    if (error.status === 404) return new Error("CNPJ não encontrado na base consultada.", { cause: error });
    if (error.status === 400) {
        return new Error(/[A-Z]/.test(cnpj)
            ? "A fonte não conseguiu consultar este CNPJ alfanumérico. O suporte ao formato pode estar limitado. Confira o identificador ou tente novamente mais tarde."
            : "O CNPJ foi rejeitado pela fonte. Confira o número informado.", { cause: error });
    }
    if (error.status === 429) return new Error("Limite de consultas atingido. Aguarde e tente novamente.", { cause: error });
    if (error.cause instanceof SyntaxError) return new Error(INVALID_RESPONSE, { cause: error });
    return new Error(UNAVAILABLE, { cause: error });
}

export async function getCompany(value, signal) {
    const cnpj = normalizeCnpj(value);
    if (!CNPJ_PATTERN.test(cnpj)) throw new Error(INVALID_INPUT);
    if (signal?.aborted) throw new DOMException("Consulta cancelada", "AbortError");

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

    let company;
    try {
        company = await Promise.race([
            getJson(`${BRASIL_API_URL}/cnpj/v1/${cnpj}`, { signal: controller.signal, errorMessage: UNAVAILABLE }),
            cancelled,
        ]);
    } catch (error) {
        if (controller.signal.aborted) {
            if (timedOut) throw new Error(UNAVAILABLE, { cause: error });
            throw error;
        }
        throw queryError(error, cnpj);
    } finally {
        clearTimeout(timeout);
        signal?.removeEventListener("abort", abort);
    }

    if (!company || Array.isArray(company) || typeof company !== "object"
        || typeof company.razao_social !== "string" || !company.razao_social.trim()
        || typeof company.cnpj !== "string" || !CNPJ_PATTERN.test(normalizeCnpj(company.cnpj))
        || normalizeCnpj(company.cnpj) !== cnpj) throw new Error(INVALID_RESPONSE);

    return companySummary(company);
}
