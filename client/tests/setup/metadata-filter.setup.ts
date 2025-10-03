import type { Token } from "@dojoengine/torii-wasm";
import type { MetadataIndex, ActiveFilters, TokenAttribute } from "@/types/metadata-filter.types";

// Mock token factory
export function createMockToken(
  tokenId: string,
  attributes: TokenAttribute[],
  contractAddress = "0x123"
): Token {
  return {
    token_id: tokenId,
    contract_address: contractAddress,
    name: `Token #${tokenId}`,
    metadata: {
      name: `Token #${tokenId}`,
      image: `https://example.com/token/${tokenId}`,
      attributes
    }
  } as unknown as Token;
}

// Create a collection of mock tokens with various traits
export function createMockTokenCollection(): Token[] {
  return [
    createMockToken("1", [
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Background", value: "Gold" },
      { trait_type: "Power", value: 9500 }
    ]),
    createMockToken("2", [
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Background", value: "Blue" },
      { trait_type: "Power", value: 7500 }
    ]),
    createMockToken("3", [
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Background", value: "Gold" },
      { trait_type: "Power", value: 7200 }
    ]),
    createMockToken("4", [
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Background", value: "Green" },
      { trait_type: "Power", value: 3000 }
    ]),
    createMockToken("5", [
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Background", value: "Blue" },
      { trait_type: "Power", value: 2800 }
    ]),
    createMockToken("6", [
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Background", value: "Green" },
      { trait_type: "Power", value: 9800 }
    ])
  ];
}

// Create expected metadata index from mock collection
export function createExpectedMetadataIndex(): MetadataIndex {
  return {
    "Rarity": {
      "Legendary": ["1", "6"],
      "Epic": ["2", "3"],
      "Common": ["4", "5"]
    },
    "Background": {
      "Gold": ["1", "3"],
      "Blue": ["2", "5"],
      "Green": ["4", "6"]
    },
    "Power": {
      "9500": ["1"],
      "7500": ["2"],
      "7200": ["3"],
      "3000": ["4"],
      "2800": ["5"],
      "9800": ["6"]
    }
  };
}

// Create mock active filters
export function createMockActiveFilters(): ActiveFilters {
  return {
    "Rarity": new Set(["Legendary", "Epic"]),
    "Background": new Set(["Gold"])
  };
}

// Edge case: tokens with missing or malformed metadata
export function createEdgeCaseTokens(): Token[] {
  return [
    // Token with no attributes
    {
      token_id: "100",
      contract_address: "0x123",
      metadata: {
        name: "No Traits Token",
        image: "https://example.com/token/100"
      }
    } as unknown as Token,
    // Token with null metadata
    {
      token_id: "101",
      contract_address: "0x123",
      metadata: null
    } as unknown as Token,
    // Token with empty attributes array
    {
      token_id: "102",
      contract_address: "0x123",
      metadata: {
        name: "Empty Traits",
        image: "https://example.com/token/102",
        attributes: []
      }
    } as unknown as Token,
    // Token with invalid attribute structure
    {
      token_id: "103",
      contract_address: "0x123",
      metadata: {
        name: "Invalid Trait",
        image: "https://example.com/token/103",
        attributes: [
          { trait_type: "", value: "Invalid" },
          { trait_type: "Valid", value: "" }
        ]
      }
    } as unknown as Token
  ];
}

// Large collection generator for performance testing
export function createLargeTokenCollection(size: number): Token[] {
  const tokens: Token[] = [];
  const rarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
  const backgrounds = ["Red", "Blue", "Green", "Gold", "Silver", "Purple"];
  const types = ["Warrior", "Mage", "Archer", "Rogue", "Paladin"];

  for (let i = 0; i < size; i++) {
    tokens.push(createMockToken(
      i.toString(),
      [
        { trait_type: "Rarity", value: rarities[i % rarities.length] },
        { trait_type: "Background", value: backgrounds[i % backgrounds.length] },
        { trait_type: "Type", value: types[i % types.length] },
        { trait_type: "Power", value: Math.floor(Math.random() * 10000) }
      ]
    ));
  }

  return tokens;
}

// URL parameter test cases
export const urlTestCases = [
  {
    description: "Single trait single value",
    urlParam: "rarity:legendary",
    expected: { "Rarity": new Set(["legendary"]) }
  },
  {
    description: "Single trait multiple values",
    urlParam: "rarity:legendary,epic",
    expected: { "Rarity": new Set(["legendary", "epic"]) }
  },
  {
    description: "Multiple traits",
    urlParam: "rarity:legendary|background:gold,blue",
    expected: {
      "Rarity": new Set(["legendary"]),
      "Background": new Set(["gold", "blue"])
    }
  },
  {
    description: "Empty filter string",
    urlParam: "",
    expected: {}
  }
];

// Test assertion helpers
export function assertFilteredTokenIds(
  actual: string[],
  expected: string[],
  message?: string
) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);

  if (actualSet.size !== expectedSet.size) {
    throw new Error(
      message || `Expected ${expected.length} tokens, got ${actual.length}`
    );
  }

  for (const id of expected) {
    if (!actualSet.has(id)) {
      throw new Error(
        message || `Expected token ${id} not found in filtered results`
      );
    }
  }
}