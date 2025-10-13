import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Items } from '@/components/items';
import type { EditionModel } from '@cartridge/arcade';
import { createMockTokenCollection } from '../setup/metadata-filter.setup';

// Mock the hooks
jest.mock('@/hooks/marketplace-tokens-fetcher', () => ({
  useMarketTokensFetcher: jest.fn(() => ({
    collection: { name: 'Test Collection' },
    tokens: createMockTokenCollection(),
    filteredTokens: createMockTokenCollection()
  }))
}));

jest.mock('@/hooks/use-metadata-filters', () => ({
  useMetadataFilters: jest.fn()
}));

const mockEdition: EditionModel = {
  config: {
    project: 'test-project',
    rpc: 'http://test-rpc'
  },
  properties: {
    preset: 'test-preset'
  }
} as EditionModel;

describe('Single Trait Filtering Integration', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should filter tokens by single rarity trait', async () => {
    const mockUseMetadataFilters = require('@/hooks/use-metadata-filters').useMetadataFilters;
    const mockTokens = createMockTokenCollection();

    const currentFilters = {};
    const baseState = {
      metadataIndex: {
        'Rarity': {
          'Legendary': ['1', '6'],
          'Epic': ['2', '3'],
          'Common': ['4', '5']
        }
      },
      availableFilters: {
        'Rarity': {
          'Legendary': 2,
          'Epic': 2,
          'Common': 2
        }
      },
      precomputed: {
        attributes: ['Rarity'],
        properties: {
          Rarity: [
            { property: 'Legendary', order: 2 },
            { property: 'Epic', order: 2 },
            { property: 'Common', order: 2 }
          ]
        },
        allMetadata: []
      },
      statusFilter: 'all' as const,
      setStatusFilter: jest.fn(),
      removeFilter: jest.fn(),
      clearAllFilters: jest.fn(),
      isLoading: false,
      isEmpty: false
    };

    mockUseMetadataFilters.mockImplementation(() => ({
      filteredTokens: mockTokens.filter(token => {
        if (!currentFilters.Rarity) return true;
        const tokenRarity = token.metadata?.attributes?.find(
          attr => attr.trait_type === 'Rarity'
        )?.value;
        return currentFilters.Rarity.has(tokenRarity);
      }),
      activeFilters: currentFilters,
      setFilter: (trait: string, value: string) => {
        if (!currentFilters[trait]) {
          currentFilters[trait] = new Set();
        }
        currentFilters[trait].add(value);
      },
      ...baseState
    }));

    const { container } = render(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    // Initially all 6 tokens should be visible
    await waitFor(() => {
      const cards = container.querySelectorAll('[data-testid="collectible-card"]');
      expect(cards).toHaveLength(6);
    });

    // Find and click the Legendary rarity filter
    const legendaryFilter = screen.getByLabelText('Filter by Legendary');
    fireEvent.click(legendaryFilter);

    // Should now show only 2 Legendary tokens
    await waitFor(() => {
      const cards = container.querySelectorAll('[data-testid="collectible-card"]');
      expect(cards).toHaveLength(2);
    });

    // Verify the correct tokens are displayed (tokens 1 and 6)
    const displayedTokenIds = Array.from(
      container.querySelectorAll('[data-token-id]')
    ).map(el => el.getAttribute('data-token-id'));

    expect(displayedTokenIds).toContain('1');
    expect(displayedTokenIds).toContain('6');
  });

  it('should update count display when filter is applied', async () => {
    const mockUseMetadataFilters = require('@/hooks/use-metadata-filters').useMetadataFilters;

    mockUseMetadataFilters.mockImplementation(() => ({
      filteredTokens: createMockTokenCollection().slice(0, 3), // 3 filtered tokens
      metadataIndex: {},
      activeFilters: { 'Rarity': new Set(['Epic']) },
      availableFilters: {},
      setFilter: jest.fn(),
      removeFilter: jest.fn(),
      clearAllFilters: jest.fn(),
      isLoading: false,
      isEmpty: false,
      precomputed: { attributes: [], properties: {}, allMetadata: [] },
      statusFilter: 'all',
      setStatusFilter: jest.fn()
    }));

    render(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    // Check that the count shows filtered results
    await waitFor(() => {
      expect(screen.getByText(/3 Items/i)).toBeInTheDocument();
    });
  });

  it('should show empty state when no tokens match filter', async () => {
    const mockUseMetadataFilters = require('@/hooks/use-metadata-filters').useMetadataFilters;

    mockUseMetadataFilters.mockImplementation(() => ({
      filteredTokens: [],
      metadataIndex: {},
      activeFilters: { 'Rarity': new Set(['Mythic']) }, // Non-existent rarity
      availableFilters: {},
      setFilter: jest.fn(),
      removeFilter: jest.fn(),
      clearAllFilters: jest.fn(),
      isLoading: false,
      isEmpty: true
    }));

    render(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    // Should show empty state message
    await waitFor(() => {
      expect(screen.getByText(/No results meet this criteria/i)).toBeInTheDocument();
    });
  });

  it('should allow toggling filter on and off', async () => {
    const mockUseMetadataFilters = require('@/hooks/use-metadata-filters').useMetadataFilters;
    const mockSetFilter = jest.fn();
    const mockRemoveFilter = jest.fn();

    let isFilterActive = false;
    mockUseMetadataFilters.mockImplementation(() => ({
      filteredTokens: isFilterActive
        ? createMockTokenCollection().slice(0, 2)
        : createMockTokenCollection(),
      metadataIndex: {},
      activeFilters: isFilterActive ? { 'Rarity': new Set(['Legendary']) } : {},
      availableFilters: {
        'Rarity': { 'Legendary': 2 }
      },
      setFilter: (trait: string, value: string) => {
        mockSetFilter(trait, value);
        isFilterActive = true;
      },
      removeFilter: (trait: string, value: string) => {
        mockRemoveFilter(trait, value);
        isFilterActive = false;
      },
      clearAllFilters: jest.fn(),
      isLoading: false,
      isEmpty: false
    }));

    const { container, rerender } = render(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    // Click filter to activate
    const legendaryFilter = screen.getByLabelText('Filter by Legendary');
    fireEvent.click(legendaryFilter);

    expect(mockSetFilter).toHaveBeenCalledWith('Rarity', 'Legendary');

    // Re-render with filter active
    isFilterActive = true;
    rerender(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    await waitFor(() => {
      const cards = container.querySelectorAll('[data-testid="collectible-card"]');
      expect(cards).toHaveLength(2);
    });

    // Click again to deactivate
    fireEvent.click(legendaryFilter);
    expect(mockRemoveFilter).toHaveBeenCalledWith('Rarity', 'Legendary');

    // Re-render with filter inactive
    isFilterActive = false;
    rerender(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    await waitFor(() => {
      const cards = container.querySelectorAll('[data-testid="collectible-card"]');
      expect(cards).toHaveLength(6);
    });
  });
});
