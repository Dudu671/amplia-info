import { createRequestListener } from "@react-router/node";
import * as build from "../build/server/index.js";

export const config = { supportsResponseStreaming: true };

// A mesma entrada atende SSR, navegação do React Router e rotas de recurso.
export default createRequestListener({ build, mode: "production" });
