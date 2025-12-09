import { memo, useMemo, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  MarketplacePropertyEmpty,
  SpinnerIcon,
  cn,
} from "@cartridge/ui";
import { AttributeSearch } from "./AttributeSearch";
import { PropertyItem } from "./PropertyItem";
import type { MarketplaceFilterAttributeView } from "../MarketplaceFiltersView";

interface AttributeSectionProps {
  attribute: MarketplaceFilterAttributeView;
  onToggleProperty: (attr: string, prop: string, enabled: boolean) => void;
  onSearchChange: (attr: string, value: string) => void;
  onExpand: (attr: string, expanded: boolean) => void;
}

export const AttributeSection = memo(
  ({
    attribute,
    onToggleProperty,
    onSearchChange,
    onExpand,
  }: AttributeSectionProps) => {
    const hasActiveProperty = attribute.properties.some((p) => p.isActive);

    const sortedProperties = useMemo(
      () => [...attribute.properties].sort((a, b) => b.order - a.order),
      [attribute.properties],
    );

    const handleValueChange = useCallback(
      (value: string) => {
        onExpand(attribute.name, value === "item-1");
      },
      [attribute.name, onExpand],
    );

    const accordionValue =
      hasActiveProperty || attribute.isExpanded ? "item-1" : undefined;

    return (
      <Accordion
        type="single"
        collapsible
        value={accordionValue}
        onValueChange={handleValueChange}
      >
        <AccordionItem value="item-1">
          <div className="h-9 cursor-pointer">
            <AccordionTrigger
              className="grow pr-2 flex justify-between items-center"
              parentClassName={cn(
                "group px-3 py-2 bg-background-200 hover:bg-background-300",
                "[&[data-state=open]]:bg-background-300 text-foreground-300",
                "hover:text-foreground-200 rounded",
              )}
              wedgeIconSize="sm"
            >
              <p className="text-xs text-foreground-100">{attribute.name}</p>
              <span className="text-xs text-foreground-300 group-hover:text-foreground-200 transition-colors">
                {attribute.valueCount}
              </span>
            </AccordionTrigger>
          </div>
          <AccordionContent className="pt-2 gap-2">
            <AttributeSearch
              attributeName={attribute.name}
              initialValue={attribute.search}
              onSearchChange={onSearchChange}
            />
            <div className="flex flex-col gap-px">
              {attribute.isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <SpinnerIcon className="w-4 h-4 animate-spin text-foreground-300" />
                </div>
              ) : sortedProperties.length === 0 ? (
                <MarketplacePropertyEmpty />
              ) : (
                sortedProperties.map(({ property, count, isActive }) => (
                  <PropertyItem
                    key={property}
                    attributeName={attribute.name}
                    property={property}
                    count={count}
                    isActive={isActive}
                    onToggle={onToggleProperty}
                  />
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  },
);

AttributeSection.displayName = "AttributeSection";
