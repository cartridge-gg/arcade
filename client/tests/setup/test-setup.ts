import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

vi.mock("@dojoengine/torii-wasm/pkg/web/dojo_c_bg.wasm", () => ({}));
vi.mock("@dojoengine/torii-wasm/pkg/web/dojo_c.js", () => ({}));
vi.mock("@dojoengine/torii-wasm/pkg/web/dojo_c_bg.js", () => ({}));

afterEach(() => {
  cleanup();
});
