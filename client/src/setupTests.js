import "@testing-library/jest-dom";

// Patch for TextEncoder / TextDecoder missing in Node.js
import { TextEncoder, TextDecoder } from "util";
import { webcrypto } from "crypto";

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder;
}

if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder;
}

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false, // ou true selon ce que tu veux tester
    media: query,
    onchange: null,
    addListener: jest.fn(), // obsolète mais requis
    removeListener: jest.fn(), // obsolète mais requis
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
