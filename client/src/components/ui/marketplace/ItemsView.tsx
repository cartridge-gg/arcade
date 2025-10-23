import {
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent,
  type RefObject,
} from "react";
import {
  Button,
  Checkbox,
  CollectibleCard,
  Empty,
  MarketplaceSearch,
  Separator,
  Skeleton,
  cn,
} from "@cartridge/ui";
import { FloatingLoadingSpinner } from "@/components/ui/floating-loading-spinner";

export interface MarketplaceItemPriceInfo {
  value: string;
  image: string;
}

export interface MarketplaceItemCardProps {
  id: string;
  title: string;
  image?: string | null;
  placeholderImage?: string;
  listingCount: number;
  price: MarketplaceItemPriceInfo | null;
  lastSale: MarketplaceItemPriceInfo | null;
  selectable: boolean;
  selected: boolean;
  canOpen: boolean;
  isConnected: boolean;
  selectionActive: boolean;
  onToggleSelect: () => void;
  onBuy: () => void;
  onInspect: () => void;
  onConnect: () => Promise<void> | void;
}

export interface MarketplaceItemsRow {
  key: number | string | bigint;
  isLoaderRow: boolean;
  style: CSSProperties;
  items: MarketplaceItemCardProps[];
}

interface ItemsViewProps {
  parentRef: RefObject<HTMLDivElement>;
  totalHeight: number;
  rows: MarketplaceItemsRow[];
  hasMore: boolean;
  isFetchingNextPage: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectionCount: number;
  filteredCount: number;
  totalTokensCount: number;
  collectionSupply: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onResetSelection: () => void;
  isConnected: boolean;
  onBuySelection: () => void;
  loadingOverlay: {
    isLoading: boolean;
    progress?: { completed: number; total: number };
  };
}

