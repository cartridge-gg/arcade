import {
  MarketplaceFilters,
  MarketplaceHeader,
  MarketplaceHeaderReset,
  MarketplacePropertyFilter,
  MarketplacePropertyHeader,
  MarketplaceRadialItem,
  MarketplaceSearchEngine,
} from "@cartridge/ui";
import { useMetadataFilters } from "@cartridge/marketplace";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useFilters } from "@/context/filter";


export const Filters = () => {
  const [active, setActive] = useState<number>(0);
  const [search, setSearch] = useState<{ [key: string]: string }>({});
  const [selected, _setSelected] = useState<{ [key: string]: boolean }>({});
  const params = useParams();

  const { onFilterChange } = useFilters();

  const {
    statistics,
    toggleTrait,
    clearFilters,
    isTraitSelected,
  } = useMetadataFilters(params.collection ?? "", import.meta.env.VITE_IDENTITY, onFilterChange);

  const reset = useMemo(() => {
    return Object.values(selected).filter((value) => !!value).length > 0;
  }, [selected]);

  return (
    <MarketplaceFilters className="h-full w-[calc(100vw-64px)] max-w-[360px] lg:flex lg:min-w-[360px]">
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
      <MarketplaceHeader label="Properties">
        {reset && <MarketplaceHeaderReset onClick={clearFilters} />}
      </MarketplaceHeader>
      {statistics.map(({ traitType, values }) => {
        return (
          <MarketplacePropertyHeader key={traitType} label={traitType} count={values.length}>
            <MarketplaceSearchEngine
              variant="darkest"
              search={search[traitType] || ""}
              setSearch={(value: string) =>
                setSearch((prev) => ({ ...prev, [traitType]: value }))
              }
            />
            <div className="flex flex-col gap-px">
              {values.map(({ value, count }) => (
                <MarketplacePropertyFilter
                  key={`${value}-${count}`}
                  label={value}
                  count={count}
                  value={isTraitSelected(traitType, value) || false}
                  setValue={() =>
                    toggleTrait(traitType, value)
                  }
                />
              ))}
            </div>
          </MarketplacePropertyHeader>
        )
      })}
    </MarketplaceFilters>
  );
};
