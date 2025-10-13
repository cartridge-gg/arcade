import { describe, it, expect } from '@jest/globals';
import {
  buildMetadataIndex,
  updateMetadataIndex,
  extractTokenAttributes,
  calculateFilterCounts,
  applyFilters,
  serializeFiltersToURL,
  parseFiltersFromURL
} from '@/utils/metadata-indexer';
import {
  createMockTokenCollection,
  createExpectedMetadataIndex,
  createMockActiveFilters,
  createEdgeCaseTokens,
  urlTestCases
} from '../setup/metadata-filter.setup';

describe('Metadata Indexer Utilities', () => {
  describe('buildMetadataIndex', () => {
    it('should build metadata index from token collection', () => {
      const tokens = createMockTokenCollection();
      const index = buildMetadataIndex(tokens);
      const expected = createExpectedMetadataIndex();

      expect(index).toEqual(expected);
    });

    it('should handle tokens with missing metadata', () => {
      const tokens = createEdgeCaseTokens();
      const index = buildMetadataIndex(tokens);

      expect(index['No Traits']).toBeDefined();
      expect(index['No Traits'].true).toContain('100');
      expect(index['No Traits'].true).toContain('101');
      expect(index['No Traits'].true).toContain('102');
    });

    it('should handle empty token array', () => {
      const index = buildMetadataIndex([]);
      expect(index).toEqual({});
    });
  });

  describe('updateMetadataIndex', () => {
    it('should update existing index with new tokens', () => {
      const existingIndex = createExpectedMetadataIndex();
      const newTokens = [
        createMockToken("7", [
          { trait_type: "Rarity", value: "Mythic" },
          { trait_type: "Background", value: "Rainbow" }
        ])
      ];

      const updated = updateMetadataIndex(existingIndex, newTokens);

      expect(updated.Rarity.Mythic).toEqual(['7']);
      expect(updated.Background.Rainbow).toEqual(['7']);
      expect(updated.Rarity.Legendary).toEqual(['1', '6']); // Unchanged
    });

    it('should merge tokens with existing trait values', () => {
      const existingIndex = { "Rarity": { "Epic": ["1"] } };
      const newTokens = [
        createMockToken("2", [{ trait_type: "Rarity", value: "Epic" }])
      ];

      const updated = updateMetadataIndex(existingIndex, newTokens);
      expect(updated.Rarity.Epic).toEqual(['1', '2']);
    });
  });

  describe('extractTokenAttributes', () => {
    it('should extract attributes from token metadata', () => {
      const token = createMockTokenCollection()[0];
      const attributes = extractTokenAttributes(token);

      expect(attributes).toEqual([
        { trait_type: "Rarity", value: "Legendary" },
        { trait_type: "Background", value: "Gold" },
        { trait_type: "Power", value: 9500 }
      ]);
    });

    it('should return empty array for missing metadata', () => {
      const token = createEdgeCaseTokens()[1]; // Token with null metadata
      const attributes = extractTokenAttributes(token);

      expect(attributes).toEqual([]);
    });
  });

  describe('calculateFilterCounts', () => {
    it('should calculate counts for all traits', () => {
      const index = createExpectedMetadataIndex();
      const counts = calculateFilterCounts(index);

      expect(counts.Rarity.Legendary).toBe(2);
      expect(counts.Rarity.Epic).toBe(2);
      expect(counts.Rarity.Common).toBe(2);
      expect(counts.Background.Gold).toBe(2);
      expect(counts.Background.Blue).toBe(2);
      expect(counts.Background.Green).toBe(2);
    });

    it('should calculate counts for specific token IDs', () => {
      const index = createExpectedMetadataIndex();
      const counts = calculateFilterCounts(index, ['1', '2', '3']);

      expect(counts.Rarity.Legendary).toBe(1); // Only token 1
      expect(counts.Rarity.Epic).toBe(2); // Tokens 2 and 3
      expect(counts.Rarity.Common).toBe(0); // No common tokens in subset
    });
  });

  describe('applyFilters', () => {
    it('should apply single trait filter', () => {
      const index = createExpectedMetadataIndex();
      const filters = { "Rarity": new Set(["Legendary"]) };
      const tokenIds = applyFilters(index, filters);

      expect(tokenIds).toEqual(['1', '6']);
    });

    it('should apply OR logic within same trait', () => {
      const index = createExpectedMetadataIndex();
      const filters = { "Rarity": new Set(["Legendary", "Epic"]) };
      const tokenIds = applyFilters(index, filters);

      expect(tokenIds.sort()).toEqual(['1', '2', '3', '6']);
    });

    it('should apply AND logic between different traits', () => {
      const index = createExpectedMetadataIndex();
      const filters = {
        "Rarity": new Set(["Epic"]),
        "Background": new Set(["Gold"])
      };
      const tokenIds = applyFilters(index, filters);

      expect(tokenIds).toEqual(['3']); // Only token 3 has Epic + Gold
    });

    it('should return empty array when no matches', () => {
      const index = createExpectedMetadataIndex();
      const filters = {
        "Rarity": new Set(["Mythic"]) // Non-existent value
      };
      const tokenIds = applyFilters(index, filters);

      expect(tokenIds).toEqual([]);
    });

    it('should return all tokens when no filters active', () => {
      const index = createExpectedMetadataIndex();
      const tokenIds = applyFilters(index, {});

      expect(tokenIds.sort()).toEqual(['1', '2', '3', '4', '5', '6']);
    });
  });

  describe('URL serialization', () => {
    describe('serializeFiltersToURL', () => {
      it('should serialize single trait single value', () => {
        const filters = { "Rarity": new Set(["legendary"]) };
        const url = serializeFiltersToURL(filters);
        expect(url).toBe('rarity:legendary');
      });

      it('should serialize single trait multiple values', () => {
        const filters = { "Rarity": new Set(["legendary", "epic"]) };
        const url = serializeFiltersToURL(filters);
        expect(url).toBe('rarity:legendary,epic');
      });

      it('should serialize multiple traits', () => {
        const filters = {
          "Rarity": new Set(["legendary"]),
          "Background": new Set(["gold", "blue"])
        };
        const url = serializeFiltersToURL(filters);
        expect(url).toBe('rarity:legendary|background:gold,blue');
      });

      it('should return empty string for no filters', () => {
        const url = serializeFiltersToURL({});
        expect(url).toBe('');
      });
    });

    describe('parseFiltersFromURL', () => {
      urlTestCases.forEach(({ description, urlParam, expected }) => {
        it(`should parse ${description}`, () => {
          const filters = parseFiltersFromURL(urlParam);
          expect(filters).toEqual(expected);
        });
      });

      it('should handle malformed URL params gracefully', () => {
        const filters = parseFiltersFromURL('invalid::format||');
        expect(filters).toEqual({});
      });
    });
  });
});