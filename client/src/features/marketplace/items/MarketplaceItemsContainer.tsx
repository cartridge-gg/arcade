import { useEffect, useMemo, useRef } from "react";
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

const createItemView = (params: {
  asset: MarketplaceAsset;
  collectionImage?: string;
  selection: MarketplaceAsset[];
  selectionActive: boolean;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  onToggleSelection: (asset: MarketplaceAsset) => void;
  onInspect: (asset: MarketplaceAsset) => Promise<void>;
  onPurchase: (assets: MarketplaceAsset[]) => Promise<void>;
  salesByContract: Record<string, Record<string, SaleEvent>> | undefined;
}): MarketplaceItemCardProps => {
  const {
    asset,
    collectionImage,
    selection,
    selectionActive,
    isConnected,
    connectWallet,
    onToggleSelection,
    onInspect,
    onPurchase,
    salesByContract,
  } = params;

  const selected = selection.some((item) => item.token_id === asset.token_id);

  const selectionHasCurrency =
    selection.length > 0 && selection[0].orders.length > 0;

  const assetHasOrders = asset.orders.length > 0;

  const selectable =
    selection.length === 0
      ? assetHasOrders
      : selectionHasCurrency && assetHasOrders
        ? asset.orders[0].currency === selection[0].orders[0].currency
        : false;

  const openable = selection.length === 0;

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
    selectable: isConnected && selectable,
    selected: isConnected && selected,
    canOpen: openable,
    isConnected,
    selectionActive,
    onToggleSelect: () => onToggleSelection(asset),
    onBuy: () => onPurchase([asset]),
    onInspect: () => onInspect(asset),
    onConnect: connectWallet,
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

  const items = useMemo(() => {
    return assets.map((asset) =>
      createItemView({
        asset,
        collectionImage: collection?.image,
        selection,
        selectionActive: selection.length > 0,
        isConnected,
        connectWallet,
        onToggleSelection: toggleSelection,
        onInspect: handleInspect,
        onPurchase: handlePurchase,
        salesByContract,
      }),
    );
  }, [
    assets,
    collection?.image,
    selection,
    isConnected,
    connectWallet,
    toggleSelection,
    handleInspect,
    handlePurchase,
    salesByContract,
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
      onBuySelection={() => handlePurchase(selection)}
      loadingOverlay={{
        isLoading: status === "loading",
        progress: loadingProgress,
      }}
    />
  );
};
