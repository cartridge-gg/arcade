import { useUsernames } from "@/hooks/account";
import { useProject } from "@/hooks/project";
import { Empty, Skeleton } from "@cartridge/ui";
import { useCallback, useMemo } from "react";
import { UserAvatar } from "../user/avatar";
import { getChecksumAddress } from "starknet";
import { useMarketFilters } from "@/hooks/market-filters";
import { useLocation, useNavigate } from "react-router-dom";
import { joinPaths } from "@/helpers";

export const Holders = () => {
  const { collection: collectionAddress } = useProject();
  const { filteredBalances: balances } = useMarketFilters();

  const { accounts, total } = useMemo(() => {
    if (!balances || balances.length === 0) return { accounts: [], total: 0 };
    const filtered = balances.filter(
      (balance) => parseInt(balance.balance, 16) > 0,
    );
    const owners = filtered.map(
      (balance) => `0x${BigInt(balance.account_address).toString(16)}`,
    );
    const total = filtered.reduce(
      (acc, balance) => acc + parseInt(balance.balance, 16),
      0,
    );
    return { accounts: Array.from(new Set(owners)), total };
  }, [balances, collectionAddress]);

  const { usernames } = useUsernames({ addresses: accounts });

  const data = useMemo(() => {
    return accounts
      .map((address) => {
        const user = usernames.find(
          (user) => BigInt(user.address || "0x0") === BigInt(address),
        );
        const userBalances = balances.filter(
          (balance) => BigInt(balance.account_address) === BigInt(address),
        );
        const checksum = getChecksumAddress(address);
        const shorten = `${checksum.slice(0, 4)}...${checksum.slice(-4)}`;
        const quantity = userBalances.reduce(
          (acc, balance) => acc + parseInt(balance.balance, 16),
          0,
        );
        return {
          username: user?.username || shorten,
          address: user?.address || address,
          balance: quantity,
          ratio: `${((quantity / total) * 100).toFixed(1)}%`,
        };
      })
      .sort((a, b) => b.balance - a.balance);
  }, [balances, usernames, total]);

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

  if (usernames.length === 0) return <LoadingState />;

  if (data.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col pt-6 gap-4">
      <Header />
      <div className="rounded overflow-hidden w-full mb-6">
        <div className="flex flex-col gap-px overflow-y-auto">
          {data.map((holder, index) => (
            <div
              key={`${holder.username}-${holder.address}-${index}`}
              className="flex items-center gap-3 bg-background-200 hover:bg-background-300 cursor-pointer text-foreground-100 font-medium text-sm h-10 w-full"
              onClick={() => handleClick(holder.address)}
            >
              <div className="flex items-center gap-2 w-1/2 px-3 py-1">
                <p className="w-8 text-foreground-400 font-normal">
                  {index + 1}.
                </p>
                <div className="flex items-center gap-1">
                  <UserAvatar username={holder.username} size="sm" />
                  <p>{holder.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-1/2 px-3 py-1">
                <p className="w-1/2 text-right">{holder.balance}</p>
                <p className="w-1/2 text-right">{holder.ratio}</p>
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
