import { type ReactNode, useMemo } from "react";
import { GamesContainer } from "@/features/games";
import { useProject } from "@/hooks/project";
import { useDevice } from "@/hooks/device";
import { UserCard } from "./user/user-card";
import arcade from "@/assets/arcade-logo.png";
import { Socials } from "@cartridge/arcade";
import { GameHeader } from "./ui/games/GameHeader";
import { NavigationContainer } from "@/features/navigation";
import { ViewingAsPlayerBannerInformation } from "./user/viewing-as-player";
import { BaseTemplate } from "./base-template";

interface TemplateProps {
  children: ReactNode;
}

export function Template({ children }: TemplateProps) {
  const { game, edition } = useProject();
  const { isMobile } = useDevice();

  const socials = useMemo(() => {
    return Socials.merge(edition?.socials, game?.socials);
  }, [edition, game]);

  const isDashboard = !(edition && game);

  return (
    <BaseTemplate
      outerClassName="overflow-y-scroll"
      contentClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-y-scroll"
      sidebarContent={
        <>
          {!isMobile && <UserCard />}
          <div className="flex-1 overflow-hidden">
            <GamesContainer />
          </div>
        </>
      }
      headerContent={
        <>
          <ViewingAsPlayerBannerInformation />
          <GameHeader
            isDashboard={isDashboard}
            isMobile={isMobile}
            arcade={arcade}
            edition={edition}
            game={game}
            socials={socials}
          />
          <NavigationContainer />
        </>
      }
    >
      {children}
    </BaseTemplate>
  );
}
