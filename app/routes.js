import { route, index, layout } from "@react-router/dev/routes";

export default [
  layout("pages/layout.jsx", [
    index("pages/home.jsx"),
    route("financeiro", "pages/financeiro.jsx"),
    route("sobre", "pages/sobre.jsx"),
    route("empresarial", "pages/empresarial.jsx"),
    route("empresarial/consulta-cnpj", "pages/consulta-cnpj.jsx"),
    route("empresarial/consulta-dominio", "pages/consulta-dominio.jsx"),
  ]),
];
