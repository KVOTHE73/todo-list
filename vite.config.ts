import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/todo-list/" : "/",
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
  },
}));
