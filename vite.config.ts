import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/todo-list/" : "/", // para el build y el despliegue en GitHub Pages /todo-list/
  plugins: [vue()],
}));
