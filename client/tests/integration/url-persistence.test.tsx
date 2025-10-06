import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Items } from '@/components/items';
import type { EditionModel } from '@cartridge/arcade';
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

describe('URL Persistence Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize filters from URL parameters', async () => {
    const mockUseMetadataFilters = require('@/hooks/use-metadata-filters').useMetadataFilters;

    mockUseMetadataFilters.mockImplementation(({ tokens }) => {
      // Parse URL to get initial filters
      const params = new URLSearchParams(window.location.search);
      const filterParam = params.get('filters');

      let activeFilters = {};
      if (filterParam === 'rarity:legendary') {
        activeFilters = { 'Rarity': new Set(['Legendary']) };
      }

      const filtered = tokens.filter(token => {
        if (!activeFilters.Rarity) return true;
        const rarity = token.metadata?.attributes?.find(
          attr => attr.trait_type === 'Rarity'
        )?.value;
        return activeFilters.Rarity.has(rarity);
      });

      return {
        filteredTokens: filtered,
        metadataIndex: {},
        activeFilters,
        availableFilters: {},
        setFilter: jest.fn(),
        removeFilter: jest.fn(),
        clearAllFilters: jest.fn(),
        isLoading: false,
        isEmpty: false,
        precomputed: { attributes: [], properties: {}, allMetadata: [] },
        statusFilter: 'all',
        setStatusFilter: jest.fn()
      };
    });

    render(
      <MemoryRouter initialEntries={['/collection/0x123?filters=rarity:legendary']}>
        <Routes>
          <Route
            path="/collection/:address"
            element={<Items edition={mockEdition} collectionAddress="0x123" />}
          />
        </Routes>
      </MemoryRouter>
    );

    // Should show only Legendary tokens
    await waitFor(() => {
      const cards = screen.getAllByTestId('collectible-card');
      expect(cards).toHaveLength(2); // Tokens 1 and 6
    });
  });

  it('should update URL when filters change', async () => {
    const mockUseMetadataFilters = require('@/hooks/use-metadata-filters').useMetadataFilters;
    const mockSetFilter = jest.fn();
    let currentUrl = '/collection/0x123';

    mockUseMetadataFilters.mockImplementation(() => ({
      filteredTokens: createMockTokenCollection(),
      metadataIndex: {},
      activeFilters: {},
      availableFilters: {},
      setFilter: (trait: string, value: string) => {
        mockSetFilter(trait, value);
        // Simulate URL update
        currentUrl = `/collection/0x123?filters=${trait.toLowerCase()}:${value.toLowerCase()}`;
      },
      removeFilter: jest.fn(),
      clearAllFilters: jest.fn(),
      isLoading: false,
      isEmpty: false,
      precomputed: { attributes: [], properties: {}, allMetadata: [] },
      statusFilter: 'all',
      setStatusFilter: jest.fn()
    }));

    render(
      <MemoryRouter initialEntries={[currentUrl]}>
        <Routes>
          <Route
            path="/collection/:address"
            element={<Items edition={mockEdition} collectionAddress="0x123" />}
          />
        </Routes>
      </MemoryRouter>
    );

    // Apply a filter
    const epicFilter = screen.getByLabelText('Filter by Epic');
    fireEvent.click(epicFilter);

    expect(mockSetFilter).toHaveBeenCalledWith('Rarity', 'Epic');
    expect(currentUrl).toBe('/collection/0x123?filters=rarity:epic');
  });

  it('should handle multiple filters in URL', async () => {
    const mockUseMetadataFilters = require('@/hooks/use-metadata-filters').useMetadataFilters;

    mockUseMetadataFilters.mockImplementation(() => {
      const params = new URLSearchParams(window.location.search);
      const filterParam = params.get('filters');

      let activeFilters = {};
      if (filterParam === 'rarity:epic|background:gold') {
        activeFilters = {
          'Rarity': new Set(['Epic']),
          'Background': new Set(['Gold'])
        };
      }

      return {
        filteredTokens: [createMockTokenCollection()[2]], // Only token 3
        metadataIndex: {},
        activeFilters,
        availableFilters: {},
        setFilter: jest.fn(),
        removeFilter: jest.fn(),
        clearAllFilters: jest.fn(),
        isLoading: false,
        isEmpty: false,
        precomputed: { attributes: [], properties: {}, allMetadata: [] },
        statusFilter: 'all',
        setStatusFilter: jest.fn()
      };
    });

    render(
      <MemoryRouter initialEntries={['/collection/0x123?filters=rarity:epic|background:gold']}>
        <Routes>
          <Route
            path="/collection/:address"
            element={<Items edition={mockEdition} collectionAddress="0x123" />}
          />
        </Routes>
      </MemoryRouter>
    );

    // Should show only token that matches both filters
    await waitFor(() => {
      const cards = screen.getAllByTestId('collectible-card');
      expect(cards).toHaveLength(1);
    });
  });

  it('should preserve filters when navigating away and back', async () => {
    const mockUseMetadataFilters = require('@/hooks/use-metadata-filters').useMetadataFilters;
    let savedFilters = {};

    mockUseMetadataFilters.mockImplementation(() => {
      const params = new URLSearchParams(window.location.search);
      const filterParam = params.get('filters');

      // Restore saved filters from URL
      if (filterParam) {
        savedFilters = { 'Rarity': new Set(['Legendary']) };
      }

      return {
        filteredTokens: Object.keys(savedFilters).length > 0
          ? createMockTokenCollection().slice(0, 2)
          : createMockTokenCollection(),
        metadataIndex: {},
        activeFilters: savedFilters,
        availableFilters: {},
        setFilter: jest.fn(),
        removeFilter: jest.fn(),
        clearAllFilters: jest.fn(),
        isLoading: false,
        isEmpty: false,
        precomputed: { attributes: [], properties: {}, allMetadata: [] },
        statusFilter: 'all',
        setStatusFilter: jest.fn()
      };
    });

    const { rerender } = render(
      <MemoryRouter initialEntries={['/collection/0x123?filters=rarity:legendary']}>
        <Routes>
          <Route
            path="/collection/:address"
            element={<Items edition={mockEdition} collectionAddress="0x123" />}
          />
          <Route path="/other" element={<div>Other Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Initial render with filters
    await waitFor(() => {
      const cards = screen.getAllByTestId('collectible-card');
      expect(cards).toHaveLength(2);
    });

    // Navigate to another page
    rerender(
      <MemoryRouter initialEntries={['/other']}>
        <Routes>
          <Route
            path="/collection/:address"
            element={<Items edition={mockEdition} collectionAddress="0x123" />}
          />
          <Route path="/other" element={<div>Other Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Other Page')).toBeInTheDocument();

    // Navigate back with filters in URL
    rerender(
      <MemoryRouter initialEntries={['/collection/0x123?filters=rarity:legendary']}>
        <Routes>
          <Route
            path="/collection/:address"
            element={<Items edition={mockEdition} collectionAddress="0x123" />}
          />
          <Route path="/other" element={<div>Other Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Filters should be restored
    await waitFor(() => {
      const cards = screen.getAllByTestId('collectible-card');
      expect(cards).toHaveLength(2);
    });
  });

  it('should handle clearing filters from URL', async () => {
    const mockUseMetadataFilters = require('@/hooks/use-metadata-filters').useMetadataFilters;
    let currentUrl = '/collection/0x123?filters=rarity:epic';

    mockUseMetadataFilters.mockImplementation(() => {
      const hasFilters = currentUrl.includes('filters=');

      return {
        filteredTokens: hasFilters
          ? createMockTokenCollection().slice(0, 2)
          : createMockTokenCollection(),
        metadataIndex: {},
        activeFilters: hasFilters ? { 'Rarity': new Set(['Epic']) } : {},
        availableFilters: {},
        setFilter: jest.fn(),
        removeFilter: jest.fn(),
        clearAllFilters: () => {
          currentUrl = '/collection/0x123'; // Remove filters from URL
        },
        isLoading: false,
        isEmpty: false,
        precomputed: { attributes: [], properties: {}, allMetadata: [] },
        statusFilter: 'all',
        setStatusFilter: jest.fn()
      };
    });

    const { rerender } = render(
      <MemoryRouter initialEntries={[currentUrl]}>
        <Routes>
          <Route
            path="/collection/:address"
            element={<Items edition={mockEdition} collectionAddress="0x123" />}
          />
        </Routes>
      </MemoryRouter>
    );

    // Initial render with filters
    await waitFor(() => {
      const cards = screen.getAllByTestId('collectible-card');
      expect(cards).toHaveLength(2);
    });

    // Clear filters
    const clearButton = screen.getByText(/Clear Filters/i);
    fireEvent.click(clearButton);

    currentUrl = '/collection/0x123';
    rerender(
      <MemoryRouter initialEntries={[currentUrl]}>
        <Routes>
          <Route
            path="/collection/:address"
            element={<Items edition={mockEdition} collectionAddress="0x123" />}
          />
        </Routes>
      </MemoryRouter>
    );

    // All tokens should be visible
    await waitFor(() => {
      const cards = screen.getAllByTestId('collectible-card');
      expect(cards).toHaveLength(6);
    });

    expect(currentUrl).toBe('/collection/0x123');
  });

  it('should encode special characters in URL properly', async () => {
    const mockUseMetadataFilters = require('@/hooks/use-metadata-filters').useMetadataFilters;
    let currentUrl = '/collection/0x123';

    mockUseMetadataFilters.mockImplementation(() => ({
      filteredTokens: createMockTokenCollection(),
      metadataIndex: {},
      activeFilters: {},
      availableFilters: {},
      setFilter: (trait: string, value: string) => {
        const encoded = encodeURIComponent(value.toLowerCase());
        currentUrl = `/collection/0x123?filters=${trait.toLowerCase()}:${encoded}`;
      },
      removeFilter: jest.fn(),
      clearAllFilters: jest.fn(),
      isLoading: false,
      isEmpty: false
    }));

    render(
      <MemoryRouter initialEntries={[currentUrl]}>
        <Routes>
          <Route
            path="/collection/:address"
            element={<Items edition={mockEdition} collectionAddress="0x123" />}
          />
        </Routes>
      </MemoryRouter>
    );

    // Apply filter with special characters
    const specialFilter = screen.getByLabelText('Filter by Ultra Rare & Special');
    fireEvent.click(specialFilter);

    // URL should properly encode special characters
    expect(currentUrl).toContain('ultra%20rare%20%26%20special');
  });
});
