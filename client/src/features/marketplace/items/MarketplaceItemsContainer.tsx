import { useCallback, useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { addAddressPadding, getChecksumAddress } from "starknet";
import type { OrderModel } from "@cartridge/arcade";
import { useMediaQuery } from "@cartridge/ui";
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
import { formatBackgroundColor } from "@/hooks/token-fetcher";

const ROW_HEIGHT = 184;
const ROW_HEIGHT_INVENTORY = 160;

const derivePrice = (
  asset: MarketplaceAsset,
): MarketplaceItemPriceInfo | null => {
  if (!asset.orders.length) return null;
  const listing = asset.orders[0];
  return formatPriceInfo(listing.order.currency, listing.order.price);
};

const deriveLastSale = (
  asset: MarketplaceAsset,
  salesByContract: Record<string, Record<string, OrderModel>> | undefined,
): MarketplaceItemPriceInfo | null => {
  if (!asset.token_id || !salesByContract) return null;

  const numericId = Number.parseInt(asset.token_id.toString(), 10);
  const tokenSales = salesByContract[numericId];
  return deriveLatestSalePriceForToken(tokenSales);
};

interface BaseItemView {
  id: string;
  tokenId: string;
  title: string;
  image?: string | null;
  placeholderImage: string;
  listingCount: number;
  price: MarketplaceItemPriceInfo | null;
  lastSale: MarketplaceItemPriceInfo | null;
  tokenDetailHref: string;
  assetHasOrders: boolean;
  currency?: string;
  owned: boolean;
  backgroundColor: string | null;
}

const createBaseItemView = (
  asset: MarketplaceAsset,
  collectionImage: string | undefined,
  salesByContract: Record<string, Record<string, OrderModel>> | undefined,
  navManager: NavigationContextManager,
  ownedTokenIds: string[],
): BaseItemView => {
  const tokenId = asset.token_id?.toString() ?? "0";
  const metadata = asset.metadata as unknown as {
    name?: string;
    background_color?: string;
  };
  return {
    id: `${asset.contract_address}-${tokenId}`,
    tokenId,
    title: metadata?.name || asset.name || "Untitled",
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
    currency:
      asset.orders.length > 0 ? asset.orders[0].order.currency : undefined,
    owned: ownedTokenIds.includes(addAddressPadding(asset.token_id ?? 0)),
    backgroundColor: formatBackgroundColor(metadata?.background_color),
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
    handleList,
    handleUnlist,
    handleSend,
    handlePurchase,
    sales,
    assets,
    isLoading,
    statusFilter,
    listedTokens,
    isERC1155,
    isInventory,
    ownedTokenIds,
  } = useMarketplaceItemsViewModel({ collectionAddress });

  const parentRef = useRef<HTMLDivElement>(null);

  const { location } = useRouterState();
  const { games, editions } = useArcade();

  const isLargeScreen = useMediaQuery("(min-width: 1200px)");
  const itemsPerRow = isLargeScreen ? 4 : 2;

  const rowCount = Math.ceil(assets.length / itemsPerRow);

  const virtualizer = useVirtualizer({
    count: rowCount + 1,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (isInventory ? ROW_HEIGHT_INVENTORY : ROW_HEIGHT) + 16,
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
      | Record<string, Record<string, OrderModel>>
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
      createBaseItemView(
        asset,
        collection?.image,
        salesByContract,
        navManager,
        ownedTokenIds,
      ),
    );
  }, [assets, collection?.image, salesByContract, navManager, ownedTokenIds]);

  const selectionIds = useMemo(() => {
    return new Set(selection.map((item) => item.token_id?.toString()));
  }, [selection]);

  const selectionCurrency = useMemo(() => {
    if (selection.length === 0) return undefined;
    return selection[0].orders.length > 0
      ? selection[0].orders[0].order.currency
      : undefined;
  }, [selection]);

  const selectionType = useMemo(() => {
    if (selection.length === 0) return undefined;
    const listed = selection[0].orders.length > 0;
    if (ownedTokenIds.includes(addAddressPadding(selection[0].token_id ?? 0))) {
      return listed ? "owned-listed" : "owned-unlisted";
    }
    return listed ? "listed" : "unlisted";
  }, [selection, ownedTokenIds]);

  const handleToggleSelectById = useCallback(
    (index: number) => {
      const asset = assetsRef.current[index];
      if (asset) toggleSelection(asset);
    },
    [toggleSelection],
  );

  const handleInspectById = useCallback(
    (index: number) => {
      const asset = assetsRef.current[index];
      if (asset) handleInspect(asset);
    },
    [handleInspect],
  );

  const handlePurchaseSelection = useCallback(() => {
    handlePurchase(selection);
  }, [handlePurchase, selection]);

  const handleListSelection = useCallback(() => {
    handleList(selection);
  }, [handleList, selection]);

  const handleUnlistSelection = useCallback(() => {
    handleUnlist(selection);
  }, [handleUnlist, selection]);

  const handleSendSelection = useCallback(() => {
    handleSend(selection);
  }, [handleSend, selection]);

  const items = useMemo(() => {
    const selectionActive = selection.length > 0;

    return baseItems.map((base, index) => {
      const selected = isConnected && selectionIds.has(base.tokenId);
      const isListedCurrency =
        base.assetHasOrders && base.currency === selectionCurrency;

      const selectable =
        selection.length === 0
          ? base.owned || base.assetHasOrders
          : isERC1155
            ? false
            : selectionType === "owned-unlisted"
              ? base.owned && !base.assetHasOrders
              : selectionType === "owned-listed"
                ? base.owned && isListedCurrency
                : selectionType === "listed"
                  ? isListedCurrency
                  : false;

      const backgroundColor = base.backgroundColor || undefined;

      return {
        ...base,
        index,
        selectable: isConnected && selectable,
        selected,
        canOpen: !selectionActive,
        isConnected,
        selectionActive,
        onToggleSelectByIndex: handleToggleSelectById,
        onInspectByIndex: handleInspectById,
        onConnect: connectWallet,
        isInventory,
        backgroundColor,
      } as MarketplaceItemCardProps;
    });
  }, [
    baseItems,
    selection.length,
    selectionIds,
    selectionCurrency,
    isConnected,
    connectWallet,
    handleToggleSelectById,
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

      const startIndex = virtualRow.index * itemsPerRow;
      const endIndex = Math.min(startIndex + itemsPerRow, items.length);
      const rowItems = items.slice(startIndex, endIndex);

      return {
        key: virtualRow.key,
        isLoaderRow,
        style,
        items: rowItems,
      };
    });
  }, [virtualItems, rowCount, items, itemsPerRow]);

  const totalHeight = virtualizer.getTotalSize();

  const shouldShowEmpty =
    null === collection &&
    assets !== undefined &&
    assets.length === 0 &&
    ["idle", "error", "success"].includes(status);

  const canPurchaseSelection = selectionType === "listed";
  const canListSelection = selectionType === "owned-unlisted";
  const canUnlistSelection = selectionType === "owned-listed";
  const canSendSelection =
    selectionType === "owned-listed" || selectionType === "owned-unlisted";

  if (isLoading) {
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
      onPurchaseSelection={
        canPurchaseSelection ? handlePurchaseSelection : undefined
      }
      onListSelection={canListSelection ? handleListSelection : undefined}
      onUnlistSelection={canUnlistSelection ? handleUnlistSelection : undefined}
      onSendSelection={canSendSelection ? handleSendSelection : undefined}
      loadingOverlay={{
        isLoading: status === "loading",
        progress: undefined,
      }}
      statusFilter={statusFilter}
      listedTokensCount={listedTokens.length}
    />
  );
};
