import { memo, useState, useEffect } from "react";
import { MarketplaceSearchEngine } from "@cartridge/ui";

interface AttributeSearchProps {
  attributeName: string;
  initialValue: string;
  onSearchChange: (attribute: string, value: string) => void;
}

export const AttributeSearch = memo(
  ({ attributeName, initialValue, onSearchChange }: AttributeSearchProps) => {
    const [localSearch, setLocalSearch] = useState(initialValue);

    useEffect(() => {
      setLocalSearch(initialValue);
    }, [initialValue]);

    useEffect(() => {
      const timer = setTimeout(() => {
        if (localSearch !== initialValue) {
          onSearchChange(attributeName, localSearch);
        }
      }, 150);
      return () => clearTimeout(timer);
    }, [localSearch, attributeName, onSearchChange, initialValue]);

    return (
      <MarketplaceSearchEngine
        variant="darkest"
        search={localSearch}
        setSearch={setLocalSearch}
      />
    );
  },
);

AttributeSearch.displayName = "AttributeSearch";
