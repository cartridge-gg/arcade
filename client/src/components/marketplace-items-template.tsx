import { type ReactNode, useMemo } from "react";
import { MarketplaceFiltersContainer } from "@/features/marketplace/filters";
import { cn } from "@cartridge/ui/utils";
import { useProject } from "@/hooks/project";
import { useDevice } from "@/hooks/device";
import { UserCard } from "./user/user-card";
import arcade from "@/assets/arcade-logo.png";
import { Socials } from "@cartridge/arcade";
import { NavigationContainer } from "@/features/navigation";
import { CollectionHeader } from "./ui/marketplace/items/CollectionHeader";
import { BaseTemplate } from "./base-template";

interface MarketplaceItemsTemplateProps {
  children: ReactNode;
}

export function MarketplaceItemsTemplate({
  children,
}: MarketplaceItemsTemplateProps) {
  const { player, game, edition, collection } = useProject();
  const { isMobile } = useDevice();

  const socials = useMemo(() => {
    return Socials.merge(edition?.socials, game?.socials);
  }, [edition, game]);

  const isDashboard = !(edition && game);

  return (
    <BaseTemplate
      outerClassName="overflow-y-scroll"
      sidebarContent={
        <>
          {!isMobile && <UserCard />}
          <div className="flex-1 overflow-hidden">
            <MarketplaceFiltersContainer />
          </div>
        </>
      }
      contentClassName={cn(
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-y-scroll",
        player &&
          "bg-background-125 shadow-[0px_0px_8px_0px_rgba(15,20,16,_0.50)]",
      )}
    >
      <CollectionHeader
        isDashboard={isDashboard}
        isMobile={isMobile}
        arcade={arcade}
        edition={edition}
        game={game}
        socials={socials}
        collectionAddress={collection ?? "0x0"}
      />
      <NavigationContainer />
      {children}
    </BaseTemplate>
  );
}
