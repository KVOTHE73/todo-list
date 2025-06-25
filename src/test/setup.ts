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
