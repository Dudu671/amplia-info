import { route, index, layout } from "@react-router/dev/routes";

export default [
  layout("pages/layout.jsx", [
    index("pages/home.jsx"),
    route("financeiro", "pages/financeiro.jsx"),
    route("geografico", "pages/geografico.jsx"),
    route("financeiro/consulta-cambio", "pages/consulta-cambio.jsx"),
    route("financeiro/consulta-fipe", "pages/consulta-fipe.jsx"),
    route("financeiro/consulta-corretoras", "pages/consulta-corretoras.jsx"),
    route("financeiro/consulta-bancos", "pages/consulta-bancos.jsx"),
    route("sobre", "pages/sobre.jsx"),
    route("empresarial", "pages/empresarial.jsx"),
    route("empresarial/consulta-cnpj", "pages/consulta-cnpj.jsx"),
    route("empresarial/consulta-dominio", "pages/consulta-dominio.jsx"),
    route("saude", "pages/saude.jsx"),
    route("saude/hospitais", "pages/hospitais.jsx"),
  ]),
  layout("pages/geografico-layout.jsx", [
    route("geografico/consulta-cep", "pages/consulta-cep.jsx"),
    route("geografico/consulta-cep/detalhe", "pages/detalhe-cep.jsx"),
    route("geografico/consulta-cptec", "pages/consulta-cptec.jsx"),
  ]),
];
