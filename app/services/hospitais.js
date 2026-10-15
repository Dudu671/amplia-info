import { getJson } from "./http";

export async function searchHospitais(filters) {
    const apiUrl = import.meta.env.VITE_HOSPITAIS_API_URL;
    if (!apiUrl) throw new Error("A pesquisa de hospitais está temporariamente indisponível.");

    const params = new URLSearchParams();
    if (filters.name.trim()) params.set("name", filters.name.trim());
    if (filters.state) params.set("state", filters.state);
    if (filters.city) params.set("city", filters.city);

    const separator = apiUrl.includes("?") ? "&" : "?";
    const data = await getJson(`${apiUrl}${separator}${params.toString()}`, {
        errorMessage: "Não foi possível consultar os hospitais. Tente novamente.",
    });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    throw new Error("Não foi possível interpretar os resultados da pesquisa.");
}
