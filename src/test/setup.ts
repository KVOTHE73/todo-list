// setup.ts: Provide Web Crypto API in tests
import { webcrypto } from "crypto";

declare global {
  // Override global crypto type
  var crypto: Crypto;
}

// Override read-only globalThis.crypto with Node WebCrypto API
Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
  configurable: true,
  writable: false,
});

// Polyfill crypto.hash used by @vitejs/plugin-vue
(globalThis.crypto as any).hash = async (
  algorithm: string,
  data: Buffer | string
) => {
  // Convert string to ArrayBuffer
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
