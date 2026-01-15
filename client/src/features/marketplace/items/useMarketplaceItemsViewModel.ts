import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useConnect } from "@starknet-react/core";
import type { Token } from "@dojoengine/torii-wasm";
import type { ListingWithUsd } from "@/effect/atoms/marketplace";
import {
  addAddressPadding,
  getChecksumAddress,
  type RpcProvider,
} from "starknet";
import type ControllerConnector from "@cartridge/connector/controller";
import { useArcade } from "@/hooks/arcade";
import { useMarketplace } from "@/hooks/marketplace";
import { useAnalytics } from "@/hooks/useAnalytics";
import { DEFAULT_PRESET, DEFAULT_PROJECT } from "@/constants";
import { useMetadataFilters } from "@/hooks/use-metadata-filters";
import {
  useMarketplaceTokens,
  useListedTokens,
  type EnrichedListedToken,
  ownerTokenIdsAtom,
} from "@/effect";
import {
  useHandleListCallback,
  useHandleSendCallback,
  useHandleUnlistCallback,
} from "@/hooks/marketplace-actions-handlers";
import { useCollectionOrders, useCombinedTokenFilter } from "./hooks";
import { useProject } from "@/hooks/project";
import { useAtomValue } from "@effect-atom/atom-react";
import { CollectionType } from "@/effect/atoms/tokens";

export const ERC1155_ENTRYPOINT = "balance_of_batch";

export type MarketplaceAsset = Token & {
  orders: ListingWithUsd[];
  owner: string;
  minUsdPrice: number | null;
};

interface UseMarketplaceItemsViewModelArgs {
  collectionAddress: string;
}

interface MarketplaceItemsViewModel {
  collection: ReturnType<typeof useMarketplaceTokens>["collection"];
  status: ReturnType<typeof useMarketplaceTokens>["status"];
  hasMore: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  fetchNextPage: () => void;
  search: string;
  setSearch: (value: string) => void;
  selection: MarketplaceAsset[];
  clearSelection: () => void;
  toggleSelection: (asset: MarketplaceAsset) => void;
  assets: MarketplaceAsset[];
  searchFilteredTokensCount: number;
  totalTokensCount: number;
  collectionSupply: number;
  activeFilters: ReturnType<typeof useMetadataFilters>["activeFilters"];
  clearAllFilters: ReturnType<typeof useMetadataFilters>["clearAllFilters"];
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  handleInspect: (token: MarketplaceAsset) => Promise<void>;
  handlePurchase: (tokens: MarketplaceAsset[]) => Promise<void>;
  handleList: (tokens: MarketplaceAsset[]) => Promise<void>;
  handleUnlist: (tokens: MarketplaceAsset[]) => Promise<void>;
  handleSend: (tokens: MarketplaceAsset[]) => Promise<void>;
  sales: ReturnType<typeof useMarketplace>["sales"];
  statusFilter: string;
  listedTokens: EnrichedListedToken[];
  isERC1155: boolean;
  isInventory: boolean;
  ownedTokenIds: string[];
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
  const { sales } = useMarketplace();
  const [search, setSearch] = useState<string>("");
  const [lastSearch, setLastSearch] = useState<string>("");
  const [selection, setSelection] = useState<MarketplaceAsset[]>([]);
  const { tab } = useProject();

  const ownedTokenIdsResult = useAtomValue(
    ownerTokenIdsAtom(collectionAddress, address) as any,
  ) as { _tag: string; value?: Set<string> };

  const ownedTokenIds = useMemo(
    () =>
      ownedTokenIdsResult?.value
        ? Array.from(ownedTokenIdsResult.value).map(addAddressPadding)
        : [],
    [ownedTokenIdsResult],
  );

  const { listedTokenIds, getOrdersForToken } =
    useCollectionOrders(collectionAddress);

  const { tokens: listedTokens } = useListedTokens(
    DEFAULT_PROJECT,
    collectionAddress,
    listedTokenIds,
    listedTokenIds.length > 0,
  );

  const {
    combinedTokenIds,
    shouldShowEmpty,
    isOwnerFilterLoading,
    statusFilter,
    activeFilters,
    hasActiveFilters,
  } = useCombinedTokenFilter(collectionAddress, listedTokenIds);

  const {
    collection,
    tokens: rawTokens,
    status,
    hasMore,
    isFetchingNextPage,
    fetchNextPage,
    isLoading: isLoadingTokens,
  } = useMarketplaceTokens(DEFAULT_PROJECT, collectionAddress, {
    enabled: !!collectionAddress && !shouldShowEmpty,
    attributeFilters: hasActiveFilters ? activeFilters : undefined,
    tokenIds: combinedTokenIds,
  });

  const { clearAllFilters } = useMetadataFilters({
    tokens: rawTokens,
    collectionAddress,
    enabled: !!collectionAddress && rawTokens.length > 0,
  });

  const isERC1155 = useMemo(
    () => collection?.contract_type === CollectionType.ERC1155,
    [collection],
  );

