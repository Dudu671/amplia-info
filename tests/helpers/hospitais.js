import { createHospitalIndex } from "../../app/services/hospitais-index.server.js";

export function hospitalRecord(cnes, values = {}) {
    return { cnes: String(cnes).padStart(7, "0"), name: `Hospital ${cnes}`, legalName: "Entidade de Saúde", uf: "35", city: "355030", type: 5, ...values };
}

export function hospitalIndex(records = [hospitalRecord(1)], date = "2026-11-02T12:00:00.000Z") {
    return createHospitalIndex(records, {
        types: { 1: "POSTO DE SAUDE", 2: "CENTRO DE SAUDE/UNIDADE BASICA", 5: "HOSPITAL GERAL", 7: "HOSPITAL ESPECIALIZADO", 62: "HOSPITAL/DIA - ISOLADO", 73: "PRONTO ATENDIMENTO" },
        cities: { 355030: "São Paulo", 530010: "Brasília", 350950: "Campinas" },
        sourceUpdatedAt: "2026-10-31T06:50:56.000Z", now: new Date(date),
    });
}

export function hospitalDetail(cnes, values = {}) {
    return { codigo_cnes: Number(cnes), nome_fantasia: `Hospital ${cnes}`, nome_razao_social: "Razão social",
        codigo_tipo_unidade: 5, codigo_uf: 35, codigo_municipio: 355030,
        codigo_motivo_desabilitacao_estabelecimento: null,
        endereco_estabelecimento: "Rua Saúde", numero_estabelecimento: "12", bairro_estabelecimento: "Centro",
        codigo_cep_estabelecimento: "01001000", numero_telefone_estabelecimento: "1234-5678", ...values };
}
