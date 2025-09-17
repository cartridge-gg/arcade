import { Empty, Skeleton } from "@cartridge/ui";
import { useCallback } from "react";
import { UserAvatar } from "../user/avatar";
import { useLocation, useNavigate } from "react-router-dom";
import { joinPaths } from "@/helpers";
import { EditionModel } from "@cartridge/arcade";
import { useMarketOwnersFetcher } from "@/hooks/marketplace-owners-fetcher";

export const Holders = ({ edition, collectionAddress }: { edition: EditionModel, collectionAddress: string }) => {

  const { owners, status } = useMarketOwnersFetcher({
    project: [edition.config.project],
    address: collectionAddress
  });

  const navigate = useNavigate();
  const location = useLocation();
  const handleClick = useCallback(
    (nameOrAddress: string) => {
      // On click, we update the url param address to the address of the player
      let pathname = location.pathname;
      pathname = pathname.replace(/\/player\/[^/]+/, "");
      pathname = pathname.replace(/\/tab\/[^/]+/, "");
      pathname = pathname.replace(/\/collection\/[^/]+/, "");
      pathname = pathname.replace(/\/edition\/[^/]+/, "");
      const player = nameOrAddress.toLowerCase();
      pathname = joinPaths(pathname, `/player/${player}`);
      navigate(pathname || "/");
    },
    [location, navigate],
  );

  if (status === 'idle') return <LoadingState />;

  if (Object.values(owners).length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col pt-6 gap-4">
      <Header />
      <div className="rounded overflow-hidden w-full mb-6">
        <div className="flex flex-col gap-px overflow-y-auto">
          {Object.entries(owners).map(([holderAddress, holder], index) => (
            <div
              key={`${holder.username}-${holderAddress}-${index}`}
              className="flex items-center gap-3 bg-background-200 hover:bg-background-300 cursor-pointer text-foreground-100 font-medium text-sm h-10 w-full"
              onClick={() => handleClick(holderAddress)}
            >
              <div className="flex items-center gap-2 w-1/2 px-3 py-1">
                <p className="w-8 text-foreground-400 font-normal">
                  {index + 1}.
                </p>
                <div className="flex items-center gap-1">
                  <UserAvatar username={holder.username ?? ""} size="sm" />
                  <p>{holder.username}</p>
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
