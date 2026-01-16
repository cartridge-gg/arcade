import type { ReactNode } from "react";
import { MarketplaceFiltersContainer } from "@/features/marketplace/filters";
import { cn } from "@cartridge/ui/utils";
import { useProject } from "@/hooks/project";
import { useDevice } from "@/hooks/device";
import { UserCard } from "./user/user-card";
import { NavigationContainer } from "@/features/navigation";
import { BaseTemplate } from "./base-template";

interface InventoryItemsTemplateProps {
  children: ReactNode;
}

export function InventoryItemsTemplate({
  children,
}: InventoryItemsTemplateProps) {
  const { player } = useProject();
  const { isMobile } = useDevice();

  return (
    <BaseTemplate
      contentClassName={cn(
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-y-scroll",
        player &&
          "bg-background-125 shadow-[0px_0px_8px_0px_rgba(15,20,16,_0.50)]",
      )}
      outerClassName="overflow-y-scroll"
      sidebarContent={
        <>
          {!isMobile && <UserCard />}
          <div className="flex-1 overflow-hidden">
            <MarketplaceFiltersContainer />
          </div>
        </>
      }
      headerContent={<NavigationContainer />}
    >
      {children}
    </BaseTemplate>
  );
}
