import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { reactRouter } from "@react-router/dev/vite";
import { hospitaisIndexPlugin } from "./scripts/hospitais-vite-plugin.js";

export default defineConfig({
  plugins: [hospitaisIndexPlugin(), svgr(), reactRouter()],
});
