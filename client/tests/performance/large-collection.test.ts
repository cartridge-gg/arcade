import { describe, it, expect } from '@jest/globals';
import {
  buildMetadataIndex,
  updateMetadataIndex,
  calculateFilterCounts,
  applyFilters
} from '@/utils/metadata-indexer';
import { createLargeTokenCollection } from '../setup/metadata-filter.setup';

describe('Performance Tests', () => {
  describe('Large collection handling', () => {
    it('should build index for 10k tokens within 1 second', () => {
      const tokens = createLargeTokenCollection(10000);

      const startTime = performance.now();
      const index = buildMetadataIndex(tokens);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Less than 1 second
      expect(Object.keys(index)).toContain('Rarity');
      expect(Object.keys(index)).toContain('Background');
      expect(Object.keys(index)).toContain('Type');
    });

    it('should update index incrementally within 100ms for 1k new tokens', () => {
      const initialTokens = createLargeTokenCollection(5000);
      const newTokens = createLargeTokenCollection(1000).map(t => ({
        ...t,
        token_id: (5000 + Number.parseInt(t.token_id)).toString()
      }));

      const initialIndex = buildMetadataIndex(initialTokens);

      const startTime = performance.now();
      const updatedIndex = updateMetadataIndex(initialIndex, newTokens);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Less than 100ms
      expect(updatedIndex.Rarity.Common.length).toBeGreaterThan(
        initialIndex.Rarity.Common.length
      );
    });

    it('should apply filters on 10k tokens within 50ms', () => {
      const tokens = createLargeTokenCollection(10000);
      const index = buildMetadataIndex(tokens);

      const filters = {
        'Rarity': new Set(['Epic', 'Legendary']),
        'Background': new Set(['Gold'])
      };

      const startTime = performance.now();
      const filtered = applyFilters(index, filters);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50); // Less than 50ms
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.length).toBeLessThan(10000);
    });

    it('should calculate filter counts for 10k tokens within 100ms', () => {
      const tokens = createLargeTokenCollection(10000);
      const index = buildMetadataIndex(tokens);

      const startTime = performance.now();
      const counts = calculateFilterCounts(index);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Less than 100ms
      expect(counts.Rarity).toBeDefined();
      expect(counts.Background).toBeDefined();

      // Verify counts are correct
      const totalRarityCount = Object.values(counts.Rarity).reduce(
        (sum, count) => sum + count,
        0
      );
      expect(totalRarityCount).toBe(10000);
    });

    it('should handle 100k tokens with acceptable performance', () => {
      const tokens = createLargeTokenCollection(100000);

      const startTime = performance.now();
      const index = buildMetadataIndex(tokens);
      const endTime = performance.now();

      const buildDuration = endTime - startTime;

      // For 100k tokens, allow up to 10 seconds
      expect(buildDuration).toBeLessThan(10000);

      // Test filter application
      const filterStart = performance.now();
      const filtered = applyFilters(index, {
        'Rarity': new Set(['Legendary'])
      });
      const filterEnd = performance.now();

      const filterDuration = filterEnd - filterStart;

      // Filtering should still be fast even with 100k tokens
      expect(filterDuration).toBeLessThan(100);
      expect(filtered.length).toBeGreaterThan(0);
    });
  });

  describe('Memory efficiency', () => {
    it('should not create duplicate strings in metadata index', () => {
      const tokens = createLargeTokenCollection(1000);
      const index = buildMetadataIndex(tokens);

      // Check that token IDs are unique within each trait-value pair
      for (const trait of Object.values(index)) {
        for (const tokenIds of Object.values(trait)) {
          const uniqueIds = new Set(tokenIds);
          expect(uniqueIds.size).toBe(tokenIds.length);
        }
      }
    });

    it('should handle rapid filter changes efficiently', () => {
      const tokens = createLargeTokenCollection(5000);
      const index = buildMetadataIndex(tokens);

      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const filters = {
          'Rarity': new Set([['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][i % 5]]),
          'Background': new Set([['Red', 'Blue', 'Green', 'Gold', 'Silver', 'Purple'][i % 6]])
        };

        applyFilters(index, filters);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 100 filter applications should complete within 500ms
      expect(duration).toBeLessThan(500);
      expect(duration / iterations).toBeLessThan(5); // Average < 5ms per filter
    });
  });

  describe('Complex filter combinations performance', () => {
    it('should handle many traits with many values efficiently', () => {
      const tokens = createLargeTokenCollection(5000);
      const index = buildMetadataIndex(tokens);

      // Create a complex filter with multiple traits and values
      const filters = {
        'Rarity': new Set(['Common', 'Uncommon', 'Rare']),
        'Background': new Set(['Red', 'Blue', 'Green', 'Gold']),
        'Type': new Set(['Warrior', 'Mage', 'Archer']),
        'Power': new Set(['1000', '2000', '3000', '4000', '5000'])
      };

      const startTime = performance.now();
      const filtered = applyFilters(index, filters);
      const endTime = performance.now();

      const duration = endTime - startTime;

      // Complex filters should still be fast
      expect(duration).toBeLessThan(50);
      expect(filtered).toBeDefined();
    });

    it('should optimize empty result detection', () => {
      const tokens = createLargeTokenCollection(10000);
      const index = buildMetadataIndex(tokens);

      // Create filters that will result in no matches
      const filters = {
        'Rarity': new Set(['NonExistent']),
        'Background': new Set(['AlsoNonExistent'])
      };

      const startTime = performance.now();
      const filtered = applyFilters(index, filters);
      const endTime = performance.now();

      const duration = endTime - startTime;

      // Should exit early when no matches found
      expect(duration).toBeLessThan(10);
      expect(filtered).toEqual([]);
    });
  });

  describe('Incremental updates performance', () => {
    it('should efficiently handle streaming token updates', () => {
      let index = buildMetadataIndex([]);
      const batchSize = 100;
      const numBatches = 50;

      const durations: number[] = [];

      for (let i = 0; i < numBatches; i++) {
        const newTokens = createLargeTokenCollection(batchSize).map(t => ({
          ...t,
          token_id: (i * batchSize + Number.parseInt(t.token_id)).toString()
        }));

        const startTime = performance.now();
        index = updateMetadataIndex(index, newTokens);
        const endTime = performance.now();

        durations.push(endTime - startTime);
      }

      // Average update time should remain consistent
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      expect(avgDuration).toBeLessThan(20); // Less than 20ms per batch

      // Verify final index is correct
      const totalTokens = batchSize * numBatches;
      const allTokenIds = new Set<string>();
      for (const trait of Object.values(index)) {
        for (const ids of Object.values(trait)) {
          ids.forEach(id => allTokenIds.add(id));
        }
      }
      expect(allTokenIds.size).toBe(totalTokens);
    });
  });
});