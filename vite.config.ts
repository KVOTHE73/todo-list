import { webcrypto } from "crypto";
import { TextEncoder, TextDecoder } from "util";

// Polyfill WebCrypto API and required methods before any plugin import
Object.defineProperty(globalThis, "crypto", {
  value: webcrypto as any,
  configurable: true,
  writable: false,
});
(globalThis.crypto as any).hash = async (
  algorithm: string,
  data: Buffer | ArrayBuffer | string
) => {
  let buffer: ArrayBuffer;
  if (typeof data === "string") {
    buffer = new TextEncoder().encode(data);
  } else if (Buffer.isBuffer(data)) {
    buffer = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength
    );
  } else {
    buffer = data;
  }
  return await webcrypto.subtle.digest(algorithm, buffer);
};
// Polyfill TextEncoder/TextDecoder for esbuild invariant
Object.defineProperty(globalThis, "TextEncoder", { value: TextEncoder });
Object.defineProperty(globalThis, "TextDecoder", { value: TextDecoder });

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
    setupFiles: ["src/test/setup.ts"],
    coverage: { reporter: ["text", "lcov"] },
  },
}));
