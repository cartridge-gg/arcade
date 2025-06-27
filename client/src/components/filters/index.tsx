import {
  MarketplaceFilters,
  MarketplaceHeader,
  MarketplaceHeaderReset,
  MarketplacePropertyEmpty,
  MarketplacePropertyFilter,
  MarketplacePropertyHeader,
  MarketplaceRadialItem,
  MarketplaceSearchEngine,
} from "@cartridge/ui";
import { useCallback, useMemo, useState } from "react";

const ATTRIBUTES = [
  "Name",
  "XP",
  "Level",
  "Health",
  "Gold",
  "Strength",
  "Dexterity",
  "Intelligence",
  "Vitality",
  "Wisdom",
];
const PROPERTIES = [1, 2, 3, 4, 5];

export const Filters = () => {
  const [active, setActive] = useState<number>(0);
  const [search, setSearch] = useState<{ [key: string]: string }>({});
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({});

  const reset = useMemo(() => {
    return Object.values(selected).filter((value) => !!value).length > 0;
  }, [selected]);

  const clear = useCallback(() => {
    setSelected({});
    setSearch({});
  }, []);

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
        {reset && <MarketplaceHeaderReset onClick={clear} />}
      </MarketplaceHeader>
      {ATTRIBUTES.map((label, index) => (
        <MarketplacePropertyHeader key={index} label={label} count={17}>
          <MarketplaceSearchEngine
            variant="darkest"
            search={search[label] || ""}
            setSearch={(value: string) =>
              setSearch((prev) => ({ ...prev, [label]: value }))
            }
          />
          <div className="flex flex-col gap-px">
            {PROPERTIES.filter((i) =>
              `Property ${label} ${i}`
                .toLowerCase()
                .includes((search[label] || "").toLowerCase()),
            ).map((i) => (
              <MarketplacePropertyFilter
                key={i}
                label={`Property ${label} ${i}`}
                count={100}
                value={selected[label + i] || false}
                setValue={(value: boolean) =>
                  setSelected((prev) => ({ ...prev, [label + i]: value }))
                }
              />
            ))}
            {PROPERTIES.filter((i) =>
              `Property ${label} ${i}`
                .toLowerCase()
                .includes((search[label] || "").toLowerCase()),
            ).length === 0 && <MarketplacePropertyEmpty />}
          </div>
        </MarketplacePropertyHeader>
      ))}
    </MarketplaceFilters>
  );
};
