# Research: NFT Metadata Filtering

## Overview
Research findings for implementing metadata filtering for NFT tokens in the marketplace application.

## Key Decisions

### 1. State Management Approach
**Decision**: Zustand store for metadata index and filter state
**Rationale**:
- Already used in the codebase (useMarketplaceTokensStore)
- Provides efficient updates and subscriptions
- Supports persistence and hydration
**Alternatives considered**:
- React Context: Less performant for frequent updates
- Local component state: Not shareable across components
- Redux: Overkill for this feature's scope

### 2. Metadata Indexing Strategy
**Decision**: Build index during token fetch with schema `{ [trait]: { [value]: [token_ids[]] } }`
**Rationale**:
- O(1) lookup for filtering operations
- Memory efficient for large collections
- Easy to update incrementally
**Alternatives considered**:
- Filter on demand: Too slow for large collections
- Database indexing: Not needed for client-side filtering
- Full denormalization: Excessive memory usage

### 3. Filter Logic Implementation
**Decision**: AND logic between different traits, OR within same trait
**Rationale**:
- Most intuitive for users (matches marketplace standards)
- Specified in requirements (FR-009)
- Allows precise filtering
**Alternatives considered**:
- Pure OR logic: Too broad, returns too many results
- Pure AND logic: Too restrictive for multi-value traits

### 4. URL State Persistence
**Decision**: Use URLSearchParams with encoded filter state
**Rationale**:
- Shareable filter configurations
- Browser back/forward navigation works
- SEO friendly URLs
**Alternatives considered**:
- localStorage: Not shareable
- sessionStorage: Lost on new tabs
- Hash fragments: Limited browser support

## Technical Analysis

### Existing Code Patterns

#### marketplace-tokens-fetcher.ts
- Uses `fetchToriisStream` for async token loading
- Processes tokens in batches with `batchProcessTokens`
- Stores tokens in Zustand store via `addTokens`
- Supports incremental fetching with cursor pagination

#### market-filters.ts
- Uses `MarketFiltersContext` for filter state
- Implements `isSelected` and `addSelected` for filter management
- Integrates with `useSearchParams` for URL persistence
- Filters tokens based on orders and metadata

#### items/index.tsx
- Uses `useVirtualizer` for performance with large lists
- Renders `CollectibleCard` components
- Handles selection state for bulk operations
- Integrates with marketplace hooks

### Integration Points

1. **Token Fetching Enhancement**:
   - Hook into `batchProcessTokens` in marketplace-tokens-fetcher.ts
   - Extract metadata.attributes during processing
   - Build metadata index incrementally

2. **Filter State Management**:
   - Create new store slice for metadata filters
   - Mirror patterns from existing filter stores
   - Support batch updates for performance

3. **Component Integration**:
   - Pass metadata index to filter component
   - Apply filters before virtualization
   - Update counts in real-time

### Performance Considerations

1. **Large Collections (100k+ NFTs)**:
   - Index building must be incremental
   - Use WeakMap for memory efficiency
   - Virtualize filter options if > 100 items

2. **Filter Application**:
   - Pre-compute filtered token IDs
   - Use Set operations for AND/OR logic
   - Memoize filter results

3. **UI Responsiveness**:
   - Debounce filter changes
   - Use React.memo for filter components
   - Lazy load trait values

## Dependencies Review

### Existing Dependencies
- **@tanstack/react-virtual**: Already used for virtualization
- **zustand**: State management library in use
- **react-router-dom**: For useSearchParams hook
- **@cartridge/ui**: UI component library

### No New Dependencies Required
All functionality can be implemented with existing packages.

## Risk Assessment

### Low Risk
- Integration with existing components
- Following established patterns
- No external API changes

### Medium Risk
- Performance with very large collections (>50k)
- Mitigation: Implement progressive loading

### Mitigated Risks
- Filter component modification: Requirement explicitly states DO NOT MODIFY
- Fetching logic changes: Must enhance, not replace
- Breaking changes: Following existing interfaces

## Implementation Notes

### Token Metadata Structure
Based on analysis, NFT metadata follows this structure:
```typescript
{
  name: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}
```

### Filter State Structure
Recommended structure for filter state:
```typescript
{
  activeFilters: {
    [trait: string]: Set<string>; // Selected values
  };
  availableFilters: {
    [trait: string]: {
      [value: string]: number; // Count of tokens
    };
  };
}
```

### URL Parameter Format
Proposed URL format for filters:
```
?filters=trait1:value1,value2|trait2:value3
```
Example: `?filters=rarity:legendary,epic|background:blue`

## Conclusion

All technical unknowns have been resolved through codebase analysis. The implementation can proceed with:
1. No new dependencies
2. Clear integration points identified
3. Performance strategy defined
4. Existing patterns to follow

Ready to proceed to Phase 1: Design & Contracts.