  const searchFilteredTokens = useMemo(() => {
    const effectiveTokens = shouldShowEmpty ? [] : rawTokens;
    if (!search.trim()) return effectiveTokens;
    const searchLower = search.toLowerCase();
    return effectiveTokens.filter((token) => {
      const tokenName = (token.metadata as any)?.name || token.name || "";
      return tokenName.toLowerCase().includes(searchLower);
    });
  }, [rawTokens, search, shouldShowEmpty]);

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
    const listedTokenIdSet = new Set(listedTokenIds);

    const assetsWithOrders = searchFilteredTokens.map((token) => {
      const isEnrichedToken = "orders" in token;
      const orders = isEnrichedToken
        ? (token as EnrichedListedToken).orders
        : getOrdersForToken(token.token_id?.toString());

      let minUsdPrice: number | null = null;
      if (isEnrichedToken && "minUsdPrice" in token) {
        minUsdPrice = (token as EnrichedListedToken).minUsdPrice;
      } else if (orders.length > 0) {
        const prices = orders
          .map((o) => o.usdPrice)
          .filter((p): p is number => p !== null);
        minUsdPrice = prices.length > 0 ? Math.min(...prices) : null;
      }

      return {
        ...token,
        orders,
        owner: address || "",
        minUsdPrice,
      } as MarketplaceAsset;
    });

    if (statusFilter === "all") {
      const listed: MarketplaceAsset[] = [];
      const nonListed: MarketplaceAsset[] = [];

      for (const asset of assetsWithOrders) {
        const tokenIdHex = asset.token_id
          ? BigInt(asset.token_id.toString()).toString(16)
          : undefined;
        if (tokenIdHex && listedTokenIdSet.has(tokenIdHex)) {
          listed.push(asset);
        } else {
          nonListed.push(asset);
        }
      }

      return [...listed, ...nonListed];
    }

    return assetsWithOrders.sort((a, b) => {
      const aHasOrders = a.orders.length > 0;
      const bHasOrders = b.orders.length > 0;
      if (aHasOrders !== bHasOrders) return aHasOrders ? -1 : 1;
      if (aHasOrders && bHasOrders) {
        const aUsdPrice = a.minUsdPrice ?? Number.POSITIVE_INFINITY;
        const bUsdPrice = b.minUsdPrice ?? Number.POSITIVE_INFINITY;
        return aUsdPrice - bUsdPrice;
      }
      return 0;
    });
  }, [
    searchFilteredTokens,
    getOrdersForToken,
    address,
    statusFilter,
    listedTokenIds,
  ]);

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

      const orderIds = orders.map((listing) => listing.order.id).join(",");
      trackEvent(eventType, {
        purchase_type: tokensToPurchase.length > 1 ? "bulk" : "single",
        items_count: tokensToPurchase.length,
        order_ids: orderIds.split(","),
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
        options.push(`orders=${orderIds}`);
        path = `account/${username}/inventory/${subpath}/${contractAddress}/purchase${options.length > 0 ? `?${options.join("&")}` : ""}`;
      } else {
        const [token] = tokensToPurchase;
        options.push(`address=${getChecksumAddress(token.owner)}`);
        options.push(`tokenIds=${[token.token_id].join(",")}`);
        options.push(`orders=${orderIds}`);
        path = `account/${username}/inventory/${subpath}/${contractAddress}/token/${token.token_id}/purchase${options.length > 0 ? `?${options.join("&")}` : ""}`;
      }

      controller.openProfileAt(path);
    },
    [
      connector,
      isConnected,
      provider.provider,
      events,
      trackEvent,
      address,
      isERC1155,
    ],
  );

  const handleListCallback = useHandleListCallback();
  const handleUnlistCallback = useHandleUnlistCallback();
  const handleSendCallback = useHandleSendCallback();

  const handleList = useCallback(
    async (tokens: MarketplaceAsset[]) =>
      handleListCallback(
        collectionAddress,
        tokens.map((token) => token.token_id ?? "").filter(Boolean),
      ),
    [collectionAddress, handleListCallback],
  );

  const handleUnlist = useCallback(
    async (tokens: MarketplaceAsset[]) =>
      handleUnlistCallback(
        collectionAddress,
        tokens.map((token) => token.token_id ?? "").filter(Boolean),
      ),
    [collectionAddress, handleUnlistCallback],
  );

  const handleSend = useCallback(
    async (tokens: MarketplaceAsset[]) =>
      handleSendCallback(
        collectionAddress,
        tokens.map((token) => token.token_id ?? "").filter(Boolean),
      ),
    [collectionAddress, handleSendCallback],
  );

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
    collection,
    status,
    hasMore,
    isFetchingNextPage,
    fetchNextPage,
    search,
    setSearch,
    selection,
    clearSelection,
    toggleSelection,
    assets,
    searchFilteredTokensCount: searchFilteredTokens.length,
    totalTokensCount: rawTokens.length,
    collectionSupply,
    activeFilters,
    clearAllFilters,
    isConnected: Boolean(isConnected),
    connectWallet,
    handleInspect,
    handlePurchase,
    handleList,
    handleUnlist,
    handleSend,
    sales,
    isLoading: isLoadingTokens || Boolean(isOwnerFilterLoading),
    statusFilter,
    listedTokens,
    isERC1155,
    isInventory: tab === "inventoryitems",
    ownedTokenIds,
  };
}
