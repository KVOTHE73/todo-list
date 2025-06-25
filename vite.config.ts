import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/todo-list/" : "/", // para el build y el despliegue en GitHub Pages /todo-list/
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom", // simula el DOM
    include: ["src/**/*.spec.ts", "src/**/*.test.ts"], // busca tests en todo src/
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
}));
