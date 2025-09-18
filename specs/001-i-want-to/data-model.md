# Data Model: NFT Metadata Filtering

## Core Entities

### 1. MetadataIndex
**Purpose**: Maps traits and values to token IDs for efficient filtering

```typescript
interface MetadataIndex {
  [trait: string]: {
    [value: string]: string[]; // Array of token_ids
  };
}
```

**Example**:
```json
{
  "Rarity": {
    "Legendary": ["1", "42", "99"],
    "Epic": ["2", "3", "15", "28"],
    "Common": ["4", "5", "6"]
  },
  "Background": {
    "Blue": ["1", "2", "4"],
    "Gold": ["3", "5", "42"],
    "Green": ["6", "15", "28", "99"]
  }
}
```

### 2. FilterState
**Purpose**: Tracks active filters and their selected values

```typescript
interface FilterState {
  activeFilters: {
    [trait: string]: Set<string>; // Selected values for each trait
  };
  availableFilters: {
    [trait: string]: {
      [value: string]: number; // Count of tokens with this trait-value
    };
  };
}
```

**Example**:
```json
{
  "activeFilters": {
    "Rarity": ["Legendary", "Epic"],
    "Background": ["Blue"]
  },
  "availableFilters": {
    "Rarity": {
      "Legendary": 3,
      "Epic": 4,
      "Common": 3
    },
    "Background": {
      "Blue": 3,
      "Gold": 4,
      "Green": 4
    }
  }
}
```

### 3. TokenMetadata
**Purpose**: Standardized structure for NFT metadata

```typescript
interface TokenMetadata {
  name: string;
  image: string;
  attributes: TokenAttribute[];
}

interface TokenAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string; // Optional: for special formatting
}
```

**Example**:
```json
{
  "name": "Warrior #42",
  "image": "ipfs://...",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    },
    {
      "trait_type": "Background",
      "value": "Gold"
    },
    {
      "trait_type": "Power",
      "value": 9500,
      "display_type": "number"
    }
  ]
}
```

### 4. FilteredTokenResult
**Purpose**: Result of applying filters to token collection

```typescript
interface FilteredTokenResult {
  tokenIds: string[];         // Filtered token IDs
  totalCount: number;          // Total matching tokens
  appliedFilters: FilterState; // Current filter state
}
```

## State Transitions

### Filter Application Flow
```
1. Initial State
   └─> All tokens visible, no filters active

2. User Selects Filter
   └─> Update activeFilters
   └─> Compute intersection of token sets
   └─> Update displayed tokens

3. User Adds Another Filter (Same Trait)
   └─> OR operation within trait
   └─> Union of token sets for that trait
   └─> AND with other traits

4. User Adds Filter (Different Trait)
   └─> AND operation between traits
   └─> Intersection of token sets
   └─> Update counts

5. User Clears Filter
   └─> Remove from activeFilters
   └─> Recompute displayed tokens
   └─> Update available counts

6. User Clears All
   └─> Reset activeFilters
   └─> Show all tokens
   └─> Reset counts
```

## Validation Rules

### MetadataIndex Validation
- Trait names must be non-empty strings
- Values must be strings (numbers converted to strings)
- Token IDs must be unique within each trait-value pair
- Empty value arrays should be removed

### FilterState Validation
- Active filters must reference existing traits
- Selected values must exist in available filters
- Counts must be >= 0
- Empty filter sets should be removed

### TokenMetadata Validation
- Name and image fields required
- Attributes array can be empty
- trait_type must be non-empty string
- Numeric values preserved but indexed as strings

## Relationships

### Entity Relationships
```
Token (1) --- has ---> (0..n) TokenAttribute
TokenAttribute --- indexed in ---> MetadataIndex
MetadataIndex --- filtered by ---> FilterState
FilterState --- produces ---> FilteredTokenResult
FilteredTokenResult --- displays ---> Token[]
```

### Data Flow
```
1. Tokens fetched from API
2. Metadata extracted from each token
3. MetadataIndex built/updated incrementally
4. FilterState initialized from URL or defaults
5. Filters applied to produce FilteredTokenResult
6. UI renders filtered tokens
7. Filter changes update URL and FilterState
8. Loop back to step 5
```

## Performance Considerations

### Index Building
- Incremental updates as tokens load
- Use Map/Set for O(1) operations
- Batch updates to reduce re-renders

### Filter Application
- Pre-compute token sets for active filters
- Cache filter results with memoization
- Use Set operations for efficient intersections/unions

### Memory Management
- Limit stored metadata to required fields
- Use WeakMap for temporary computations
- Clear unused filter combinations

## Edge Cases

### Missing/Malformed Metadata
- Tokens without attributes: Indexed under "No Traits"
- Missing trait_type: Skip attribute
- Invalid value types: Convert to string

### Large Collections
- > 10k tokens: Use virtual scrolling for UI
- > 100 unique values per trait: Implement search within filter
- > 1M tokens: Consider server-side filtering

### Empty States
- No tokens match filters: Show "No results" message
- No metadata available: Show tokens without filter option
- Loading state: Show skeleton while indexing