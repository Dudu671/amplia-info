import { getJson } from "./http";

const IBGE_API_URL = "https://servicodados.ibge.gov.br/api/v1/localidades";

export async function getCitiesByState(state, signal) {
    const cities = await getJson(`${IBGE_API_URL}/estados/${state}/municipios?orderBy=nome`, {
        signal,
        errorMessage: "Não foi possível carregar as cidades.",
    });
    if (!Array.isArray(cities)) throw new Error("Não foi possível interpretar a lista de cidades.");
    return cities.map(({ id, nome }) => ({ id, value: nome, label: nome }));
}
