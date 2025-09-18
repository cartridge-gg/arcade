# Quickstart: NFT Metadata Filtering

## Overview
This guide demonstrates the NFT metadata filtering feature, allowing users to filter tokens by their traits (rarity, background, etc.) in the marketplace.

## Prerequisites
- Node.js 18+
- pnpm installed
- Development environment set up

## Setup

1. **Install dependencies**
```bash
pnpm install
```

2. **Start development server**
```bash
pnpm dev
```

3. **Navigate to a collection page**
```
http://localhost:3000/collection/[collection-address]
```

## Feature Validation

### Test Scenario 1: Single Trait Filtering
1. Load a collection page with NFTs
2. Observe the filter sidebar on the left
3. Click on "Rarity" to expand trait options
4. Select "Legendary" checkbox
5. **Expected**: Only NFTs with Legendary rarity are displayed
6. **Expected**: URL updates to include `?filters=rarity:legendary`
7. **Expected**: Count shows "X / Y Selected" where X is filtered count

### Test Scenario 2: Multiple Trait Filtering (AND Logic)
1. With "Legendary" rarity already selected
2. Expand "Background" trait
3. Select "Gold" background
4. **Expected**: Only NFTs with BOTH Legendary rarity AND Gold background
5. **Expected**: URL shows `?filters=rarity:legendary|background:gold`
6. **Expected**: Further reduced token count

### Test Scenario 3: Multiple Values Same Trait (OR Logic)
1. Clear all filters
2. Select "Legendary" rarity
3. Also select "Epic" rarity
4. **Expected**: NFTs with EITHER Legendary OR Epic rarity shown
5. **Expected**: URL shows `?filters=rarity:legendary,epic`

### Test Scenario 4: Clear Filters
1. Apply multiple filters
2. Click "Clear All" button
3. **Expected**: All NFTs in collection displayed
4. **Expected**: URL parameters removed
5. **Expected**: All filter checkboxes unchecked

### Test Scenario 5: Empty State
1. Select a combination with no matches
2. **Expected**: "No results meet this criteria" message
3. **Expected**: Filter options still visible
4. **Expected**: Clear filters button remains active

### Test Scenario 6: URL Persistence
1. Apply filters
2. Copy URL
3. Open new browser tab
4. Paste URL
5. **Expected**: Same filters applied
6. **Expected**: Same NFTs displayed

### Test Scenario 7: Performance with Large Collection
1. Load collection with 1000+ NFTs
2. Apply multiple filters
3. **Expected**: Filtering happens within 200ms
4. **Expected**: No UI lag or freezing
5. **Expected**: Virtual scrolling maintains performance

### Test Scenario 8: Metadata Edge Cases
1. Find NFTs without metadata
2. **Expected**: Grouped under "No Traits" category
3. Apply other filters
4. **Expected**: "No Traits" NFTs excluded when traits selected

## API Testing

### Hook Usage
```typescript
import { useMetadataFilters } from '@/hooks/use-metadata-filters';

function MyComponent() {
  const {
    filteredTokens,
    activeFilters,
    setFilter,
    clearAllFilters
  } = useMetadataFilters({
    tokens: collectionTokens,
    collectionAddress: '0x123...'
  });

  // Use filtered tokens for display
  return (
    <div>
      {filteredTokens.map(token => (
        <TokenCard key={token.token_id} token={token} />
      ))}
    </div>
  );
}
```

### Store Access
```typescript
import { useMetadataFilterStore } from '@/store/metadata-filters';

function FilterDebug() {
  const store = useMetadataFilterStore();
  const state = store.getCollectionState('0x123...');

  console.log('Active filters:', state?.activeFilters);
  console.log('Metadata index:', state?.metadataIndex);
}
```

## Performance Metrics

Run performance tests:
```bash
pnpm test:performance
```

Expected results:
- Index building: < 100ms for 1000 tokens
- Filter application: < 50ms
- UI render after filter: < 16ms (60fps)
- Memory usage: < 50MB for 10k tokens

## Troubleshooting

### Filters not appearing
- Check console for metadata parsing errors
- Verify tokens have `attributes` field
- Ensure collection is fully loaded

### Slow performance
- Check token count (may need pagination)
- Verify virtual scrolling is active
- Check for console errors

### URL state not working
- Verify router is properly configured
- Check for URL encoding issues
- Ensure no conflicting query parameters

## Success Criteria

✅ All test scenarios pass
✅ Performance metrics met
✅ No console errors
✅ Accessibility standards met (keyboard navigation works)
✅ Mobile responsive (filters in drawer on mobile)

## Next Steps

After validation:
1. Run integration tests: `pnpm test:integration`
2. Check accessibility: `pnpm test:a11y`
3. Performance audit: `pnpm audit:performance`
4. Deploy to staging for UAT