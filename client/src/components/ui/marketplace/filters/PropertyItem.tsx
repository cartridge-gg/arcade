import { memo, useCallback } from "react";
import { MarketplacePropertyFilter } from "@cartridge/ui";

interface PropertyItemProps {
  attributeName: string;
  property: string;
  count: number;
  isActive: boolean;
  onToggle: (attribute: string, property: string, enabled: boolean) => void;
}

export const PropertyItem = memo(
  ({
    attributeName,
    property,
    count,
    isActive,
    onToggle,
  }: PropertyItemProps) => {
    const handleToggle = useCallback(
      (enabled: boolean) => onToggle(attributeName, property, enabled),
      [attributeName, property, onToggle],
    );

    return (
      <MarketplacePropertyFilter
        label={property}
        count={count}
        disabled={count === 0 && !isActive}
        value={isActive}
        setValue={handleToggle}
      />
    );
  },
);

PropertyItem.displayName = "PropertyItem";
