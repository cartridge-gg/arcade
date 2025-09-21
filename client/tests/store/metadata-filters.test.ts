import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-hooks';
import { useMetadataFilterStore } from '@/store/metadata-filters';
import { createExpectedMetadataIndex, createMockActiveFilters } from '../setup/metadata-filter.setup';

describe('Metadata Filter Store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useMetadataFilterStore());
    act(() => {
      // Reset store to initial state
      result.current.collections = {};
    });
  });

  describe('setMetadataIndex', () => {
    it('should set metadata index for a collection', () => {
      const { result } = renderHook(() => useMetadataFilterStore());
      const index = createExpectedMetadataIndex();

      act(() => {
        result.current.setMetadataIndex('0x123', index);
      });

      const state = result.current.getCollectionState('0x123');
      expect(state?.metadataIndex).toEqual(index);
    });

    it('should update existing index', () => {
      const { result } = renderHook(() => useMetadataFilterStore());
      const index1 = { "Trait1": { "Value1": ["1"] } };
      const index2 = { "Trait2": { "Value2": ["2"] } };

      act(() => {
        result.current.setMetadataIndex('0x123', index1);
        result.current.setMetadataIndex('0x123', index2);
      });

      const state = result.current.getCollectionState('0x123');
      expect(state?.metadataIndex).toEqual(index2);
    });
  });

  describe('setActiveFilters', () => {
    it('should set active filters for a collection', () => {
      const { result } = renderHook(() => useMetadataFilterStore());
      const filters = createMockActiveFilters();

      act(() => {
        result.current.setActiveFilters('0x123', filters);
      });

      const activeFilters = result.current.getActiveFilters('0x123');
      expect(activeFilters).toEqual(filters);
    });
  });

  describe('toggleFilter', () => {
    it('should add filter if not present', () => {
      const { result } = renderHook(() => useMetadataFilterStore());

      act(() => {
        result.current.setMetadataIndex('0x123', createExpectedMetadataIndex());
        result.current.toggleFilter('0x123', 'Rarity', 'Legendary');
      });

      const filters = result.current.getActiveFilters('0x123');
      expect(filters['Rarity']).toContain('Legendary');
    });

    it('should remove filter if present', () => {
      const { result } = renderHook(() => useMetadataFilterStore());

      act(() => {
        result.current.setMetadataIndex('0x123', createExpectedMetadataIndex());
        result.current.setActiveFilters('0x123', {
          'Rarity': new Set(['Legendary'])
        });
        result.current.toggleFilter('0x123', 'Rarity', 'Legendary');
      });

      const filters = result.current.getActiveFilters('0x123');
      expect(filters['Rarity']).not.toContain('Legendary');
    });

    it('should handle multiple values for same trait', () => {
      const { result } = renderHook(() => useMetadataFilterStore());

      act(() => {
        result.current.setMetadataIndex('0x123', createExpectedMetadataIndex());
        result.current.toggleFilter('0x123', 'Rarity', 'Legendary');
        result.current.toggleFilter('0x123', 'Rarity', 'Epic');
      });

      const filters = result.current.getActiveFilters('0x123');
      expect(filters['Rarity']).toContain('Legendary');
      expect(filters['Rarity']).toContain('Epic');
    });
  });

  describe('removeFilter', () => {
    it('should remove specific value from trait', () => {
      const { result } = renderHook(() => useMetadataFilterStore());

      act(() => {
        result.current.setMetadataIndex('0x123', createExpectedMetadataIndex());
        result.current.setActiveFilters('0x123', {
          'Rarity': new Set(['Legendary', 'Epic'])
        });
        result.current.removeFilter('0x123', 'Rarity', 'Legendary');
      });

      const filters = result.current.getActiveFilters('0x123');
      expect(filters['Rarity']).not.toContain('Legendary');
      expect(filters['Rarity']).toContain('Epic');
    });

    it('should remove entire trait if no value specified', () => {
      const { result } = renderHook(() => useMetadataFilterStore());

      act(() => {
        result.current.setMetadataIndex('0x123', createExpectedMetadataIndex());
        result.current.setActiveFilters('0x123', {
          'Rarity': new Set(['Legendary', 'Epic']),
          'Background': new Set(['Gold'])
        });
        result.current.removeFilter('0x123', 'Rarity');
      });

      const filters = result.current.getActiveFilters('0x123');
      expect(filters['Rarity']).toBeUndefined();
      expect(filters['Background']).toContain('Gold');
    });
  });

  describe('clearFilters', () => {
    it('should clear all filters for a collection', () => {
      const { result } = renderHook(() => useMetadataFilterStore());

      act(() => {
        result.current.setMetadataIndex('0x123', createExpectedMetadataIndex());
        result.current.setActiveFilters('0x123', createMockActiveFilters());
        result.current.clearFilters('0x123');
      });

      const filters = result.current.getActiveFilters('0x123');
      expect(filters).toEqual({});
    });
  });

  describe('getFilteredTokenIds', () => {
    it('should return filtered token IDs based on active filters', () => {
      const { result } = renderHook(() => useMetadataFilterStore());

      act(() => {
        result.current.setMetadataIndex('0x123', createExpectedMetadataIndex());
        result.current.setActiveFilters('0x123', {
          'Rarity': new Set(['Legendary'])
        });
      });

      const tokenIds = result.current.getFilteredTokenIds('0x123');
      expect(tokenIds.sort()).toEqual(['1', '6']);
    });

    it('should return all token IDs when no filters active', () => {
      const { result } = renderHook(() => useMetadataFilterStore());

      act(() => {
        result.current.setMetadataIndex('0x123', createExpectedMetadataIndex());
      });

      const tokenIds = result.current.getFilteredTokenIds('0x123');
      expect(tokenIds.sort()).toEqual(['1', '2', '3', '4', '5', '6']);
    });

    it('should handle AND logic between traits', () => {
      const { result } = renderHook(() => useMetadataFilterStore());

      act(() => {
        result.current.setMetadataIndex('0x123', createExpectedMetadataIndex());
        result.current.setActiveFilters('0x123', {
          'Rarity': new Set(['Epic']),
          'Background': new Set(['Gold'])
        });
      });

      const tokenIds = result.current.getFilteredTokenIds('0x123');
      expect(tokenIds).toEqual(['3']);
    });
  });

  describe('updateAvailableFilters', () => {
    it('should update available filter counts', () => {
      const { result } = renderHook(() => useMetadataFilterStore());
      const availableFilters = {
        'Rarity': { 'Legendary': 2, 'Epic': 3 },
        'Background': { 'Gold': 1, 'Blue': 4 }
      };

      act(() => {
        result.current.setMetadataIndex('0x123', createExpectedMetadataIndex());
        result.current.updateAvailableFilters('0x123', availableFilters);
      });

      const state = result.current.getCollectionState('0x123');
      expect(state?.availableFilters).toEqual(availableFilters);
    });
  });

  describe('multiple collections', () => {
    it('should handle filters for multiple collections independently', () => {
      const { result } = renderHook(() => useMetadataFilterStore());

      act(() => {
        result.current.setMetadataIndex('0x123', createExpectedMetadataIndex());
        result.current.setMetadataIndex('0x456', { 'Other': { 'Value': ['10'] } });
        result.current.toggleFilter('0x123', 'Rarity', 'Epic');
        result.current.toggleFilter('0x456', 'Other', 'Value');
      });

      const filters123 = result.current.getActiveFilters('0x123');
      const filters456 = result.current.getActiveFilters('0x456');

      expect(filters123['Rarity']).toContain('Epic');
      expect(filters456['Other']).toContain('Value');
      expect(filters123['Other']).toBeUndefined();
    });
  });
});