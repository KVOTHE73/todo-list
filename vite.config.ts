import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isTest = mode === "test";
  return {
    base: command === "build" ? "/todo-list/" : "/",
    plugins: isTest ? [] : [vue()],
    test: {
      globals: true,
      environment: "jsdom",
      include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
      setupFiles: ["src/test/setup.ts"],
      coverage: { reporter: ["text", "lcov"] },
    },
  };
});
