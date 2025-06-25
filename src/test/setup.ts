import { webcrypto } from "crypto";
import { TextEncoder, TextDecoder } from "util";

declare global {
  var crypto: Crypto;
}

// Polyfill globalThis.crypto for both Vite plugin and tests
Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
  configurable: true,
  writable: false,
});

// Polyfill crypto.hash used by @vitejs/plugin-vue
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
