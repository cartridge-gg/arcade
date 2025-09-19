import { useMarketFilters } from "@/hooks/market-filters";
import {
  MarketplaceFilters,
  MarketplaceHeader,
  MarketplaceHeaderReset,
  MarketplacePropertyEmpty,
  MarketplacePropertyFilter,
  MarketplacePropertyHeader,
  MarketplaceRadialItem,
  MarketplaceSearch,
  MarketplaceSearchEngine,
  SearchResult,
} from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProject } from "@/hooks/project";
import { useBalances } from "@/hooks/market-collections";
import { useUsernames } from "@/hooks/account";
import { UserAvatar } from "@/components/user/avatar";
import { usePlayerStats } from "@/hooks/achievements";

export const Filters = () => {
  const {
    active,
    setActive,
    allMetadata,
    filteredMetadata,
    clearable,
    addSelected,
    isActive,
    resetSelected,
    selected,
    setSelected,
  } = useMarketFilters();
  const [search, setSearch] = useState<{ [key: string]: string }>({});
  const [playerSearch, setPlayerSearch] = useState<string>("");

  // Player search functionality
  const { collection: collectionAddress, filter } = useProject();
  const { balances } = useBalances(collectionAddress || "", 1000);

  const accounts = useMemo(() => {
    if (!balances || balances.length === 0) return [];
    const owners = balances
      .filter((balance) => parseInt(balance.balance, 16) > 0)
      .map((balance) => `0x${BigInt(balance.account_address).toString(16)}`);
    return Array.from(new Set(owners));
  }, [balances]);

  const { usernames } = useUsernames({ addresses: accounts });

  const searchResults = useMemo(() => {
    return usernames
      .filter((item) => !!item.username)
      .map((item) => {
        const image = (
          <UserAvatar
            username={item.username || ""}
            className="h-full w-full"
          />
        );
        return {
          image,
          label: item.username,
        };
      });
  }, [usernames]);

  const playerOptions = useMemo(() => {
    if (!playerSearch) return [];
    return searchResults
      .filter((item) =>
        item.label?.toLowerCase().startsWith(playerSearch.toLowerCase())
      )
      .slice(0, 3);
  }, [searchResults, playerSearch]);

  useEffect(() => {
    const selection = searchResults.find(
      (option) => option.label?.toLowerCase() === filter?.toLowerCase()
    );
    if (
      !filter ||
      !searchResults.length ||
      selected?.label === selection?.label
    )
      return;
    if (selection) {
      setSelected(selection as SearchResult);
    }
  }, [filter, searchResults, setSelected, selected]);

  const { attributes, properties } = useMemo(() => {
    const attributes = Array.from(
      new Set(allMetadata.map((attribute) => attribute.trait_type))
    ).sort();
    const properties = attributes.reduce(
      (acc, attribute) => {
        const values = allMetadata
          .filter((m) => m.trait_type === attribute)
          .map((m) => m.value);
        const props = Array.from(new Set(values))
          .sort()
          .filter((value) =>
            `${value}`
              .toLowerCase()
              .includes(search[attribute]?.toLowerCase() || "")
          );
        acc[attribute] = props.map((prop) => ({
          property: prop,
          order:
            allMetadata.find(
              (m) => m.trait_type === attribute && m.value === prop
            )?.tokens.length || 0,
          count:
            filteredMetadata.find(
              (m) => m.trait_type === attribute && m.value === prop
            )?.tokens.length || 0,
        }));
        return acc;
      },
      {} as {
        [key: string]: { property: string; order: number; count: number }[];
      }
    );
    return { attributes, properties };
  }, [allMetadata, filteredMetadata, search]);

  const clear = useCallback(() => {
    resetSelected();
    setSearch({});
    setPlayerSearch("");
    setSelected(undefined);
  }, [resetSelected, setSearch, setPlayerSearch, setSelected]);

  return (
    <MarketplaceFilters className="h-full w-[calc(100vw-64px)] max-w-[360px] lg:flex lg:min-w-[360px] overflow-hidden">
      <MarketplaceHeader label="Status" />
      <div className="flex flex-col gap-2 w-fit">
        <MarketplaceRadialItem
          label="Buy Now"
          active={active === 0}
          onClick={() => setActive(0)}
        />
        <MarketplaceRadialItem
          label="Show All"
          active={active === 1}
          onClick={() => setActive(1)}
        />
      </div>
      <MarketplaceHeader label="Owners" />
      <div className="w-full pb-4">
        {selected ? (
          <PlayerCard
            selected={selected}
            usernames={usernames}
            onClose={() => {
              setSelected(undefined);
              setPlayerSearch("");
            }}
          />
        ) : (
          <MarketplaceSearch
            search={playerSearch}
            setSearch={setPlayerSearch}
            selected={selected}
            setSelected={(selected) => setSelected(selected as SearchResult)}
            options={playerOptions as SearchResult[]}
            variant="darkest"
            className="w-full"
          />
        )}
      </div>
      <MarketplaceHeader label="Properties">
        {clearable && <MarketplaceHeaderReset onClick={clear} />}
      </MarketplaceHeader>
      <div
        className="h-full flex flex-col gap-2 overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        {attributes.map((attribute, index) => (
          <MarketplacePropertyHeader
            key={index}
            label={attribute}
            count={properties[attribute].length}
          >
            <MarketplaceSearchEngine
              variant="darkest"
              search={search[attribute] || ""}
              setSearch={(value: string) =>
                setSearch((prev) => ({ ...prev, [attribute]: value }))
              }
            />
            <div className="flex flex-col gap-px">
              {properties[attribute]
                .sort((a, b) => b.order - a.order)
                .map(({ property, count }, index) => (
                  <MarketplacePropertyFilter
                    key={`${attribute}-${property}-${index}`}
                    label={property}
                    count={count}
                    disabled={count === 0 && !isActive(attribute, property)}
                    value={isActive(attribute, property)}
                    setValue={(value: boolean) =>
                      addSelected(attribute, property, value)
                    }
                  />
                ))}
              {properties[attribute].length === 0 && (
                <MarketplacePropertyEmpty />
              )}
            </div>
          </MarketplacePropertyHeader>
        ))}
      </div>
    </MarketplaceFilters>
  );
};

function PlayerCard({
  selected,
  onClose,
  usernames,
}: {
  selected: SearchResult;
  onClose: () => void;
  usernames: { username: string | undefined; address: string | undefined }[];
}) {
  const account = usernames.find(
    (item) => item.username === selected?.label,
  )?.address;

  const { earnings } = usePlayerStats(account || undefined);

  return (
    <div className="w-full bg-background-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          {selected.image}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-foreground-100 font-semibold text-sm truncate">
            {selected.label}
          </h3>
          <p className="text-foreground-300 text-xs">
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Address not found'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-foreground-400 hover:text-foreground-200 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-background-300"
        >
          ×
        </button>
      </div>
      <div className="border-t border-background-300 pt-3">
        <div className="flex justify-between items-center">
          <span className="text-foreground-300 text-xs">Total Points</span>
          <span className="text-foreground-100 font-semibold text-sm">
            {earnings.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
