import { Empty, Skeleton, Button } from "@cartridge/ui";
import { UserAvatar } from "../user/avatar";
import { useMemo } from "react";
import type { EditionModel } from "@cartridge/arcade";
import { useMarketOwnersFetcher } from "@/hooks/marketplace-owners-fetcher";
import { FloatingLoadingSpinner } from "@/components/ui/floating-loading-spinner";
import { useMetadataFilters } from "@/hooks/use-metadata-filters";
import { useMarketplaceTokensStore } from "@/store";
import { DEFAULT_PROJECT } from "@/constants";

export const Holders = ({
  edition,
  collectionAddress,
}: {
  edition: EditionModel;
  collectionAddress: string;
}) => {
  const { owners, status, editionError, loadingProgress } =
    useMarketOwnersFetcher({
      project: [edition.config.project],
      address: collectionAddress,
    });

  const getTokens = useMarketplaceTokensStore((state) => state.getTokens);
  const tokens = getTokens(DEFAULT_PROJECT, collectionAddress ?? "");
  const { filteredTokens, activeFilters, clearAllFilters } = useMetadataFilters(
    {
      tokens: tokens || [],
      collectionAddress: collectionAddress ?? "",
      enabled: !!collectionAddress && !!tokens,
    },
  );

  // const navigate = useNavigate();
  // const location = useLocation();
  // const handleClick = useCallback(
  //   (nameOrAddress: string) => {
  //     // On click, we update the url param address to the address of the player
  //     let pathname = location.pathname;
  //     pathname = pathname.replace(/\/player\/[^/]+/, "");
  //     pathname = pathname.replace(/\/tab\/[^/]+/, "");
  //     pathname = pathname.replace(/\/collection\/[^/]+/, "");
  //     pathname = pathname.replace(/\/edition\/[^/]+/, "");
  //     const player = nameOrAddress.toLowerCase();
  //     pathname = joinPaths(pathname, `/player/${player}`);
  //     navigate(pathname || "/");
  //   },
  //   [location, navigate],
  // );

  // Filter holders based on metadata filters
  const filteredOwners = useMemo(() => {
    // If no filters are active, return all owners
    if (!owners || Object.keys(activeFilters).length === 0) {
      return owners;
    }

    // Get filtered token IDs
    const filteredTokenIds = new Set(
      filteredTokens.map((t) => t.token_id?.toString()).filter(Boolean),
    );

    // Filter owners to only those who own filtered tokens
    const tempOwnersMap = new Map();

    Object.entries(owners).forEach(([ownerAddress, ownerData]) => {
      // Check if this owner owns any of the filtered tokens
      const ownedFilteredTokenIds = ownerData.token_ids.filter((id) =>
        filteredTokenIds.has(id),
      );

      if (ownedFilteredTokenIds.length > 0) {
        // Recalculate balance based on filtered tokens only
        tempOwnersMap.set(ownerAddress, {
          ...ownerData,
          balance: ownedFilteredTokenIds.length,
          token_ids: ownedFilteredTokenIds,
        });
      }
    });

    // Recalculate ratios based on filtered total
    const filteredTotal = Array.from(tempOwnersMap.values()).reduce(
      (sum, owner) => sum + owner.balance,
      0,
    );

    tempOwnersMap.forEach((owner) => {
      owner.ratio =
        filteredTotal > 0
          ? Math.round((owner.balance / filteredTotal) * 1000) / 10
          : 0;
    });

    return new Map(
      [...tempOwnersMap.entries()].sort(
        ([, a], [, b]) => b.balance - a.balance,
      ),
    );
  }, [owners, activeFilters, filteredTokens]);

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  if (status === "idle" || (status === "loading" && owners.length === 0))
    return <LoadingState />;

  if (editionError.length > 0)
    return (
      <Empty
        title={`Failed to load holders data from ${editionError[0].attributes.preset} torii`}
        className="h-full py-6"
      />
    );

  if (Object.values(owners).length === 0) return <EmptyState />;

  const totalOwners = Object.keys(owners).length;
  const filteredOwnersCount =
    filteredOwners instanceof Map
      ? filteredOwners.size
      : Object.keys(filteredOwners).length;

  if (hasActiveFilters && filteredOwnersCount === 0) {
    return (
      <div className="flex flex-col pt-6 gap-4">
        <div className="flex items-center gap-2">
          <p className="text-foreground-300 text-sm">
            No holders found with selected filters
          </p>
          <Button variant="ghost" onClick={clearAllFilters} className="text-xs">
            Clear Filters
          </Button>
        </div>
        <Empty
          title="No holders match the selected filters"
          icon="guild"
          className="h-full py-3 lg:py-6"
        />
      </div>
    );
  }

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
                  onClick={clearAllFilters}
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
      <Header />
      <div className="rounded overflow-hidden w-full mb-6">
        <div className="flex flex-col gap-px overflow-y-auto">
          {(filteredOwners instanceof Map
            ? [...filteredOwners.entries()]
            : Object.entries(filteredOwners)
          ).map(([holderAddress, holder], index) => (
            <div
              key={`${holder.username}-${holderAddress}-${index}`}
              // className="flex items-center gap-3 bg-background-200 hover:bg-background-300 cursor-pointer text-foreground-100 font-medium text-sm h-10 w-full"
              className="flex items-center gap-3 bg-background-200 text-foreground-100 font-medium text-sm h-10 w-full"
              // onClick={() => handleClick(holderAddress)}
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
        isLoading={status === "loading" && Object.values(owners).length > 0}
        loadingProgress={loadingProgress}
      />
    </div>
  );
};

const Header = () => {
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

const EmptyState = () => {
  return (
    <Empty title="No holders" icon="guild" className="h-full py-3 lg:py-6" />
  );
};

const LoadingState = () => {
  return (
    <div className="flex flex-col gap-y-3 lg:gap-y-4 h-full py-6">
      <Header />
      <div className="flex flex-col gap-px h-full rounded overflow-hidden">
        {Array.from({ length: 20 }).map((_, index) => (
          <Skeleton key={index} className="min-h-10 w-full rounded-none" />
        ))}
      </div>
    </div>
  );
};
