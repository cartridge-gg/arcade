import { useCallback, useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { getChecksumAddress } from "starknet";
import type { SaleEvent } from "@cartridge/arcade";
import { resizeImage } from "@/lib/helpers";
import placeholderImage from "@/assets/placeholder.svg";
import {
  ItemsEmptyState,
  ItemsLoadingState,
  ItemsView,
  type MarketplaceItemsRow,
  type MarketplaceItemCardProps,
  type MarketplaceItemPriceInfo,
} from "@/components/ui/marketplace/ItemsView";
import {
  type MarketplaceAsset,
  useMarketplaceItemsViewModel,
} from "./useMarketplaceItemsViewModel";
import {
  formatPriceInfo,
  deriveLatestSalePriceForToken,
} from "@/lib/shared/marketplace/utils";
import { NavigationContextManager } from "@/features/navigation/NavigationContextManager";
import { useRouterState } from "@tanstack/react-router";
import { useArcade } from "@/hooks/arcade";

const ROW_HEIGHT = 218;
const ITEMS_PER_ROW = 4;

const derivePrice = (
  asset: MarketplaceAsset,
): MarketplaceItemPriceInfo | null => {
  if (!asset.orders.length || asset.orders.length > 1) return null;
  const order = asset.orders[0];
  return formatPriceInfo(order.currency, order.price);
};

const deriveLastSale = (
  asset: MarketplaceAsset,
  salesByContract: Record<string, Record<string, SaleEvent>> | undefined,
): MarketplaceItemPriceInfo | null => {
  if (!asset.token_id || !salesByContract) return null;

  const numericId = Number.parseInt(asset.token_id.toString(), 10);
  const tokenSales = salesByContract[numericId];
  return deriveLatestSalePriceForToken(tokenSales);
};

interface BaseItemView {
  id: string;
  title: string;
  image?: string | null;
  placeholderImage: string;
  listingCount: number;
  price: MarketplaceItemPriceInfo | null;
  lastSale: MarketplaceItemPriceInfo | null;
  tokenDetailHref: string;
  assetHasOrders: boolean;
  currency?: string;
}

const createBaseItemView = (
  asset: MarketplaceAsset,
  collectionImage: string | undefined,
  salesByContract: Record<string, Record<string, SaleEvent>> | undefined,
  navManager: NavigationContextManager,
): BaseItemView => {
  return {
    id: `${asset.contract_address}-${asset.token_id?.toString() ?? "0"}`,
    title:
      (asset.metadata as unknown as { name?: string })?.name ||
      asset.name ||
      "Untitled",
    image:
      resizeImage((asset as any).image ?? collectionImage, 300, 300) ??
      collectionImage,
    listingCount: asset.orders.length,
    price: derivePrice(asset),
    lastSale: deriveLastSale(asset, salesByContract),
    placeholderImage,
    tokenDetailHref: navManager.generateTokenDetailHref(
      asset.contract_address,
      asset.token_id ?? "0x0",
    ),
    assetHasOrders: asset.orders.length > 0,
    currency: asset.orders.length > 0 ? asset.orders[0].currency : undefined,
  };
};

export const MarketplaceItemsContainer = ({
  collectionAddress,
}: {
  collectionAddress: string;
}) => {
  const {
    collection,
    status,
    loadingProgress,
    hasMore,
    isFetchingNextPage,
    fetchNextPage,
    search,
    setSearch,
    selection,
    clearSelection,
    toggleSelection,
    searchFilteredTokensCount,
    totalTokensCount,
    collectionSupply,
    activeFilters,
    clearAllFilters,
    isConnected,
    connectWallet,
    handleInspect,
    handlePurchase,
    sales,
    assets,
  } = useMarketplaceItemsViewModel({ collectionAddress });

  const parentRef = useRef<HTMLDivElement>(null);

  const { location } = useRouterState();
  const { games, editions } = useArcade();

  const rowCount = Math.ceil(assets.length / ITEMS_PER_ROW);

  const virtualizer = useVirtualizer({
    count: rowCount + 1,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT + 16,
    overscan: 2,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastVisibleIndex =
    virtualItems.length > 0 ? virtualItems[virtualItems.length - 1]?.index : -1;

  useEffect(() => {
    if (lastVisibleIndex < 0) return;
    if (!hasMore || isFetchingNextPage) return;
    if (rowCount === 0) return;
    if (lastVisibleIndex < rowCount - 1) return;

    fetchNextPage();
  }, [lastVisibleIndex, rowCount, hasMore, isFetchingNextPage, fetchNextPage]);

  const salesByContract = useMemo(() => {
    return sales[getChecksumAddress(collectionAddress)] as
      | Record<string, Record<string, SaleEvent>>
      | undefined;
  }, [sales, collectionAddress]);

  const navManager = useMemo(
    () =>
      new NavigationContextManager({
        pathname: location.pathname,
        games,
        editions,
        isLoggedIn: Boolean(isConnected),
      }),
    [location.pathname, games, editions, isConnected],
  );

  const assetsRef = useRef(assets);
  assetsRef.current = assets;

  const baseItems = useMemo(() => {
    return assets.map((asset) =>
      createBaseItemView(asset, collection?.image, salesByContract, navManager),
    );
  }, [assets, collection?.image, salesByContract, navManager]);

  const selectionIds = useMemo(() => {
    return new Set(selection.map((item) => item.token_id?.toString()));
  }, [selection]);

  const selectionCurrency = useMemo(() => {
    if (selection.length === 0) return undefined;
    return selection[0].orders.length > 0
      ? selection[0].orders[0].currency
      : undefined;
  }, [selection]);

  const handleToggleSelectById = useCallback(
    (index: number) => {
      const asset = assetsRef.current[index];
      if (asset) toggleSelection(asset);
    },
    [toggleSelection],
  );

  const handleBuyById = useCallback(
    (index: number) => {
      const asset = assetsRef.current[index];
      if (asset) handlePurchase([asset]);
    },
    [handlePurchase],
  );

  const handleInspectById = useCallback(
    (index: number) => {
      const asset = assetsRef.current[index];
      if (asset) handleInspect(asset);
    },
    [handleInspect],
  );

  const handleBuySelection = useCallback(() => {
    handlePurchase(selection);
  }, [handlePurchase, selection]);

  const items = useMemo(() => {
    const selectionActive = selection.length > 0;
    const selectionHasCurrency = selectionCurrency !== undefined;

    return baseItems.map((base, index) => {
      const tokenId = assets[index]?.token_id?.toString();
      const selected = isConnected && selectionIds.has(tokenId);

      const selectable =
        selection.length === 0
          ? base.assetHasOrders
          : selectionHasCurrency && base.assetHasOrders
            ? base.currency === selectionCurrency
            : false;

      return {
        ...base,
        index,
        selectable: isConnected && selectable,
        selected,
        canOpen: !selectionActive,
        isConnected,
        selectionActive,
        onToggleSelectByIndex: handleToggleSelectById,
        onBuyByIndex: handleBuyById,
        onInspectByIndex: handleInspectById,
        onConnect: connectWallet,
      } as MarketplaceItemCardProps;
    });
  }, [
    baseItems,
    assets,
    selection.length,
    selectionIds,
    selectionCurrency,
    isConnected,
    connectWallet,
    handleToggleSelectById,
    handleBuyById,
    handleInspectById,
  ]);

  const rows: MarketplaceItemsRow[] = useMemo(() => {
    return virtualItems.map((virtualRow) => {
      const isLoaderRow = virtualRow.index >= rowCount;
      const style = {
        position: "absolute" as const,
        top: 0,
        left: 0,
        width: "100%",
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`,
      };

      const startIndex = virtualRow.index * ITEMS_PER_ROW;
      const endIndex = Math.min(startIndex + ITEMS_PER_ROW, items.length);
      const rowItems = items.slice(startIndex, endIndex);

      return {
        key: virtualRow.key,
        isLoaderRow,
        style,
        items: rowItems,
      };
    });
  }, [virtualItems, rowCount, items]);

  const totalHeight = virtualizer.getTotalSize();

  const shouldShowLoading =
    (collection !== null || collection === undefined) &&
    (assets === undefined || assets.length === 0) &&
    ["idle", "loading"].includes(status);

  const shouldShowEmpty =
    null === collection &&
    assets !== undefined &&
    assets.length === 0 &&
    ["idle", "error", "success"].includes(status);

  if (shouldShowLoading) {
    return <ItemsLoadingState />;
  }

  if (shouldShowEmpty) {
    return <ItemsEmptyState />;
  }

  return (
    <ItemsView
      parentRef={parentRef}
      totalHeight={totalHeight}
      rows={rows}
      hasMore={hasMore}
      isFetchingNextPage={isFetchingNextPage}
      searchValue={search}
      onSearchChange={setSearch}
      selectionCount={selection.length}
      filteredCount={searchFilteredTokensCount}
      totalTokensCount={totalTokensCount}
      collectionSupply={collectionSupply}
      hasActiveFilters={Object.keys(activeFilters).length > 0}
      onClearFilters={clearAllFilters}
      onResetSelection={clearSelection}
      isConnected={isConnected}
      onBuySelection={handleBuySelection}
      loadingOverlay={{
        isLoading: status === "loading",
        progress: loadingProgress,
      }}
    />
  );
};
