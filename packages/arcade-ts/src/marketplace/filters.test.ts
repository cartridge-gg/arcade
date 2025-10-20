import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  aggregateTraitMetadata,
  buildAvailableFilters,
  buildPrecomputedFilters,
  fetchCollectionTraitMetadata,
  filterTokensByMetadata,
  flattenActiveFilters,
  tokenMatchesFilters,
  type ActiveFilters,
  type TraitMetadataRow,
} from "./filters";
import { fetchToriis } from "../modules/torii-fetcher";

vi.mock("../modules/torii-fetcher", () => ({
  fetchToriis: vi.fn(),
}));

const mockedFetchToriis = vi.mocked(fetchToriis);

describe("marketplace filters helpers", () => {
  beforeEach(() => {
    mockedFetchToriis.mockReset();
  });

  it("flattens active filters into trait selections", () => {
    const active: ActiveFilters = {
      Rarity: new Set(["Legendary", "Epic"]),
      Origin: new Set(["On-chain"]),
    };

    const flattened = flattenActiveFilters(active);
    expect(flattened).toEqual(
      expect.arrayContaining([
        { name: "Rarity", value: "Legendary" },
        { name: "Rarity", value: "Epic" },
        { name: "Origin", value: "On-chain" },
      ]),
    );
    expect(flattened).toHaveLength(3);
  });

  it("builds available filters and precomputed metadata", () => {
    const metadata: TraitMetadataRow[] = [
      { traitName: "Rarity", traitValue: "Legendary", count: 3 },
      { traitName: "Rarity", traitValue: "Epic", count: 2 },
      { traitName: "Faction", traitValue: "Air", count: 4 },
    ];

    const active: ActiveFilters = {
      Rarity: new Set(["Common"]),
    };

    const available = buildAvailableFilters(metadata, active);
    expect(available.Rarity?.Legendary).toBe(3);
    expect(available.Rarity?.Common).toBe(0);
    expect(available.Faction?.Air).toBe(4);

    const precomputed = buildPrecomputedFilters(available);
    expect(precomputed.attributes).toEqual(["Faction", "Rarity"]);
    expect(precomputed.properties.Rarity[0]).toMatchObject({
      property: "Legendary",
      count: 3,
    });
  });

  it("matches tokens against active filters", () => {
    const token = {
      metadata: JSON.stringify({
        attributes: [
          { trait_type: "Rarity", value: "Legendary" },
          { trait_type: "Class", value: "Warrior" },
        ],
      }),
    };

    const matches = tokenMatchesFilters(token, {
      Rarity: new Set(["Legendary"]),
    });
    expect(matches).toBe(true);

    const misses = tokenMatchesFilters(token, {
      Rarity: new Set(["Epic"]),
    });
    expect(misses).toBe(false);
  });

  it("filters tokens using metadata filters", () => {
    const tokens = [
      {
        token_id: "1",
        metadata: {
          attributes: [{ trait_type: "Rarity", value: "Legendary" }],
        },
      },
      {
        token_id: "2",
        metadata: { attributes: [{ trait_type: "Rarity", value: "Common" }] },
      },
    ];

    const filtered = filterTokensByMetadata(tokens, {
      Rarity: new Set(["Legendary"]),
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.token_id).toBe("1");
  });

  it("fetches trait metadata for multiple projects", async () => {
    mockedFetchToriis.mockResolvedValue({
      data: [
        {
          endpoint: "arcade-main",
          data: [
            { trait_name: "Rarity", trait_value: "Legendary", count: 2 },
            { trait_name: "Rarity", trait_value: "Epic", count: 3 },
          ],
        },
        {
          endpoint: "arcade-alt",
          data: [
            { trait_name: "Faction", trait_value: "Air", count: 4 },
            { trait_name: "Faction", trait_value: "Fire", count: 1 },
          ],
        },
      ],
      errors: [],
    });

    const result = await fetchCollectionTraitMetadata({
      address: "0x123",
      projects: ["arcade-main", "arcade-alt"],
    });

    expect(mockedFetchToriis).toHaveBeenCalledWith(
      ["arcade-main", "arcade-alt"],
      expect.objectContaining({
        sql: expect.stringContaining("FROM token_attributes"),
      }),
    );

    expect(result.pages).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(result.pages[0]?.projectId).toBe("arcade-main");

    const aggregated = aggregateTraitMetadata(result.pages);
    expect(aggregated).toEqual(
      expect.arrayContaining([
        { traitName: "Rarity", traitValue: "Legendary", count: 2 },
        { traitName: "Faction", traitValue: "Air", count: 4 },
      ]),
    );
  });

  it("maps errors to missing projects when fetching metadata fails", async () => {
    mockedFetchToriis.mockResolvedValue({
      data: [],
      errors: [new Error("boom")],
    });

    const result = await fetchCollectionTraitMetadata({
      address: "0x123",
      projects: ["arcade-main"],
    });

    expect(result.pages).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.projectId).toBe("arcade-main");
    expect(result.errors[0]?.error.message).toBe("boom");
  });
});
