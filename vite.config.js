import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { reactRouter } from "@react-router/dev/vite";

export default defineConfig({
  plugins: [react(), svgr(), reactRouter()],
});