export const ItemsView = ({
  parentRef,
  totalHeight,
  rows,
  hasMore,
  isFetchingNextPage,
  searchValue,
  onSearchChange,
  selectionCount,
  filteredCount,
  totalTokensCount,
  collectionSupply,
  hasActiveFilters,
  onClearFilters,
  onResetSelection,
  isConnected,
  onBuySelection,
  loadingOverlay,
}: ItemsViewProps) => {
  return (
    <div className="flex flex-col gap-4 h-full w-full overflow-hidden">
      <div className="min-h-10 w-full flex justify-between items-center relative">
        <div className="flex items-center gap-4">
          <SelectionSummary
            isConnected={isConnected}
            selectionCount={selectionCount}
            filteredCount={filteredCount}
            totalTokensCount={totalTokensCount}
            collectionSupply={collectionSupply}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onResetSelection={onResetSelection}
          />
        </div>
        <MarketplaceSearch
          search={searchValue}
          setSearch={onSearchChange}
          selected={undefined}
          setSelected={() => {}}
          options={[]}
          variant="darkest"
          className="w-[200px] lg:w-[240px] absolute top-0 right-0 z-10"
        />
      </div>
      <div
        ref={parentRef}
        className="overflow-y-auto h-full"
        style={{ scrollbarWidth: "none" }}
      >
        <div
          style={{
            height: `${totalHeight}px`,
            position: "relative",
          }}
        >
          {rows.map((row) => {
            if (row.isLoaderRow) {
              return (
                <div key={row.key} style={row.style}>
                  {hasMore && (
                    <div className="w-full flex justify-center items-center py-6 text-sm text-foreground-300">
                      {isFetchingNextPage
                        ? "Loading more items…"
                        : "Scroll to load more"}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={row.key} style={row.style}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {row.items.map((item) => (
                    <MarketplaceItemCard key={item.id} {...item} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <SelectionFooter
        isVisible={isConnected && selectionCount > 0}
        selectionCount={selectionCount}
        onBuySelection={onBuySelection}
      />
      <FloatingLoadingSpinner
        isLoading={loadingOverlay.isLoading && totalTokensCount > 0}
        loadingProgress={loadingOverlay.progress}
      />
    </div>
  );
};

const SelectionSummary = ({
  isConnected,
  selectionCount,
  filteredCount,
  totalTokensCount,
  collectionSupply,
  onResetSelection,
}: {
  isConnected: boolean;
  selectionCount: number;
  filteredCount: number;
  totalTokensCount: number;
  collectionSupply: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onResetSelection: () => void;
}) => {
  const showSelection = isConnected && selectionCount > 0;

  return (
    <div
      className={cn(
        "h-6 p-0.5 flex items-center gap-1.5 text-foreground-200 text-xs",
        !selectionCount && "text-foreground-400",
        showSelection && "cursor-pointer",
      )}
      onClick={showSelection ? onResetSelection : undefined}
    >
      {showSelection && (
        <Checkbox
          className="text-foreground-100"
          variant="minus-line"
          size="sm"
          checked
        />
      )}
      {showSelection ? (
        <p>{`${selectionCount} / ${filteredCount} Selected`}</p>
      ) : (
        <>
          <CollectionCount
            collectionCount={collectionSupply}
            tokensCount={totalTokensCount}
            filteredTokensCount={filteredCount}
          />
        </>
      )}
    </div>
  );
};

const SelectionFooter = ({
  isVisible,
  selectionCount,
  onBuySelection,
}: {
  isVisible: boolean;
  selectionCount: number;
  onBuySelection: () => void;
}) => {
  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-500 ease-out",
        isVisible ? "max-h-36 opacity-100" : "max-h-0 opacity-0",
      )}
    >
      <Separator className="w-full bg-background-200" />
      <div className="w-full flex justify-end items-center">
        <Button
          variant="primary"
          onClick={onBuySelection}
          disabled={selectionCount === 0}
        >
          {`Buy (${selectionCount})`}
        </Button>
      </div>
    </div>
  );
};

const MarketplaceItemCard = ({
  selectionActive,
  selectable,
  selected,
  canOpen,
  isConnected,
  onToggleSelect,
  onBuy,
  onInspect,
  onConnect,
  image,
  placeholderImage,
  title,
  listingCount,
  price,
  lastSale,
}: MarketplaceItemCardProps) => {
  const fallbackImage = placeholderImage ?? image ?? "";
  const [displayImage, setDisplayImage] = useState<string>(fallbackImage);

  useEffect(() => {
    const nextFallback = placeholderImage ?? "";

    if (!image) {
      setDisplayImage(nextFallback || "");
      return;
    }

    if (nextFallback) {
      setDisplayImage(nextFallback);
    }

    let isMounted = true;
    const loader = new window.Image();
    loader.onload = () => {
      if (isMounted) {
        setDisplayImage(image);
      }
    };
    loader.onerror = () => {
      if (isMounted) {
        setDisplayImage(nextFallback || "");
      }
    };
    loader.src = image;

    return () => {
      isMounted = false;
    };
  }, [image, placeholderImage]);

  const handleContainerClick = (event: MouseEvent<HTMLDivElement>) => {
    if (isConnected && selectionActive && selectable) {
      event.preventDefault();
      onToggleSelect();
    }
  };

  const handleCardClick = () => {
    if (selectable && canOpen) {
      onBuy();
      return;
    }

    if (canOpen && isConnected) {
      onInspect();
      return;
    }

    if (!isConnected) {
      void onConnect();
    }
  };

  return (
    <div className="w-full group select-none" onClick={handleContainerClick}>
      <CollectibleCard
        title={title}
        image={displayImage}
        listingCount={listingCount}
        onClick={handleCardClick}
        className={
          selectable || canOpen
            ? "cursor-pointer"
            : "cursor-default pointer-events-none"
        }
        onSelect={isConnected && selectable ? onToggleSelect : undefined}
        price={price}
        lastSale={lastSale}
        selectable={selectable}
        selected={selected}
      />
    </div>
  );
};

const CollectionCount = ({
  collectionCount,
  tokensCount,
  filteredTokensCount,
}: {
  collectionCount: number;
  tokensCount: number;
  filteredTokensCount: number;
}) => {
  if (filteredTokensCount === 0) return <p>{collectionCount} Items</p>;
  return (
    <p>
      {tokensCount} of {collectionCount} Items
    </p>
  );
};

export const ItemsLoadingState = () => {
  return (
    <div className="flex flex-col gap-y-3 lg:gap-y-4 h-full">
      <div className="flex justify-between items-center">
        <Skeleton className="min-h-10 w-1/5" />
        <Skeleton className="min-h-10 w-1/3" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 place-items-center select-none overflow-hidden h-full">
        {Array.from({ length: 20 }).map((_, index) => (
          <Skeleton key={index} className="min-h-[218px] w-full" />
        ))}
      </div>
    </div>
  );
};

export const ItemsEmptyState = () => {
  return (
    <Empty title="No related collections" icon="inventory" className="h-full" />
  );
};
