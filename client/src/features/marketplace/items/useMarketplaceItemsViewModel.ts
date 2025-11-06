import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useConnect } from "@starknet-react/core";
import type { Token } from "@dojoengine/torii-wasm";
import type { OrderModel } from "@cartridge/arcade";
import { getChecksumAddress, type RpcProvider } from "starknet";
import type ControllerConnector from "@cartridge/connector/controller";
import { filterTokensByMetadata } from "@cartridge/arcade/marketplace";
import { useArcade } from "@/hooks/arcade";
import { useMarketplace } from "@/hooks/marketplace";
import { useAnalytics } from "@/hooks/useAnalytics";
import { DEFAULT_PRESET, DEFAULT_PROJECT } from "@/constants";
import { useMetadataFilters } from "@/hooks/use-metadata-filters";
import { useMarketTokensFetcher } from "@/hooks/marketplace-tokens-fetcher";
import { useMarketplaceTokensStore } from "@/store";
import { useListedTokensFetcher } from "@/hooks/use-listed-tokens-fetcher";

export const ERC1155_ENTRYPOINT = "balance_of_batch";

export type MarketplaceAsset = Token & { orders: OrderModel[]; owner: string };

interface UseMarketplaceItemsViewModelArgs {
  collectionAddress: string;
}

interface MarketplaceItemsViewModel {
  collectionAddress: string;
  collection: ReturnType<typeof useMarketTokensFetcher>["collection"];
  status: ReturnType<typeof useMarketTokensFetcher>["status"];
  loadingProgress: ReturnType<typeof useMarketTokensFetcher>["loadingProgress"];
  hasMore: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  search: string;
  setSearch: (value: string) => void;
  selection: MarketplaceAsset[];
  clearSelection: () => void;
  toggleSelection: (asset: MarketplaceAsset) => void;
  assets: MarketplaceAsset[];
  searchFilteredAssets: MarketplaceAsset[];
  searchFilteredTokensCount: number;
  totalTokensCount: number;
  collectionSupply: number;
  activeFilters: ReturnType<typeof useMetadataFilters>["activeFilters"];
  clearAllFilters: ReturnType<typeof useMetadataFilters>["clearAllFilters"];
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  handleInspect: (token: MarketplaceAsset) => Promise<void>;
  handlePurchase: (tokens: MarketplaceAsset[]) => Promise<void>;
  sales: ReturnType<typeof useMarketplace>["sales"];
  address?: string;
  rawTokens: Token[] | undefined;
}

