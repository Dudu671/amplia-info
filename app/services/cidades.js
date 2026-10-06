const IBGE_API_URL = "https://servicodados.ibge.gov.br/api/v1/localidades";

export async function getCitiesByState(state, signal) {
    const response = await fetch(`${IBGE_API_URL}/estados/${state}/municipios?orderBy=nome`, { signal });
    if (!response.ok) throw new Error("Não foi possível carregar as cidades.");

    const cities = await response.json();
    return cities.map(({ id, nome }) => ({ id, value: nome, label: nome }));
}