import { Button, Empty, Skeleton } from "@cartridge/ui";
import { UserAvatar } from "@/components/user/avatar";
import { FloatingLoadingSpinner } from "@/components/ui/floating-loading-spinner";
import type { MarketplaceHolder } from "@/features/marketplace/holders/useMarketplaceHoldersViewModel";

interface HoldersViewProps {
  owners: MarketplaceHolder[];
  hasActiveFilters: boolean;
  totalOwners: number;
  filteredOwnersCount: number;
  onClearFilters: () => void;
  isLoadingMore: boolean;
  loadingProgress: { completed: number; total: number } | undefined;
}

export const HoldersView = ({
  owners,
  hasActiveFilters,
  totalOwners,
  filteredOwnersCount,
  onClearFilters,
  isLoadingMore,
  loadingProgress,
}: HoldersViewProps) => {
  return (
    <div className="flex flex-col pt-6 gap-4">
      {(hasActiveFilters || totalOwners > 0) && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {hasActiveFilters ? (
              <>
                <p className="text-foreground-300 text-sm">
                  Showing {filteredOwnersCount} of {totalOwners} holders
                </p>
                <Button
                  variant="ghost"
                  onClick={onClearFilters}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <p className="text-foreground-300 text-sm">
                {totalOwners} holders
              </p>
            )}
          </div>
        </div>
      )}
      <HoldersHeader />
      <div className="rounded overflow-hidden w-full mb-6">
        <div className="flex flex-col gap-px overflow-y-auto">
          {owners.map((holder, index) => (
            <div
              key={`${holder.address}-${index}`}
              className="flex items-center gap-3 bg-background-200 text-foreground-100 font-medium text-sm h-10 w-full"
            >
              <div className="flex items-center gap-2 w-1/2 px-3 py-1">
                <p className="w-8 text-foreground-400 font-normal">
                  {index + 1}.
                </p>
                <div className="flex items-center gap-1">
                  <UserAvatar
                    username={
                      holder.username || holder.address.slice(0, 9) || ""
                    }
                    size="sm"
                  />
                  <p>{holder.username || holder.address.slice(0, 9) || ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-1/2 px-3 py-1">
                <p className="w-1/2 text-right">{holder.balance}</p>
                <p className="w-1/2 text-right">{holder.ratio}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <FloatingLoadingSpinner
        isLoading={isLoadingMore}
        loadingProgress={loadingProgress}
      />
    </div>
  );
};

export const HoldersHeader = () => {
  return (
    <div className="flex items-center gap-3 text-foreground-300 font-medium text-xs w-full">
      <div className="flex items-center gap-2 w-1/2 px-3 py-1">
        <p className="w-8">#</p>
        <p className="grow">Owner</p>
      </div>
      <div className="flex items-center gap-2 w-1/2 px-3 py-1">
        <p className="w-1/2 text-right"># Held</p>
        <p className="w-1/2 text-right">% Held</p>
      </div>
    </div>
  );
};

export const HoldersEmptyState = () => {
  return <Empty title="No holders" icon="guild" className="h-full" />;
};

export const HoldersFilteredEmptyState = ({
  onClearFilters,
  hasActiveFilters,
}: {
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}) => {
  return (
    <div className="flex flex-col pt-6 gap-4">
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <p className="text-foreground-300 text-sm">
            No holders found with selected filters
          </p>
          <Button variant="ghost" onClick={onClearFilters} className="text-xs">
            Clear Filters
          </Button>
        </div>
      )}
      <Empty
        title="No holders match the selected filters"
        icon="guild"
        className="h-full py-3 lg:py-6"
      />
    </div>
  );
};

export const HoldersLoadingState = () => {
  return (
    <div className="flex flex-col gap-y-3 lg:gap-y-4 h-full">
      <HoldersHeader />
      <div className="flex flex-col gap-px h-full rounded overflow-hidden">
        {Array.from({ length: 20 }).map((_, index) => (
          <Skeleton key={index} className="min-h-10 w-full rounded-none" />
        ))}
      </div>
    </div>
  );
};
