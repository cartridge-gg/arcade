import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  StatusType,
  type EditionModel,
  type GameModel,
  type CollectionEditionModel,
} from "@cartridge/arcade";
import { useMarketplaceCollectionsViewModel } from "./useMarketplaceCollectionsViewModel";

const mockUseTokenContracts = vi.fn();
const mockUseMarketplace = vi.fn();

// Mock atom values
let mockCollectionEditionsValue: any[] = [];
let mockEditionsValue: any[] = [];
let mockGamesValue: any[] = [];

vi.mock("@effect-atom/atom-react", () => ({
  useAtomValue: vi.fn((atom: any) => {
    // Check atom type by its __type property that we'll set in the @/effect mock
    if (atom?.__type === "editions") {
      return {
        _tag: "Success",
        value: mockEditionsValue,
      };
    }
    if (atom?.__type === "games") {
      return {
        _tag: "Success",
        value: mockGamesValue,
      };
    }
    // Default to collectionEditions
    return {
      _tag: "Success",
      value: mockCollectionEditionsValue,
    };
  }),
}));

vi.mock("@/effect", async () => {
  return {
    collectionEditionsAtom: { __type: "collectionEditions" },
    editionsAtom: { __type: "editions" },
    gamesAtom: { __type: "games" },
    unwrapOr: (result: any, defaultValue: any) =>
      result._tag === "Success" ? result.value : defaultValue,
    useTokenContracts: () => mockUseTokenContracts(),
  };
});

vi.mock("@/hooks/marketplace", () => ({
  useMarketplace: () => mockUseMarketplace(),
}));

vi.mock("@cartridge/presets", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@cartridge/presets")>();
  return {
    ...actual,
    erc20Metadata: [
      {
        l2_token_address:
          "0x0000000000000000000000000000000000000000000000000000000000000001",
        decimals: 2,
        logo_url: "https://tokens.example/logo.png",
      },
    ],
  };
});

vi.mock("ethereum-blockies-base64", () => ({
  __esModule: true,
  default: vi.fn(() => "data:image/png;base64,blockie"),
}));

const COLLECTION_ADDRESS = "0x1";
const COLLECTION_ADDRESS_CHECKSUM =
  "0x0000000000000000000000000000000000000000000000000000000000000001";
const CURRENCY_ADDRESS =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

const baseEdition = {
  id: 1,
  name: "Season One",
  config: { project: "proj" },
  gameId: 1,
  properties: { icon: "https://game.example/icon.png" },
} as unknown as EditionModel;

const baseGame = {
  id: 1,
  name: "My Game",
  properties: { icon: "https://game.example/icon.png" },
} as unknown as GameModel;

const baseCollectionEdition = [
  {
    collection: COLLECTION_ADDRESS,
    edition: baseEdition.id,
  } as unknown as CollectionEditionModel,
];

describe("useMarketplaceCollectionsViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock atom values
    mockCollectionEditionsValue = baseCollectionEdition;
    mockEditionsValue = [baseEdition];
    mockGamesValue = [baseGame];

    mockUseTokenContracts.mockReturnValue({ data: [], status: "idle" });
    mockUseMarketplace.mockReturnValue({ listings: {}, sales: {} });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns loading state when collections are not yet available", () => {
    mockUseTokenContracts.mockReturnValue({ data: [], status: "loading" });

    const { result } = renderHook(() =>
      useMarketplaceCollectionsViewModel({
        edition: undefined,
        currentPathname: "/marketplace",
      }),
    );

    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isEmpty).toBe(false);
  });

  it("maps marketplace collections to presentational items", () => {
    mockUseTokenContracts.mockReturnValue({
      status: "success",
      data: [
        {
          contract_address: COLLECTION_ADDRESS,
          total_supply: "12",
          image: "https://collections.example/cover.png",
          name: "Genesis",
          project: "proj",
        },
      ],
    });

    mockUseMarketplace.mockReturnValue({
      listings: {
        [COLLECTION_ADDRESS]: {
          "1": {
            orderA: {
              status: { value: StatusType.Placed },
              price: 200,
              currency: CURRENCY_ADDRESS,
            },
          },
          "2": {
            orderB: {
              status: { value: StatusType.Placed },
              price: 300,
              currency: CURRENCY_ADDRESS,
            },
          },
        },
      },
      sales: {
        [COLLECTION_ADDRESS_CHECKSUM]: {
          "2": {
            saleA: {
              id: 100,
              currency: CURRENCY_ADDRESS,
              price: 500,
            },
          },
        },
      },
    });

    const { result } = renderHook(() =>
      useMarketplaceCollectionsViewModel({
        edition: baseEdition,
        game: baseGame,
        currentPathname: "/portal/game/Old Game/edition/Legacy/collection/prev",
      }),
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.items).toHaveLength(1);

    const [item] = result.current.items;
    expect(item.key).toBe(`proj-${COLLECTION_ADDRESS}`);
    expect(item.title).toBe("Genesis");
    expect(item.image).toBe(
      "https://collections.example/cover.png?width=300&height=300",
    );
    expect(item.totalCount).toBe(12);
    expect(item.listingCount).toBe(2);
    expect(item.lastSale).toEqual({
      value: "5.0000",
      image: "https://tokens.example/logo.png",
    });
    expect(item.price).toEqual({
      value: "2.0000",
      image: "https://tokens.example/logo.png",
    });
    expect(item.href).toBe("/game/my-game/edition/season-one/collection/0x1");
    expect(item.gameIcon).toBe("https://game.example/icon.png");
  });

  it("marks collection list as empty when edition filter excludes all collections", () => {
    mockUseTokenContracts.mockReturnValue({
      status: "success",
      data: [
        {
          contract_address: COLLECTION_ADDRESS,
          total_supply: "5",
          image: "https://collections.example/cover.png",
          name: "Genesis",
          project: "proj",
        },
      ],
    });

    const otherEdition = {
      id: 2,
      config: { project: "proj" },
      gameId: 1,
    } as unknown as EditionModel;

    const { result } = renderHook(() =>
      useMarketplaceCollectionsViewModel({
        edition: otherEdition,
        currentPathname: "/marketplace",
      }),
    );

    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isEmpty).toBe(true);
  });
});
