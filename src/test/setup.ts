import { webcrypto } from "crypto";
import { TextEncoder, TextDecoder } from "util";

declare global {
  var crypto: Crypto;
  var TextEncoder: { new (): TextEncoder; prototype: TextEncoder };
  var TextDecoder: {
    new (label?: string, options?: TextDecoderOptions): TextDecoder;
    prototype: TextDecoder;
  };
}

// Polyfill WebCrypto API and esbuild invariants in tests
Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
  configurable: true,
});
(globalThis.crypto as any).hash = (...args: any[]) =>
  (webcrypto.subtle as any).digest(...args);
Object.defineProperty(globalThis, "TextEncoder", { value: TextEncoder });
Object.defineProperty(globalThis, "TextDecoder", { value: TextDecoder });
