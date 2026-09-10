import { route, index, layout } from "@react-router/dev/routes";

export default [
  layout("routes/layout.jsx", [
    index("routes/home.jsx"),
    route("sobre", "routes/sobre.jsx"),
  ]),
];
