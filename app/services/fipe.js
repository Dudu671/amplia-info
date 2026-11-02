import { getJson } from "./http.js";
import { BRASIL_API_URL } from "./brasilapi.js";

const FIPE_URL = `${BRASIL_API_URL}/fipe`;
const VEHICLE_TYPES = new Set(["carros", "motos", "caminhoes"]);

function assertVehicleType(vehicleType) {
    if (!VEHICLE_TYPES.has(vehicleType)) throw new Error("Selecione um tipo de veículo.");
}

export function toFipeOptions(items, labelKey) {
    if (!Array.isArray(items)) return null;

    return items
        .filter((item) => item?.[labelKey] && item.valor != null && item.valor !== "")
        .map((item) => ({ value: String(item.valor), label: String(item[labelKey]) }))
        .sort((option, other) => option.label.localeCompare(other.label, "pt-BR"));
}

async function loadOptions(url, labelKey, signal, errorMessage) {
    const items = await getJson(url, { signal, errorMessage });
    const options = toFipeOptions(items, labelKey);
    if (!options) throw new Error(errorMessage);
    return options;
}

export function listMarcas(vehicleType, signal) {
    assertVehicleType(vehicleType);
    return loadOptions(`${FIPE_URL}/marcas/v1/${vehicleType}`, "nome", signal, "Não foi possível carregar as marcas.");
}

export function listModelos(vehicleType, brandCode, signal) {
    assertVehicleType(vehicleType);
    return loadOptions(
        `${FIPE_URL}/veiculos/v1/${vehicleType}/${encodeURIComponent(brandCode)}`,
        "modelo",
        signal,
        "Não foi possível carregar os modelos.",
    );
}

export async function listAnos(vehicleType, brandCode, modelCode, signal) {
    assertVehicleType(vehicleType);
    const options = await loadOptions(
        `${FIPE_URL}/anos/v1/${vehicleType}/${encodeURIComponent(brandCode)}/${encodeURIComponent(modelCode)}`,
        "nome",
        signal,
        "Não foi possível carregar os anos.",
    );
    return options
        .map((option) => ({ ...option, label: formatYearLabel(option.label, option.value) }))
        .sort(compareYearOptions);
}

const ZERO_KM_CODE = "32000";

export function formatYearLabel(name, code) {
    const yearCode = String(code ?? "").split("-")[0];
    const label = String(name ?? "").trim();
    const isZeroKm = yearCode === ZERO_KM_CODE || label === ZERO_KM_CODE || label.startsWith(`${ZERO_KM_CODE} `);
    if (!isZeroKm) return label;

    const fuel = label.replace(new RegExp(`^${ZERO_KM_CODE}\\s*`), "").trim();
    return fuel ? `Zero KM ${fuel}` : "Zero KM";
}

export function compareYearOptions(option, other) {
    const year = Number(String(option.value).split("-")[0]);
    const otherYear = Number(String(other.value).split("-")[0]);
    if (Number.isFinite(year) && Number.isFinite(otherYear) && year !== otherYear) return otherYear - year;
    return option.label.localeCompare(other.label, "pt-BR");
}

export function formatModelYear(modelYear, yearLabel) {
    const year = String(modelYear ?? "");
    if (year === ZERO_KM_CODE) return yearLabel && yearLabel !== ZERO_KM_CODE ? yearLabel : "Zero KM";
    if (/^\d{4}$/.test(year)) return year;
    return yearLabel || year;
}

export async function getPreco(vehicleType, brandCode, modelCode, yearCode, signal) {
    assertVehicleType(vehicleType);
    const data = await getJson(
        `${FIPE_URL}/detalhes/v1/${vehicleType}/${encodeURIComponent(brandCode)}/${encodeURIComponent(modelCode)}/${encodeURIComponent(yearCode)}`,
        { signal, errorMessage: "Não foi possível consultar o preço FIPE." },
    );
    if (!data || typeof data.valor !== "string" || !data.modelo) {
        throw new Error("Não foi possível interpretar o preço FIPE.");
    }

    return {
        price: data.valor,
        brand: data.marca ?? "",
        model: data.modelo,
        modelYear: data.anoModelo ?? "",
        fuel: data.combustivel ?? "",
        fipeCode: data.codigoFipe ?? "",
        referenceMonth: String(data.mesReferencia ?? "").trim(),
    };
}
