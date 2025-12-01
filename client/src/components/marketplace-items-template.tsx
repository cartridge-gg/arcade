import { type ReactNode, useMemo } from "react";
import { MarketplaceFiltersContainer } from "@/features/marketplace/filters";
import { HeaderContainer } from "@/features/header";
import { SceneLayout } from "@/components/scenes/layout";
import { cn } from "@cartridge/ui/utils";
import { useSidebar } from "@/hooks/sidebar";
import { useProject } from "@/hooks/project";
import { useTheme } from "@/hooks/context";
import { useDevice } from "@/hooks/device";
import { UserCard } from "./user/user-card";
import arcade from "@/assets/arcade-logo.png";
import { Socials } from "@cartridge/arcade";
import { NavigationContainer } from "@/features/navigation";
import { CollectionHeader } from "./ui/marketplace/items/CollectionHeader";

interface MarketplaceItemsTemplateProps {
  children: ReactNode;
}

export function MarketplaceItemsTemplate({
  children,
}: MarketplaceItemsTemplateProps) {
  useTheme();
  const { isOpen, handleTouchMove, handleTouchStart } = useSidebar();
  const { player, game, edition, collection } = useProject();

  const { isMobile } = useDevice();

  const socials = useMemo(() => {
    return Socials.merge(edition?.socials, game?.socials);
  }, [edition, game]);

  const isDashboard = !(edition && game);

  return (
    <SceneLayout>
      <div
        className={cn(
          "h-full w-full overflow-y-scroll lg:px-6 lg:py-5 lg:pt-0 ",
        )}
        style={{ scrollbarWidth: "none" }}
      >
        <div
          className={cn(
            "w-full px-0 gap-3 lg:gap-6 2xl:gap-10 flex items-stretch m-auto h-full",
            "transition-all duration-300 ease-in-out justify-center",
          )}
        >
          <div
            className={cn(
              "absolute inset-0 bg-transparent",
              !isOpen && "hidden",
            )}
          />

          <div
            className={cn(
              "lg:space-y-4 h-full flex flex-col",
              "fixed lg:relative left-0 w-[min(calc(100vw-64px),360px)]",
              "transition-all duration-300 ease-in-out",
              !isOpen && isMobile ? "-translate-x-full" : "translate-x-0",
            )}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {!isMobile && <UserCard />}
            <div className="flex-1 overflow-hidden">
              <MarketplaceFiltersContainer />
            </div>
          </div>

          <div
            className={cn(
              "fixed lg:relative h-full w-full flex flex-col overflow-hidden px-0 lg:pb-0",
              "transition-all duration-300 ease-in-out max-w-[1320px]",
              "pb-[79px] lg:pb-0",
              isOpen
                ? "translate-x-[min(calc(100vw-64px),360px)]"
                : "translate-x-0",
            )}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <div className="lg:hidden w-full p-3">
              <HeaderContainer />
            </div>
            <div
              className={cn(
                "relative grow h-full flex flex-col rounded-none lg:rounded-xl lg:gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-y-scroll border border-background-200 bg-background-100 p-3 lg:p-6 order-2 lg:order-3",
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
            </div>
          </div>
        </div>
      </div>
    </SceneLayout>
  );
}
