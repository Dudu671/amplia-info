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

export function formatPhoneNumber(value) {
    const phone = String(value ?? "").trim();
    if (!phone || !/^\+?[\d\s().-]+$/.test(phone)) return phone;

    let digits = phone.replace(/\D/g, "");
    if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) digits = digits.slice(2);

    if (digits.length === 11) return digits.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, "($1) $2 $3-$4");
    if (digits.length === 10) return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    if (digits.length === 9) return digits.replace(/^(\d)(\d{4})(\d{4})$/, "$1 $2-$3");
    if (digits.length === 8) return digits.replace(/^(\d{4})(\d{4})$/, "$1-$2");
    return phone;
}
