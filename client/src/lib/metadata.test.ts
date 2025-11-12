import { describe, it, expect, afterEach, vi } from "vitest";
import { MetadataHelper } from "@/lib/metadata";
import type { Token } from "@dojoengine/torii-wasm";
import { addAddressPadding } from "starknet";
import { getToriiAssetUrl } from "@cartridge/arcade";

const createToken = (overrides: Partial<Token> = {}): Token =>
  ({
    contract_address: "1000",
    token_id: "5",
    metadata: JSON.stringify({
      attributes: [
        { trait_type: "Color", value: "Red" },
        { trait_type: "Rarity", value: "Legendary" },
      ],
    }),
    ...overrides,
  }) as Token;

describe("MetadataHelper", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("aggregates attribute metadata across tokens", () => {
    const tokens: Token[] = [
      createToken({ token_id: "1" }),
      createToken({
        token_id: "2",
        metadata: JSON.stringify({
          attributes: [
            { trait_type: "Color", value: "Red" },
            { trait_type: "Origin", value: "Dojo" },
          ],
        }),
      }),
    ];

    const attributes = MetadataHelper.extract(tokens);

    expect(attributes).toEqual(
      expect.arrayContaining([
        {
          trait_type: "Color",
          value: "Red",
          tokens: ["1", "2"],
        },
        {
          trait_type: "Rarity",
          value: "Legendary",
          tokens: ["1"],
        },
        {
          trait_type: "Origin",
          value: "Dojo",
          tokens: ["2"],
        },
      ]),
    );
  });

  it("checks for metadata availability via fetch", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true } as Response);

    const result = await MetadataHelper.check("https://example.com/meta.json");

    expect(result).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith("https://example.com/meta.json");
  });

  it("returns torii image when available", async () => {
    const token = createToken();
    const expectedUrl = getToriiAssetUrl(
      "sample-project",
      addAddressPadding(token.contract_address ?? 0),
      addAddressPadding(token.token_id ?? ""),
    );

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true } as Response);

    const url = await MetadataHelper.getToriiImage("sample-project", token);

    expect(url).toBe(expectedUrl);
    expect(fetchSpy).toHaveBeenCalledWith(expectedUrl);
  });

  it("returns undefined when torii image is unavailable", async () => {
    const token = createToken();
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false } as Response);

    const url = await MetadataHelper.getToriiImage("sample-project", token);

    expect(url).toBeUndefined();
  });
});
