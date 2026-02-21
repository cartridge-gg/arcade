import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  aggregateTraitMetadata,
  buildAvailableFilters,
  buildPrecomputedFilters,
  fetchTraitValues,
  fetchCollectionTraitMetadata,
  filterTokensByMetadata,
  flattenActiveFilters,
  tokenMatchesFilters,
  type ActiveFilters,
  type TraitMetadataRow,
} from "./filters";
import { fetchToriisSql } from "../modules/torii-sql-fetcher";

vi.mock("../modules/torii-sql-fetcher", () => ({
  fetchToriisSql: vi.fn(),
}));

const mockedFetchToriisSql = vi.mocked(fetchToriisSql);

describe("marketplace filters helpers", () => {
  beforeEach(() => {
    mockedFetchToriisSql.mockReset();
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
    mockedFetchToriisSql.mockResolvedValue({
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

    expect(mockedFetchToriisSql).toHaveBeenCalledWith(
      ["arcade-main", "arcade-alt"],
      expect.stringContaining("SELECT trait_name, trait_value"),
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
    mockedFetchToriisSql.mockResolvedValue({
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

  it("preserves all trait_names when multiple traits share the same value", async () => {
    mockedFetchToriisSql.mockResolvedValue({
      data: [
        {
          endpoint: "arcade-main",
          data: [
            { trait_name: "Background", trait_value: "Gold", count: 50 },
            { trait_name: "Ring", trait_value: "Gold", count: 30 },
            { trait_name: "Background", trait_value: "Blue", count: 20 },
          ],
        },
      ],
      errors: [],
    });

    const result = await fetchCollectionTraitMetadata({
      address: "0x123",
      projects: ["arcade-main"],
    });

    const aggregated = aggregateTraitMetadata(result.pages);
    const available = buildAvailableFilters(aggregated, {});

    expect(available.Background?.Gold).toBe(50);
    expect(available.Background?.Blue).toBe(20);
    expect(available.Ring?.Gold).toBe(30);
  });

  it("groups OR trait filters before applying collection scope", async () => {
    mockedFetchToriisSql.mockResolvedValue({
      data: [{ endpoint: "arcade-main", data: [] }],
      errors: [],
    });

    await fetchCollectionTraitMetadata({
      address: "0x123",
      traits: [
        { name: "Rarity", value: "Legendary" },
        { name: "Background", value: "Gold" },
      ],
      projects: ["arcade-main"],
    });

    const query = mockedFetchToriisSql.mock.calls[0]?.[1] ?? "";
    expect(query).toMatch(
      /\(\(trait_name = 'Rarity' AND trait_value = 'Legendary'\) OR \(trait_name = 'Background' AND trait_value = 'Gold'\)\)\s+AND token_id LIKE/,
    );
  });

  it("uses unique trait count when multiple values are selected for the same trait", async () => {
    mockedFetchToriisSql.mockResolvedValue({
      data: [{ endpoint: "arcade-main", data: [] }],
      errors: [],
    });

    await fetchTraitValues({
      address: "0x123",
      traitName: "Background",
      otherTraitFilters: [
        { name: "Rarity", value: "Legendary" },
        { name: "Rarity", value: "Epic" },
      ],
      projects: ["arcade-main"],
    });

    const query = mockedFetchToriisSql.mock.calls[0]?.[1] ?? "";
    expect(query).toContain("HAVING COUNT(DISTINCT trait_name) = 1");
  });

  it("uses exact trait comparisons instead of LIKE wildcards", async () => {
    mockedFetchToriisSql.mockResolvedValue({
      data: [{ endpoint: "arcade-main", data: [] }],
      errors: [],
    });

    await fetchTraitValues({
      address: "0x123",
      traitName: "Background",
      otherTraitFilters: [{ name: "Rarity", value: "Legendary" }],
      projects: ["arcade-main"],
    });

    const query = mockedFetchToriisSql.mock.calls[0]?.[1] ?? "";
    expect(query).toContain("trait_name = 'Rarity'");
    expect(query).toContain("trait_value = 'Legendary'");
    expect(query).not.toContain("trait_name LIKE");
    expect(query).not.toContain("trait_value LIKE");
  });
});
