export async function getJson(url, { signal, errorMessage = "Não foi possível carregar os dados." } = {}) {
    try {
        const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}`);
            error.status = response.status;
            throw error;
        }
        return await response.json();
    } catch (error) {
        if (error.name === "AbortError") throw error;
        const wrapped = new Error(errorMessage, { cause: error });
        if (Number.isInteger(error.status)) wrapped.status = error.status;
        throw wrapped;
    }
}
