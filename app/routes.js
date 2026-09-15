import { route, index, layout } from "@react-router/dev/routes";

export default [
  layout("pages/layout.jsx", [
    index("pages/home.jsx"),
    route("financeiro", "pages/financeiro.jsx"),
    route("sobre", "pages/sobre.jsx"),
  ]),
];
