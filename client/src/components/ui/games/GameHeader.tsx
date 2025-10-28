import { Thumbnail } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { EditionsContainer } from "@/features/editions";
import { GameSocialWebsite } from "@/components/ui/modules/game-social";
import type { GameModel, EditionModel, Socials } from "@cartridge/arcade";

interface GameHeaderProps {
  isDashboard: boolean;
  isMobile: boolean;
  edition?: EditionModel;
  game?: GameModel;
  arcade: string;
  socials?: Socials;
}

export function GameHeader({
  isDashboard,
  isMobile,
  edition,
  game,
  arcade,
  socials,
}: GameHeaderProps) {
  if (isDashboard) return null;
  return (
    <div
      className={cn(
        "w-full flex flex-col gap-4 lg:p-4 border border-primary rounded-lg bg-background-200",
        isDashboard ? "p-0" : "p-4",
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex gap-4 items-center overflow-hidden",
            isDashboard && isMobile && "hidden",
          )}
        >
          <Thumbnail
            icon={edition?.properties.icon || game?.properties.icon || arcade}
            size="xl"
            className="min-w-16 min-h-16"
          />
          <div className="flex flex-col gap-2 overflow-hidden">
            <p className="font-semibold text-xl/[24px] text-foreground-100 truncate">
              {game?.name || "Dashboard"}
            </p>
            <EditionsContainer />
          </div>
        </div>
        {game ? (
          <div className=" hidden lg:block">
            <GameSocialWebsite website={socials?.website || ""} label />
          </div>
        ) : null}
      </div>
      {game ? (
        <div className="block lg:hidden">
          <GameSocialWebsite website={socials?.website || ""} label />
        </div>
      ) : null}
    </div>
  );
}
