import { describe, it, expect } from '@jest/globals';
import {
  buildMetadataIndex,
  extractTokenAttributes,
  calculateFilterCounts,
  applyFilters
} from '@/utils/metadata-indexer';
import { Token } from '@dojoengine/torii-wasm';

describe('Metadata Edge Cases', () => {
  describe('Malformed metadata handling', () => {
    it('should handle tokens with circular reference in metadata', () => {
      const circular: any = { prop: null };
      circular.prop = circular;

      const token = {
        token_id: '1',
        contract_address: '0x123',
        metadata: circular
      } as Token;

      const attributes = extractTokenAttributes(token);
      expect(attributes).toEqual([]);
    });

    it('should handle deeply nested metadata structures', () => {
      const token = {
        token_id: '1',
        contract_address: '0x123',
        metadata: {
          attributes: [
            {
              trait_type: 'Level1',
              value: {
                nested: {
                  deeply: {
                    value: 'DeepValue'
                  }
                }
              }
            }
          ]
        }
      } as Token;

      const index = buildMetadataIndex([token]);
      // Should stringify the nested object
      expect(index['Level1']).toBeDefined();
    });

    it('should handle tokens with very long attribute values', () => {
      const longValue = 'A'.repeat(10000);
      const token = {
        token_id: '1',
        contract_address: '0x123',
        metadata: {
          attributes: [
            { trait_type: 'LongTrait', value: longValue }
          ]
        }
      } as any;

      const index = buildMetadataIndex([token]);
      expect(index['LongTrait'][longValue]).toEqual(['1']);
    });

    it('should handle special characters in trait names and values', () => {
      const specialChars = ['!@#$%^&*()', '中文字符', '🔥💎', 'Line\nBreak', 'Tab\tChar'];
      const tokens = specialChars.map((char, idx) => ({
        token_id: idx.toString(),
        contract_address: '0x123',
        metadata: {
          attributes: [
            { trait_type: char, value: char }
          ]
        }
      } as any));

      const index = buildMetadataIndex(tokens);

      specialChars.forEach((char, idx) => {
        expect(index[char]).toBeDefined();
        expect(index[char][char]).toContain(idx.toString());
      });
    });

    it('should handle attributes with null, undefined, and empty values', () => {
      const tokens = [
        {
          token_id: '1',
          contract_address: '0x123',
          metadata: {
            attributes: [
              { trait_type: 'NullValue', value: null },
              { trait_type: 'UndefinedValue', value: undefined },
              { trait_type: 'EmptyString', value: '' },
              { trait_type: 'Zero', value: 0 },
              { trait_type: 'False', value: false }
            ]
          }
        }
      ] as any[];

      const index = buildMetadataIndex(tokens);

      // Null and undefined should be ignored
      expect(index['NullValue']).toBeUndefined();
      expect(index['UndefinedValue']).toBeUndefined();

      // Empty string, zero, and false should be indexed
      expect(index['EmptyString']['']).toEqual(['1']);
      expect(index['Zero']['0']).toEqual(['1']);
      expect(index['False']['false']).toEqual(['1']);
    });

    it('should handle duplicate token IDs gracefully', () => {
      const tokens = [
        {
          token_id: '1',
          contract_address: '0x123',
          metadata: { attributes: [{ trait_type: 'Rarity', value: 'Common' }] }
        },
        {
          token_id: '1', // Duplicate ID
          contract_address: '0x123',
          metadata: { attributes: [{ trait_type: 'Rarity', value: 'Common' }] }
        }
      ] as any[];

      const index = buildMetadataIndex(tokens);

      // Should not duplicate the token ID in the index
      expect(index['Rarity']['Common']).toEqual(['1']);
      expect(index['Rarity']['Common'].length).toBe(1);
    });
  });

  describe('Large dataset handling', () => {
    it('should handle collections with many unique traits', () => {
      const tokens = Array.from({ length: 1000 }, (_, i) => ({
        token_id: i.toString(),
        contract_address: '0x123',
        metadata: {
          attributes: [
            { trait_type: `Trait${i}`, value: `Value${i}` }
          ]
        }
      })) as Token[];

      const index = buildMetadataIndex(tokens);

      expect(Object.keys(index)).toHaveLength(1000);
      expect(index['Trait500']['Value500']).toEqual(['500']);
    });

    it('should handle tokens with many attributes each', () => {
      const token = {
        token_id: '1',
        contract_address: '0x123',
        metadata: {
          attributes: Array.from({ length: 100 }, (_, i) => ({
            trait_type: `Trait${i}`,
            value: `Value${i}`
          }))
        }
      } as any;

      const index = buildMetadataIndex([token]);

      expect(Object.keys(index)).toHaveLength(100);
      Object.keys(index).forEach(trait => {
        expect(index[trait][Object.keys(index[trait])[0]]).toContain('1');
      });
    });
  });

  describe('Filter edge cases', () => {
    it('should handle filters with non-existent traits', () => {
      const index = {
        'Rarity': { 'Common': ['1', '2'] }
      };

      const result = applyFilters(index, {
        'NonExistentTrait': new Set(['Value'])
      });

      expect(result).toEqual([]);
    });

    it('should handle filters with empty value sets', () => {
      const index = {
        'Rarity': { 'Common': ['1', '2'] }
      };

      const result = applyFilters(index, {
        'Rarity': new Set() // Empty set
      });

      expect(result).toEqual([]);
    });

    it('should handle complex filter combinations', () => {
      const index = {
        'Trait1': { 'A': ['1', '2', '3'], 'B': ['4', '5'] },
        'Trait2': { 'X': ['1', '4'], 'Y': ['2', '5'], 'Z': ['3'] },
        'Trait3': { 'P': ['1', '2'], 'Q': ['3', '4', '5'] }
      };

      // Complex AND/OR combination
      const result = applyFilters(index, {
        'Trait1': new Set(['A', 'B']), // 1,2,3,4,5
        'Trait2': new Set(['X', 'Y']), // 1,2,4,5
        'Trait3': new Set(['Q'])       // 3,4,5
      });

      // Only tokens that match all three conditions: 4,5
      expect(result.sort()).toEqual(['4', '5']);
    });
  });

  describe('Count calculation edge cases', () => {
    it('should handle count calculation with empty index', () => {
      const counts = calculateFilterCounts({});
      expect(counts).toEqual({});
    });

    it('should handle count calculation with overlapping token IDs', () => {
      const index = {
        'Trait1': { 'Value1': ['1', '2', '3'] },
        'Trait2': { 'Value2': ['2', '3', '4'] }
      };

      const counts = calculateFilterCounts(index, ['2', '3']);

      expect(counts['Trait1']['Value1']).toBe(2); // Only tokens 2 and 3
      expect(counts['Trait2']['Value2']).toBe(2); // Only tokens 2 and 3
    });

    it('should handle count calculation with no matching tokens', () => {
      const index = {
        'Trait1': { 'Value1': ['1', '2'] }
      };

      const counts = calculateFilterCounts(index, ['99', '100']);

      expect(counts['Trait1']['Value1']).toBe(0);
    });
  });

  describe('URL serialization edge cases', () => {
    it('should handle trait names with special URL characters', () => {
      const { serializeFiltersToURL, parseFiltersFromURL } = require('@/utils/metadata-indexer');

      const filters = {
        'Trait & Name': new Set(['Value 1', 'Value/2']),
        'Trait:Name': new Set(['Value=3'])
      };

      const url = serializeFiltersToURL(filters);
      const parsed = parseFiltersFromURL(url);

      // Should preserve the filter structure after round-trip
      expect(Object.keys(parsed)).toHaveLength(2);
    });
  });
});