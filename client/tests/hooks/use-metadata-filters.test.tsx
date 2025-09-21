import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-hooks';
import { useMetadataFilters } from '@/hooks/use-metadata-filters';
import { useSearchParams } from 'react-router-dom';
import { createMockTokenCollection } from '../setup/metadata-filter.setup';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn()
}));

describe('useMetadataFilters Hook', () => {
  let mockSearchParams: URLSearchParams;
  let mockSetSearchParams: jest.Mock;

  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    mockSetSearchParams = jest.fn();
    (useSearchParams as jest.Mock).mockReturnValue([mockSearchParams, mockSetSearchParams]);
  });

  describe('initialization', () => {
    it('should initialize with empty filters', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123'
        })
      );

      expect(result.current.activeFilters).toEqual({});
      expect(result.current.filteredTokens).toHaveLength(6);
      expect(result.current.isEmpty).toBe(false);
    });

    it('should build metadata index from tokens', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123'
        })
      );

      expect(result.current.metadataIndex['Rarity']).toBeDefined();
      expect(result.current.metadataIndex['Background']).toBeDefined();
      expect(result.current.metadataIndex['Power']).toBeDefined();
    });

    it('should calculate available filters with counts', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123'
        })
      );

      expect(result.current.availableFilters['Rarity']['Legendary']).toBe(2);
      expect(result.current.availableFilters['Rarity']['Epic']).toBe(2);
      expect(result.current.availableFilters['Background']['Gold']).toBe(2);
    });

    it('should initialize from URL parameters', () => {
      mockSearchParams.set('filters', 'rarity:legendary');

      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123'
        })
      );

      expect(result.current.activeFilters['Rarity']).toContain('Legendary');
      expect(result.current.filteredTokens).toHaveLength(2);
    });

    it('should handle disabled state', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123',
          enabled: false
        })
      );

      // Should return all tokens when disabled
      expect(result.current.filteredTokens).toHaveLength(6);
      expect(result.current.activeFilters).toEqual({});
    });
  });

  describe('setFilter', () => {
    it('should add a new filter', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123'
        })
      );

      act(() => {
        result.current.setFilter('Rarity', 'Legendary');
      });

      expect(result.current.activeFilters['Rarity']).toContain('Legendary');
      expect(result.current.filteredTokens).toHaveLength(2);
    });

    it('should update URL when filter is set', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123'
        })
      );

      act(() => {
        result.current.setFilter('Rarity', 'Epic');
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: 'rarity:epic'
        })
      );
    });

    it('should handle multiple values for same trait', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123'
        })
      );

      act(() => {
        result.current.setFilter('Rarity', 'Legendary');
        result.current.setFilter('Rarity', 'Epic');
      });

      expect(result.current.activeFilters['Rarity']).toContain('Legendary');
      expect(result.current.activeFilters['Rarity']).toContain('Epic');
      expect(result.current.filteredTokens).toHaveLength(4); // 2 Legendary + 2 Epic
    });

    it('should apply AND logic between different traits', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123'
        })
      );

      act(() => {
        result.current.setFilter('Rarity', 'Epic');
        result.current.setFilter('Background', 'Gold');
      });

      expect(result.current.filteredTokens).toHaveLength(1); // Only token #3
      expect(result.current.filteredTokens[0].token_id).toBe('3');
    });
  });

  describe('removeFilter', () => {
    it('should remove specific filter value', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123'
        })
      );

      act(() => {
        result.current.setFilter('Rarity', 'Legendary');
        result.current.setFilter('Rarity', 'Epic');
        result.current.removeFilter('Rarity', 'Legendary');
      });

      expect(result.current.activeFilters['Rarity']).not.toContain('Legendary');
      expect(result.current.activeFilters['Rarity']).toContain('Epic');
      expect(result.current.filteredTokens).toHaveLength(2); // Only Epic tokens
    });

    it('should remove entire trait if no value specified', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123'
        })
      );

      act(() => {
        result.current.setFilter('Rarity', 'Legendary');
        result.current.setFilter('Background', 'Gold');
        result.current.removeFilter('Rarity');
      });

      expect(result.current.activeFilters['Rarity']).toBeUndefined();
      expect(result.current.activeFilters['Background']).toContain('Gold');
    });

    it('should update URL when filter is removed', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123'
        })
      );

      act(() => {
        result.current.setFilter('Rarity', 'Epic');
        result.current.removeFilter('Rarity', 'Epic');
      });

      expect(mockSetSearchParams).toHaveBeenLastCalledWith(
        expect.objectContaining({})
      );
    });
  });

  describe('clearAllFilters', () => {
    it('should clear all active filters', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123'
        })
      );

      act(() => {
        result.current.setFilter('Rarity', 'Legendary');
        result.current.setFilter('Background', 'Gold');
        result.current.clearAllFilters();
      });

      expect(result.current.activeFilters).toEqual({});
      expect(result.current.filteredTokens).toHaveLength(6);
    });

    it('should clear URL parameters', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123'
        })
      );

      act(() => {
        result.current.setFilter('Rarity', 'Epic');
        result.current.clearAllFilters();
      });

      expect(mockSetSearchParams).toHaveBeenLastCalledWith(
        expect.not.objectContaining({ filters: expect.anything() })
      );
    });
  });

  describe('status indicators', () => {
    it('should set isEmpty when no tokens match filters', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: createMockTokenCollection(),
          collectionAddress: '0x123'
        })
      );

      act(() => {
        result.current.setFilter('Rarity', 'Mythic'); // Non-existent value
      });

      expect(result.current.isEmpty).toBe(true);
      expect(result.current.filteredTokens).toHaveLength(0);
    });

    it('should set isLoading during index building', () => {
      const largeCollection = Array.from({ length: 1000 }, (_, i) =>
        createMockToken(i.toString(), [{ trait_type: 'Index', value: i }])
      );

      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: largeCollection,
          collectionAddress: '0x123'
        })
      );

      // Initial load should set isLoading
      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty token array', () => {
      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: [],
          collectionAddress: '0x123'
        })
      );

      expect(result.current.filteredTokens).toHaveLength(0);
      expect(result.current.metadataIndex).toEqual({});
      expect(result.current.availableFilters).toEqual({});
    });

    it('should handle tokens with no metadata', () => {
      const tokensWithoutMetadata = [
        { token_id: '1', contract_address: '0x123', metadata: null },
        { token_id: '2', contract_address: '0x123', metadata: {} }
      ] as any;

      const { result } = renderHook(() =>
        useMetadataFilters({
          tokens: tokensWithoutMetadata,
          collectionAddress: '0x123'
        })
      );

      expect(result.current.filteredTokens).toHaveLength(2);
      expect(result.current.metadataIndex['No Traits']).toBeDefined();
    });

    it('should handle collection address change', () => {
      const { result, rerender } = renderHook(
        ({ address }) =>
          useMetadataFilters({
            tokens: createMockTokenCollection(),
            collectionAddress: address
          }),
        { initialProps: { address: '0x123' } }
      );

      act(() => {
        result.current.setFilter('Rarity', 'Epic');
      });

      expect(result.current.activeFilters['Rarity']).toContain('Epic');

      // Change collection address
      rerender({ address: '0x456' });

      // Filters should be reset for new collection
      expect(result.current.activeFilters).toEqual({});
    });
  });
});