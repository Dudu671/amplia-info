export async function searchHospitais(filters) {
    const apiUrl = import.meta.env.VITE_HOSPITAIS_API_URL;

    if (!apiUrl) {
        return []
    }

    const params = new URLSearchParams();

    if (filters.name.trim()) {
        params.set("name", filters.name.trim())

    }

    if (filters.state) {
        params.set("state", filters.state);
    }

    if (filters.city) {
        params.set("city", filters.city);
    }

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
        headers: { Accept: "application/json", },
    });

    if (!response.ok) {
        throw new Error("Não foi possível consultar os hospitais.");
    }

    const data = await response.json();

    if (Array.isArray(data)) {
        return data;
    }

    return Array.isArray(data.results) ? data.results : [];
}