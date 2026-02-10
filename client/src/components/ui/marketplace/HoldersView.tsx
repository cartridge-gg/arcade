import { Link } from "@tanstack/react-router";
import { Button, Empty, Skeleton } from "@cartridge/ui";
import { UserAvatar } from "@/components/user/avatar";
import { FloatingLoadingSpinner } from "@/components/ui/floating-loading-spinner";
import type { MarketplaceHolder } from "@/effect";

interface HoldersViewProps {
  holders: MarketplaceHolder[];
  hasActiveFilters: boolean;
  totalHolders: number;
  filteredHoldersCount: number;
  onClearFilters: () => void;
  isLoadingMore: boolean;
}

export const HoldersView = ({
  holders,
  hasActiveFilters,
  totalHolders,
  filteredHoldersCount,
  onClearFilters,
  isLoadingMore,
}: HoldersViewProps) => {
  return (
    <div className="flex flex-col gap-4 lg:order-3">
      {(hasActiveFilters || totalHolders > 0) && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {hasActiveFilters ? (
              <>
                <p className="text-foreground-300 text-sm">
                  Showing {filteredHoldersCount} of {totalHolders} holders
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
                {totalHolders} holders
              </p>
            )}
          </div>
        </div>
      )}
      <HoldersHeader />
      <div className="rounded overflow-hidden w-full mb-6">
        <div className="flex flex-col gap-px overflow-y-auto">
          {holders.map((holder, index) => (
            <HolderLine
              key={`${holder.address}-${index}`}
              holder={holder}
              index={index}
            />
          ))}
        </div>
      </div>
      <FloatingLoadingSpinner isLoading={isLoadingMore} />
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

function HolderLine({
  holder,
  index,
}: { holder: MarketplaceHolder; index: number }) {
  return (
    <Link to={holder.href} disabled={!holder.href}>
      <div className="flex items-center gap-3 bg-background-200 text-foreground-100 font-medium text-sm h-10 w-full hover:bg-background-300">
        <div className="flex items-center gap-2 w-1/2 px-3 py-1">
          <p className="w-8 text-foreground-400 font-normal">{index + 1}.</p>
          <div className="flex items-center gap-1 text-foreground-100 font-normal font-sans">
            <UserAvatar
              username={holder.username || holder.address.slice(0, 9) || ""}
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
    </Link>
  );
}

export const HoldersEmptyState = () => {
  return (
    <Empty title="No holders" icon="guild" className="h-full lg:order-3" />
  );
};

export const HoldersFilteredEmptyState = ({
  onClearFilters,
  hasActiveFilters,
}: {
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}) => {
  return (
    <div className="flex flex-col pt-6 gap-4 lg:order-3">
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
