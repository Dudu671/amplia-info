import { createHash } from "node:crypto";
import { getJson } from "./http.js";
import { loadRuntimeHospitalIndex } from "./hospitais-runtime-index.server.js";
import { HOSPITAIS_ERROR, HOSPITAIS_PAGE_SIZE, HOSPITAIS_TYPES, HOSPITAIS_UNAVAILABLE,
    filterHospitalCandidates, normalizeCnes, normalizeHospitalFilters, UF_CODES } from "./hospitais-domain.js";

const API = "https://apidadosabertos.saude.gov.br/cnes/estabelecimentos";
const CURSOR_TTL = 24 * 60 * 60 * 1000;
const ufNames = Object.fromEntries(Object.entries(UF_CODES).map(([name, code]) => [code, name]));
const text = (value) => value == null ? "" : String(value).trim();
const filtersHash = (filters) => createHash("sha256").update(JSON.stringify(filters)).digest("hex");

function readCursor(cursor, filters, now) {
    try {
        if (typeof cursor !== "string" || cursor.length > 1000) throw new Error();
        const value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
        if (!/^[a-f0-9]{64}$/.test(value.version) || value.filters !== filtersHash(filters)
            || !Number.isInteger(value.offset) || value.offset <= 0 || value.offset % HOSPITAIS_PAGE_SIZE !== 0
            || !Number.isFinite(value.issuedAt) || value.issuedAt > now || now - value.issuedAt >= CURSOR_TTL) throw new Error();
        return value;
    } catch { throw new Error(HOSPITAIS_ERROR); }
}

export function mapHospitalDetail(detail, candidate, index) {
    if (!detail || Array.isArray(detail) || normalizeCnes(detail.codigo_cnes) !== candidate.cnes
        || !HOSPITAIS_TYPES.includes(Number(detail.codigo_tipo_unidade))
        || !Object.hasOwn(detail, "codigo_motivo_desabilitacao_estabelecimento")
        || text(detail.codigo_motivo_desabilitacao_estabelecimento)
        || text(detail.codigo_uf) !== candidate.uf || text(detail.codigo_municipio) !== candidate.city
        || !Object.hasOwn(detail, "nome_fantasia") || !Object.hasOwn(detail, "nome_razao_social")) throw new Error(HOSPITAIS_ERROR);
    const city = index.cities[text(detail.codigo_municipio)];
    const type = index.types[Number(detail.codigo_tipo_unidade)];
    if (!city || !type) throw new Error(HOSPITAIS_ERROR);
    const street = [text(detail.endereco_estabelecimento), text(detail.numero_estabelecimento)].filter(Boolean).join(", ");
    const locality = `${city}/${ufNames[candidate.uf]}`;
    const cep = text(detail.codigo_cep_estabelecimento);
    return {
        cnes: candidate.cnes,
        name: text(detail.nome_fantasia) || text(detail.nome_razao_social) || "Hospital sem nome informado",
        type,
        address: [street, text(detail.bairro_estabelecimento), locality, cep && `CEP ${cep}`].filter(Boolean).join(" - "),
        phone: text(detail.numero_telefone_estabelecimento),
    };
}

async function fetchDetail(cnes, signal) {
    return getJson(`${API}/${cnes}`, { signal, errorMessage: HOSPITAIS_ERROR });
}

export async function searchHospitalPage(input, { cursor, signal, loadIndex = loadRuntimeHospitalIndex,
    getDetail = fetchDetail, now = Date.now(), timeoutMs = 30000 } = {}) {
    const filters = normalizeHospitalFilters(input);
    const position = cursor ? readCursor(cursor, filters, now) : null;
    const index = await loadIndex(position?.version);
    if (position && index.version !== position.version) throw new Error(HOSPITAIS_ERROR);
    const candidates = filterHospitalCandidates(index.records, filters);
    const offset = position?.offset || 0;
    if (offset && offset >= candidates.length) throw new Error(HOSPITAIS_ERROR);
    const page = candidates.slice(offset, offset + HOSPITAIS_PAGE_SIZE);
    const controller = new AbortController();
    const requestSignal = AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(timeoutMs), controller.signal]);
    const items = new Array(page.length);
    let next = 0;
    try {
        requestSignal.throwIfAborted();
        await Promise.all(Array.from({ length: Math.min(4, page.length) }, async () => {
            while (next < page.length) {
                requestSignal.throwIfAborted();
                const itemIndex = next++;
                const candidate = page[itemIndex];
                items[itemIndex] = mapHospitalDetail(await getDetail(candidate.cnes, requestSignal), candidate, index);
            }
        }));
        requestSignal.throwIfAborted();
    } catch (cause) {
        controller.abort();
        if (signal?.aborted) throw signal.reason;
        throw new Error(HOSPITAIS_ERROR, { cause });
    }
    const nextOffset = offset + page.length;
    return {
        items,
        nextCursor: nextOffset < candidates.length ? Buffer.from(JSON.stringify({ version: index.version, offset: nextOffset,
            filters: filtersHash(filters), issuedAt: position?.issuedAt ?? now })).toString("base64url") : null,
        indexDate: index.sourceUpdatedAt,
    };
}

export async function handleHospitalRequest(request, search = searchHospitalPage) {
    const params = new URL(request.url).searchParams;
    const cursor = params.get("cursor") || undefined;
    const headers = { "Cache-Control": "no-store" };
    try {
        const result = await search({ name: params.get("name") || "", state: params.get("state") || "", city: params.get("city") || "" },
            { cursor, signal: request.signal });
        return Response.json(result, { headers });
    } catch (error) {
        if (request.signal.aborted) throw error;
        const unavailable = !cursor && error.message === HOSPITAIS_UNAVAILABLE;
        return Response.json({ message: unavailable ? HOSPITAIS_UNAVAILABLE : HOSPITAIS_ERROR }, { status: unavailable ? 503 : 502, headers });
    }
}
