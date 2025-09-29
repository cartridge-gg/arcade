import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Items } from '@/components/items';
import { EditionModel } from '@cartridge/arcade';
import { createMockTokenCollection } from '../setup/metadata-filter.setup';

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

describe('Multiple Trait AND Logic Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should apply AND logic between different traits', async () => {
    const mockUseMetadataFilters = require('@/hooks/use-metadata-filters').useMetadataFilters;
    const mockTokens = createMockTokenCollection();

    let activeFilters = {};
    mockUseMetadataFilters.mockImplementation(() => ({
      filteredTokens: mockTokens.filter(token => {
        // Apply AND logic between traits
        for (const [trait, values] of Object.entries(activeFilters)) {
          const tokenAttr = token.metadata?.attributes?.find(
            attr => attr.trait_type === trait
          );
          if (!tokenAttr || !values.has(tokenAttr.value)) {
            return false;
          }
        }
        return true;
      }),
      metadataIndex: {
        'Rarity': {
          'Epic': ['2', '3']
        },
        'Background': {
          'Gold': ['1', '3']
        }
      },
      activeFilters,
      availableFilters: {
        'Rarity': { 'Epic': 2 },
        'Background': { 'Gold': 2 }
      },
      setFilter: (trait: string, value: string) => {
        if (!activeFilters[trait]) {
          activeFilters[trait] = new Set();
        }
        activeFilters[trait].add(value);
      },
      removeFilter: jest.fn(),
      clearAllFilters: jest.fn(),
      isLoading: false,
      isEmpty: false
    }));

    const { container, rerender } = render(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    // Initially all tokens visible
    await waitFor(() => {
      const cards = container.querySelectorAll('[data-testid="collectible-card"]');
      expect(cards).toHaveLength(6);
    });

    // Apply Epic rarity filter
    const epicFilter = screen.getByLabelText('Filter by Epic');
    fireEvent.click(epicFilter);

    activeFilters = { 'Rarity': new Set(['Epic']) };
    rerender(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    // Should show 2 Epic tokens (tokens 2 and 3)
    await waitFor(() => {
      const cards = container.querySelectorAll('[data-testid="collectible-card"]');
      expect(cards).toHaveLength(2);
    });

    // Now add Gold background filter
    const goldFilter = screen.getByLabelText('Filter by Gold');
    fireEvent.click(goldFilter);

    activeFilters = {
      'Rarity': new Set(['Epic']),
      'Background': new Set(['Gold'])
    };
    rerender(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    // Should show only token 3 (Epic + Gold)
    await waitFor(() => {
      const cards = container.querySelectorAll('[data-testid="collectible-card"]');
      expect(cards).toHaveLength(1);
    });

    // Verify it's token 3
    const displayedToken = container.querySelector('[data-token-id]');
    expect(displayedToken?.getAttribute('data-token-id')).toBe('3');
  });

  it('should apply OR logic within same trait', async () => {
    const mockUseMetadataFilters = require('@/hooks/use-metadata-filters').useMetadataFilters;
    const mockTokens = createMockTokenCollection();

    let activeFilters = {};
    mockUseMetadataFilters.mockImplementation(() => ({
      filteredTokens: mockTokens.filter(token => {
        if (Object.keys(activeFilters).length === 0) return true;

        // OR within trait, AND between traits
        for (const [trait, values] of Object.entries(activeFilters)) {
          const tokenAttr = token.metadata?.attributes?.find(
            attr => attr.trait_type === trait
          );
          if (!tokenAttr || !values.has(tokenAttr.value)) {
            return false;
          }
        }
        return true;
      }),
      metadataIndex: {
        'Rarity': {
          'Legendary': ['1', '6'],
          'Epic': ['2', '3']
        }
      },
      activeFilters,
      availableFilters: {
        'Rarity': {
          'Legendary': 2,
          'Epic': 2
        }
      },
      setFilter: (trait: string, value: string) => {
        if (!activeFilters[trait]) {
          activeFilters[trait] = new Set();
        }
        activeFilters[trait].add(value);
      },
      removeFilter: jest.fn(),
      clearAllFilters: jest.fn(),
      isLoading: false,
      isEmpty: false
    }));

    const { container, rerender } = render(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    // Apply Legendary filter
    const legendaryFilter = screen.getByLabelText('Filter by Legendary');
    fireEvent.click(legendaryFilter);

    activeFilters = { 'Rarity': new Set(['Legendary']) };
    rerender(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    await waitFor(() => {
      const cards = container.querySelectorAll('[data-testid="collectible-card"]');
      expect(cards).toHaveLength(2); // Tokens 1 and 6
    });

    // Add Epic to same trait (OR logic)
    const epicFilter = screen.getByLabelText('Filter by Epic');
    fireEvent.click(epicFilter);

    activeFilters = { 'Rarity': new Set(['Legendary', 'Epic']) };
    rerender(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    // Should show all Legendary OR Epic tokens
    await waitFor(() => {
      const cards = container.querySelectorAll('[data-testid="collectible-card"]');
      expect(cards).toHaveLength(4); // Tokens 1, 2, 3, 6
    });
  });

  it('should dynamically update available filter counts', async () => {
    const mockUseMetadataFilters = require('@/hooks/use-metadata-filters').useMetadataFilters;

    let activeFilters = {};
    let availableFilters = {
      'Rarity': { 'Epic': 2, 'Common': 2 },
      'Background': { 'Gold': 2, 'Blue': 2, 'Green': 2 }
    };

    mockUseMetadataFilters.mockImplementation(() => ({
      filteredTokens: [],
      metadataIndex: {},
      activeFilters,
      availableFilters,
      setFilter: (trait: string, value: string) => {
        activeFilters = { 'Rarity': new Set(['Epic']) };
        // Update counts after Epic filter applied
        availableFilters = {
          'Rarity': { 'Epic': 2, 'Common': 0 },
          'Background': { 'Gold': 1, 'Blue': 1, 'Green': 0 }
        };
      },
      removeFilter: jest.fn(),
      clearAllFilters: jest.fn(),
      isLoading: false,
      isEmpty: false
    }));

    const { rerender } = render(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    // Check initial counts
    expect(screen.getByText(/Epic \(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/Gold \(2\)/)).toBeInTheDocument();

    // Apply Epic filter
    const epicFilter = screen.getByLabelText('Filter by Epic');
    fireEvent.click(epicFilter);

    rerender(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    // Counts should update to show only compatible options
    await waitFor(() => {
      expect(screen.getByText(/Gold \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Blue \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Green \(0\)/)).toBeInTheDocument();
    });
  });

  it('should handle clearing filters with multiple traits active', async () => {
    const mockUseMetadataFilters = require('@/hooks/use-metadata-filters').useMetadataFilters;
    const mockClearAllFilters = jest.fn();

    let activeFilters = {
      'Rarity': new Set(['Epic']),
      'Background': new Set(['Gold', 'Blue'])
    };

    mockUseMetadataFilters.mockImplementation(() => ({
      filteredTokens: [],
      metadataIndex: {},
      activeFilters,
      availableFilters: {},
      setFilter: jest.fn(),
      removeFilter: jest.fn(),
      clearAllFilters: () => {
        mockClearAllFilters();
        activeFilters = {};
      },
      isLoading: false,
      isEmpty: false
    }));

    const { rerender } = render(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    // Should show active filter indicator
    expect(screen.getByText(/Clear All/i)).toBeInTheDocument();

    // Click clear all button
    const clearButton = screen.getByText(/Clear All/i);
    fireEvent.click(clearButton);

    expect(mockClearAllFilters).toHaveBeenCalled();

    activeFilters = {};
    rerender(
      <MemoryRouter>
        <Items edition={mockEdition} collectionAddress="0x123" />
      </MemoryRouter>
    );

    // Filters should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/Clear All/i)).not.toBeInTheDocument();
    });
  });
});