import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { reactRouter } from "@react-router/dev/vite";

export default defineConfig({
  plugins: [svgr(), reactRouter()],
});
