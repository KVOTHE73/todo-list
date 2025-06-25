import { webcrypto } from "crypto";
import { TextEncoder, TextDecoder } from "util";

// Polyfill WebCrypto API for vite-plugin-vue getHash
Object.defineProperty(globalThis, "crypto", {
  value: webcrypto as any,
  configurable: true,
  writable: true,
});
(globalThis as any).crypto.hash = async function (
  algorithm: string,
  data: Buffer | ArrayBuffer | string
): Promise<ArrayBuffer> {
  let buffer: ArrayBuffer;
  if (typeof data === "string") {
    const uint8 = new TextEncoder().encode(data);
    buffer = uint8.buffer;
  } else if (Buffer.isBuffer(data)) {
    buffer = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength
    );
  } else {
    buffer = data;
  }
  return webcrypto.subtle.digest(algorithm, buffer);
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