export const getEntrypoints = async (
  provider: RpcProvider,
  address: string,
) => {
  try {
    const code = await provider.getClassAt(address);
    if (!code) return [];
    const interfaces = code.abi.filter(
      (element) => element.type === "interface",
    );
    if (interfaces.length > 0) {
      return interfaces.flatMap((element) =>
        element.items.map((item: any) => item.name),
      );
    }
    const functions = code.abi.filter((element) => element.type === "function");
    return functions.map((item) => item.name);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export function useMarketplaceItemsViewModel({
  collectionAddress,
}: UseMarketplaceItemsViewModelArgs): MarketplaceItemsViewModel {
  const { connector, address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { provider } = useArcade();
  const { trackEvent, events } = useAnalytics();
  const { sales, getCollectionOrders } = useMarketplace();
  const [search, setSearch] = useState<string>("");
  const [lastSearch, setLastSearch] = useState<string>("");
  const [selection, setSelection] = useState<MarketplaceAsset[]>([]);

  const rawTokens = useMarketplaceTokensStore(
    (s) => s.tokens[DEFAULT_PROJECT]?.[collectionAddress],
  );
  const rawListedTokens = useMarketplaceTokensStore(
    (s) => s.listedTokens[DEFAULT_PROJECT]?.[collectionAddress],
  );

  const tokens = rawTokens || [];
  const listedTokens = rawListedTokens || [];

  const { activeFilters, clearAllFilters, statusFilter } = useMetadataFilters({
    tokens,
    collectionAddress,
    enabled: !!collectionAddress && tokens.length > 0,
  });

  const collectionOrders = useMemo(() => {
    return getCollectionOrders(collectionAddress);
  }, [getCollectionOrders, collectionAddress]);

  const listedTokenIds = useMemo(() => {
    if (!collectionOrders) return [];
    return Object.values(collectionOrders).flatMap((o) =>
      o.map((i) => i.tokenId.toString(16)),
    );
  }, [collectionOrders]);

  useListedTokensFetcher({
    collectionAddress,
    tokenIds: listedTokenIds,
    enabled: listedTokenIds.length > 0,
  });

  const getOrdersForToken = useCallback(
    (rawTokenId?: string | bigint) => {
      if (!rawTokenId) return [];

      const candidates = new Set<string>();
      const tokenIdString = rawTokenId.toString();
      candidates.add(tokenIdString);

      try {
        if (tokenIdString.startsWith("0x")) {
          const numericId = BigInt(tokenIdString).toString();
          candidates.add(numericId);
        }
      } catch (error) {
        // Ignore parse errors
      }

      for (const candidate of candidates) {
        const orders = collectionOrders?.[candidate];
        if (orders?.length) {
          return orders;
        }
      }

      return [];
    },
    [collectionOrders],
  );

  const defaultProjects = useMemo(() => [DEFAULT_PROJECT], []);

  const {
    collection,
    status,
    loadingProgress,
    hasMore,
    isFetchingNextPage,
    fetchNextPage,
  } = useMarketTokensFetcher({
    project: defaultProjects,
    address: collectionAddress,
    attributeFilters: activeFilters,
  });

  const statusFilteredTokens = useMemo(() => {
    if (statusFilter === "all") {
      return rawTokens;
    }

    if (listedTokens.length > 0) {
      if (Object.keys(activeFilters).length > 0) {
        return filterTokensByMetadata(listedTokens, activeFilters);
      }
      return listedTokens;
    }

    return rawTokens.filter((token) => {
      const tokenOrders = getOrdersForToken(token.token_id?.toString());
      return tokenOrders.length > 0;
    });
  }, [statusFilter, rawTokens, listedTokens, activeFilters, getOrdersForToken]);

  const hasMoreFiltered = useMemo(() => {
    if (statusFilter !== "all" && listedTokens.length > 0) {
      return false;
    }
    return hasMore;
  }, [statusFilter, listedTokens.length, hasMore]);

  const searchFilteredTokens = useMemo(() => {
    if (!search.trim()) return statusFilteredTokens ?? [];

    const searchLower = search.toLowerCase();

    return (
      statusFilteredTokens.filter((token) => {
        const tokenName = (token.metadata as any)?.name || token.name || "";
        return tokenName.toLowerCase().includes(searchLower);
      }) ?? []
    );
  }, [statusFilteredTokens, search]);

  useEffect(() => {
    if (search && search !== lastSearch) {
      const timer = setTimeout(() => {
        trackEvent(events.MARKETPLACE_SEARCH_PERFORMED, {
          search_query: search,
          collection_address: collectionAddress,
          results_count: searchFilteredTokens.length,
        });
        setLastSearch(search);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    search,
    lastSearch,
    searchFilteredTokens.length,
    trackEvent,
    events,
    collectionAddress,
  ]);

  const connectWallet = useCallback(async () => {
    if (!connectors.length) return;
    await connect({ connector: connectors[0] });
  }, [connect, connectors]);

  const clearSelection = useCallback(() => {
    setSelection([]);
  }, []);

  const toggleSelection = useCallback((asset: MarketplaceAsset) => {
    setSelection((prev) => {
      const exists = prev.some((item) => item.token_id === asset.token_id);
      if (exists) {
        return prev.filter((item) => item.token_id !== asset.token_id);
      }
      return [...prev, asset];
    });
  }, []);

  const assets = useMemo(() => {
    const assetsWithOrders = searchFilteredTokens.map((token) => {
      const orders = getOrdersForToken(token.token_id?.toString());
      return {
        ...token,
        orders,
        owner: address || "",
      } as MarketplaceAsset;
    });

    return assetsWithOrders.sort((a, b) => {
      const aHasOrders = a.orders.length > 0;
      const bHasOrders = b.orders.length > 0;

      if (aHasOrders === bHasOrders) return 0;

      return aHasOrders ? -1 : 1;
    });
  }, [searchFilteredTokens, getOrdersForToken, address]);

  const handleInspect = useCallback(
    async (token: MarketplaceAsset) => {
      trackEvent(events.MARKETPLACE_ITEM_INSPECTED, {
        item_token_id: token.token_id,
        item_name: (token.metadata as any)?.name || token.name || "",
        collection_address: token.contract_address,
        seller_address: token.owner,
      });
    },
    [trackEvent, events],
  );

  const handlePurchase = useCallback(
    async (tokensToPurchase: MarketplaceAsset[]) => {
      if (!isConnected || !connector) return;
      if (tokensToPurchase.length === 0) return;

      const orders = tokensToPurchase.flatMap((token) => token.orders);
      const contractAddresses = new Set(
        tokensToPurchase.map((token) => token.contract_address),
      );
      if (contractAddresses.size !== 1) return;

      const eventType =
        tokensToPurchase.length > 1
          ? events.MARKETPLACE_BULK_PURCHASE_INITIATED
          : events.MARKETPLACE_PURCHASE_INITIATED;

      trackEvent(eventType, {
        purchase_type: tokensToPurchase.length > 1 ? "bulk" : "single",
        items_count: tokensToPurchase.length,
        order_ids: orders.map((order) => order.id.toString()),
        collection_address: Array.from(contractAddresses)[0],
        buyer_address: address,
        item_token_ids: tokensToPurchase.map(
          (token) => token.token_id?.toString() || "",
        ),
      });

      const [contractAddress] = Array.from(contractAddresses);
      const controller = (connector as ControllerConnector)?.controller;
      const username = await controller?.username();
      if (!controller || !username) {
        console.error("Connector not initialized");
        trackEvent(events.MARKETPLACE_PURCHASE_FAILED, {
          error_message: "Connector not initialized",
          purchase_type: tokensToPurchase.length > 1 ? "bulk" : "single",
        });
        return;
      }

      const entrypoints = await getEntrypoints(
        provider.provider,
        contractAddress,
      );
      const isERC1155 = entrypoints?.includes(ERC1155_ENTRYPOINT);
      const subpath = isERC1155 ? "collectible" : "collection";

      const project = DEFAULT_PROJECT;
      const preset = DEFAULT_PRESET;
      const options = [`ps=${project}`];
      if (preset) {
        options.push(`preset=${preset}`);
      } else {
        options.push("preset=cartridge");
      }

      let path: string;

      if (orders.length > 1) {
        options.push(`orders=${orders.map((order) => order.id).join(",")}`);
        path = `account/${username}/inventory/${subpath}/${contractAddress}/purchase${options.length > 0 ? `?${options.join("&")}` : ""}`;
      } else {
        const [token] = tokensToPurchase;
        options.push(`address=${getChecksumAddress(token.owner)}`);
        options.push("purchaseView=true");
        options.push(`tokenIds=${[token.token_id].join(",")}`);
        path = `account/${username}/inventory/${subpath}/${contractAddress}/token/${token.token_id}${options.length > 0 ? `?${options.join("&")}` : ""}`;
      }

      controller.openProfileAt(path);
    },
    [connector, isConnected, provider.provider, events, trackEvent, address],
  );

  const searchFilteredAssets = assets;

  const collectionSupply = useMemo(() => {
    if (!collection?.total_supply) return 0;
    try {
      return Number.parseInt(collection.total_supply, 16);
    } catch (error) {
      console.error(error);
      return 0;
    }
  }, [collection?.total_supply]);

  return {
    collectionAddress,
    collection,
    status,
    loadingProgress,
    hasMore: hasMoreFiltered,
    isFetchingNextPage,
    fetchNextPage,
    search,
    setSearch,
    selection,
    clearSelection,
    toggleSelection,
    assets,
    searchFilteredAssets,
    searchFilteredTokensCount: searchFilteredTokens.length,
    totalTokensCount: tokens.length,
    collectionSupply,
    activeFilters,
    clearAllFilters,
    isConnected: Boolean(isConnected),
    connectWallet,
    handleInspect,
    handlePurchase,
    sales,
    address,
    rawTokens,
  };
}
