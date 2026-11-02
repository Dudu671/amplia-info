export const HOSPITAIS_ERROR = "Não foi possível consultar os hospitais. Tente novamente.";
export const HOSPITAIS_UNAVAILABLE = "A pesquisa de hospitais está temporariamente indisponível.";
export const HOSPITAIS_PAGE_SIZE = 20;
export const HOSPITAIS_TYPES = [1, 2, 5, 7, 62, 73];

export const UF_CODES = {
    RO: "11", AC: "12", AM: "13", RR: "14", PA: "15", AP: "16", TO: "17",
    MA: "21", PI: "22", CE: "23", RN: "24", PB: "25", PE: "26", AL: "27", SE: "28", BA: "29",
    MG: "31", ES: "32", RJ: "33", SP: "35", PR: "41", SC: "42", RS: "43",
    MS: "50", MT: "51", GO: "52", DF: "53",
};

export function normalizeHospitalText(value) {
    return String(value ?? "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function normalizeCnes(value) {
    const code = String(value ?? "").trim();
    if (!/^\d{1,7}$/.test(code) || Number(code) === 0) throw new Error("CNES inválido.");
    return code.padStart(7, "0");
}

export function normalizeHospitalFilters({ name = "", state = "", city = "" } = {}) {
    const uf = String(state).trim().toUpperCase();
    const municipality = String(city).trim();
    if (uf && !UF_CODES[uf]) throw new Error(HOSPITAIS_ERROR);
    if (municipality && (!uf || !/^\d{7}$/.test(municipality) || !municipality.startsWith(UF_CODES[uf]))) {
        throw new Error(HOSPITAIS_ERROR);
    }
    if (String(name).length > 200) throw new Error(HOSPITAIS_ERROR);
    return { name: normalizeHospitalText(name), state: uf, city: municipality.slice(0, 6) };
}

export function filterHospitalCandidates(records, filters) {
    const uf = UF_CODES[filters.state];
    return records.filter((record) => (!uf || record.uf === uf)
        && (!filters.city || record.city === filters.city)
        && (!filters.name || normalizeHospitalText(record.name).includes(filters.name)
            || normalizeHospitalText(record.legalName).includes(filters.name)));
}

export function mergeHospitals(previous, incoming) {
    const unique = new Map(previous.map((item) => [normalizeCnes(item.cnes), item]));
    for (const item of incoming) unique.set(normalizeCnes(item.cnes), item);
    return [...unique.values()];
}
