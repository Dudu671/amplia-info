import { getJson } from "./http.js";
import { HOSPITAIS_ERROR, HOSPITAIS_UNAVAILABLE, normalizeCnes } from "./hospitais-domain.js";

export async function searchHospitais(filters, { cursor, signal } = {}) {
    const params = new URLSearchParams();
    if (filters.name?.trim()) params.set("name", filters.name.trim());
    if (filters.state) params.set("state", filters.state);
    if (filters.city) params.set("city", String(filters.city));
    if (cursor) params.set("cursor", cursor);
    try {
        const data = await getJson(`/api/hospitais?${params}`, { signal, errorMessage: HOSPITAIS_ERROR });
        if (!Array.isArray(data?.items) || data.items.length > 20 || !Number.isFinite(Date.parse(data.indexDate))
            || (data.nextCursor !== null && (typeof data.nextCursor !== "string" || !data.nextCursor))) throw new Error(HOSPITAIS_ERROR);
        for (const item of data.items) {
            if (!item || normalizeCnes(item.cnes) !== item.cnes || ["name", "type", "address", "phone"].some((key) => typeof item[key] !== "string")
                || !item.name.trim() || !item.type.trim()) throw new Error(HOSPITAIS_ERROR);
        }
        return data;
    } catch (cause) {
        if (cause.name === "AbortError") throw cause;
        const error = new Error(cause.status === 503 ? HOSPITAIS_UNAVAILABLE : HOSPITAIS_ERROR, { cause });
        if (cause.status) error.status = cause.status;
        throw error;
    }
}
