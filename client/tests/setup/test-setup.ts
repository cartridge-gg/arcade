import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

vi.mock("@dojoengine/torii-wasm", () => {
  return {
    ToriiClient: class {
      async getTokens() {
        return { items: [], next_cursor: undefined };
      }
    },
  };
});

afterEach(() => {
  cleanup();
});
