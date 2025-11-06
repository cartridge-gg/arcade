import { forwardRef } from "react";

import type { ComponentPropsWithoutRef } from "react";
import type { VariantProps } from "class-variance-authority";

import { cva } from "class-variance-authority";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  MarketplaceFilters,
  MarketplaceHeader,
  MarketplaceHeaderReset,
  MarketplacePropertyEmpty,
  MarketplacePropertyFilter,
  MarketplaceRadialItem,
  MarketplaceSearchEngine,
  cn,
} from "@cartridge/ui";

export interface MarketplaceFilterPropertyView {
  property: string;
  count: number;
  order: number;
  isActive: boolean;
}

export interface MarketplaceFilterAttributeView {
  name: string;
  properties: MarketplaceFilterPropertyView[];
  search: string;
}

interface MarketplaceFiltersViewProps {
  statusFilter: "all" | "listed";
  onStatusChange: (value: "all" | "listed") => void;
  attributes: MarketplaceFilterAttributeView[];
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onToggleProperty: (
    attribute: string,
    property: string,
    enabled: boolean,
  ) => void;
  onSearchChange: (attribute: string, value: string) => void;
}

export const MarketplaceFiltersView = ({
  statusFilter,
  onStatusChange,
  attributes,
  hasActiveFilters,
  onClearAll,
  onToggleProperty,
  onSearchChange,
}: MarketplaceFiltersViewProps) => {
  return (
    <MarketplaceFilters className="h-full w-[calc(100vw-64px)] max-w-[360px] lg:flex lg:min-w-[360px] overflow-hidden rounded-none lg:rounded-xl">
      <MarketplaceHeader label="Status" />
      <div className="flex flex-col gap-2 w-fit">
        <MarketplaceRadialItem
          label="Buy Now"
          active={statusFilter === "listed"}
          onClick={() => onStatusChange("listed")}
        />
        <MarketplaceRadialItem
          label="Show All"
          active={statusFilter === "all"}
          onClick={() => onStatusChange("all")}
        />
      </div>
      <MarketplaceHeader label="Properties">
        {hasActiveFilters && <MarketplaceHeaderReset onClick={onClearAll} />}
      </MarketplaceHeader>
      <div
        className="h-full flex flex-col gap-2 overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        {attributes.length === 0 ? (
          <MarketplaceFiltersEmptyState />
        ) : (
          attributes.map((attribute) => {
            const hasActiveProperty = attribute.properties.some(
              (prop) => prop.isActive,
            );

            return (
              <MarketplacePropertySection
                key={`${attribute.name}-${hasActiveProperty ? "open" : "closed"}`}
                label={attribute.name}
                count={attribute.properties.length}
                defaultOpen={hasActiveProperty}
              >
                <MarketplaceSearchEngine
                  variant="darkest"
                  search={attribute.search}
                  setSearch={(value: string) =>
                    onSearchChange(attribute.name, value)
                  }
                />
                <div className="flex flex-col gap-px">
                  {attribute.properties
                    .sort((a, b) => b.order - a.order)
                    .map(({ property, count, isActive }) => (
                      <MarketplacePropertyFilter
                        key={`${attribute.name}-${property}`}
                        label={property}
                        count={count}
                        disabled={count === 0 && !isActive}
                        value={isActive}
                        setValue={(enabled: boolean) =>
                          onToggleProperty(attribute.name, property, enabled)
                        }
                      />
                    ))}
                  {attribute.properties.length === 0 && (
                    <MarketplacePropertyEmpty />
                  )}
                </div>
              </MarketplacePropertySection>
            );
          })
        )}
      </div>
    </MarketplaceFilters>
  );
};

export const MarketplaceFiltersEmptyState = () => {
  return <MarketplacePropertyEmpty />;
};

interface MarketplacePropertySectionProps {
  label: string;
  count: number;
  defaultOpen: boolean;
}

const marketplacePropertyHeaderVariants = cva("h-9 cursor-pointer", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BaseSectionProps = ComponentPropsWithoutRef<"div">;

const MarketplacePropertySection = forwardRef<
  HTMLDivElement,
  MarketplacePropertySectionProps &
    BaseSectionProps &
    VariantProps<typeof marketplacePropertyHeaderVariants>
>(
  (
    { label, count, defaultOpen, className, variant, children, ...rest },
    ref,
  ) => (
    <Accordion
      ref={ref}
      type="single"
      collapsible
      // @ts-expect-error this is a string | undefined type
      defaultValue={defaultOpen ? "item-1" : undefined}
      {...rest}
    >
      <AccordionItem value="item-1">
        <div
          className={cn(
            marketplacePropertyHeaderVariants({ variant }),
            className,
          )}
        >
          <AccordionTrigger
            className="grow pr-2 flex justify-between items-center"
            parentClassName={cn(
              "group px-3 py-2 bg-background-200 hover:bg-background-300",
              "[&[data-state=open]]:bg-background-300 text-foreground-300",
              "hover:text-foreground-200 rounded",
            )}
            wedgeIconSize="sm"
          >
            <p className="text-xs text-foreground-100">{label}</p>
            <span className="text-xs text-foreground-300 group-hover:text-foreground-200 transition-colors">
              {count}
            </span>
          </AccordionTrigger>
        </div>
        <AccordionContent className="pt-2 gap-2">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
);

MarketplacePropertySection.displayName = "MarketplacePropertySection";
