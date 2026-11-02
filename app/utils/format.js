export function formatRate(value) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
    }).format(value);
}

export function formatIsoDate(isoDate) {
    const [date] = String(isoDate ?? "").split(" ");
    const [year, month, day] = date.split("-");
    if (!year || !month || !day) return "";
    return `${day}/${month}/${year}`;
}

export function formatCnpj(value) {
    const digits = String(value ?? "").replace(/\D/g, "").padStart(14, "0");
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export function formatBankCode(code) {
    if (code == null || code === "") return "Não informado";
    return String(code).padStart(3, "0");
}
