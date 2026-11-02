export function sanitizeAmountInput(value) {
    const cleaned = String(value ?? "").replace(/[^\d.,]/g, "");
    const commaIndex = cleaned.indexOf(",");
    if (commaIndex === -1) return cleaned;
    return `${cleaned.slice(0, commaIndex + 1)}${cleaned.slice(commaIndex + 1).replace(/,/g, "")}`;
}

export function parseAmountInput(value) {
    const text = sanitizeAmountInput(value).trim();
    if (!/\d/.test(text)) return null;

    const commaCount = (text.match(/,/g) ?? []).length;
    const dotCount = (text.match(/\./g) ?? []).length;
    let normalized = text;

    if (commaCount === 1) normalized = text.replace(/\./g, "").replace(",", ".");
    else if (dotCount > 1) normalized = text.replace(/\./g, "");

    if (normalized.endsWith(".")) normalized = normalized.slice(0, -1);
    if (!/^\d+(\.\d+)?$/.test(normalized)) return null;

    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount : null;
}

export function formatAmountInput(value) {
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function convertAmount(amount, rate, direction) {
    if (!Number.isFinite(amount) || !Number.isFinite(rate) || rate <= 0) return null;
    const converted = direction === "to-brl" ? amount * rate : amount / rate;
    return Number.isFinite(converted) ? converted : null;
}
