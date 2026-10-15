export async function getJson(url, { signal, errorMessage = "Não foi possível carregar os dados." } = {}) {
    try {
        const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        if (error.name === "AbortError") throw error;
        throw new Error(errorMessage, { cause: error });
    }
}
