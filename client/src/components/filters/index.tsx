import { useMetadataFiltersAdapter } from "@/hooks/use-metadata-filters-adapter";
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
  SearchResult,
  SparklesIcon,
  XIcon,
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
    filteredMetadata,
    clearable,
    addSelected,
    isActive,
    resetSelected,
    precomputedAttributes,
    precomputedProperties,
  } = useMetadataFiltersAdapter();

  const { selected, setSelected } = useMarketFilters();
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

  // Build filtered properties with dynamic counts
  const getFilteredProperties = useMemo(() => {
    return (attribute: string) => {
      const precomputedProps = precomputedProperties[attribute] || [];

      // Add dynamic count from filtered metadata
      return precomputedProps.map((prop) => ({
        property: prop.property,
        order: prop.order,
        count:
          filteredMetadata.find(
            (m) => m.trait_type === attribute && m.value === prop.property
          )?.tokens.length || 0,
      }));
    };
  }, [precomputedProperties, filteredMetadata]);

  const clear = useCallback(() => {
    resetSelected();
    setPlayerSearch("");
    setSelected(undefined);
  }, [
    resetSelected,
    setPlayerSearch,
    setSelected,
  ]);

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
        {precomputedAttributes.map((attribute, index) => {
          const properties = getFilteredProperties(attribute);
          return (
            <MarketplacePropertyHeader
              key={index}
              label={attribute}
              count={properties.length}
            >
              <div className="flex flex-col gap-px">
                {properties
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
                {properties.length === 0 && <MarketplacePropertyEmpty />}
              </div>
            </MarketplacePropertyHeader>
          );
        })}
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
    (item) => item.username === selected?.label
  )?.address;

  const { earnings } = usePlayerStats(account || undefined);

  return (
    <div className="w-full outline outline-1 border-4 border-background-100 outline-background-300 flex justify-between bg-background-200 rounded px-2 py-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
          {selected.image}
        </div>
        <div className="flex-1 min-w-0">
          <p className=" font-light text-sm">{selected.label}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded">
        <div className="flex justify-between items-center bg-background-400 rounded py-1 pl-1 pr-2 gap-1">
          <span className="text-foreground-300 text-xs">
            <SparklesIcon variant="solid" size="xs" color="white" />
          </span>
          <span className="text-foreground-100 text-xs">
            {earnings.toLocaleString()}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-foreground-400 hover:text-foreground-200 w-5 h-5"
        >
          <XIcon size="sm" />
        </button>
      </div>
    </div>
  );
}
