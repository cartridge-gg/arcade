import { Thumbnail } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { EditionsContainer } from "@/features/editions";
import { GameSocialWebsite } from "@/components/ui/modules/game-social";
import type { GameModel, EditionModel, Socials } from "@cartridge/arcade";
import { ContextCloser } from "../modules/context-closer";

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
        "w-full flex flex-col gap-4 lg:p-4 lg:mb-6  lg:border lg:border-background-200 lg:rounded-lg bg-background-125 order-1 lg:order-1",
        isDashboard ? "p-0" : "p-4",
        "relative",
      )}
    >
      <div className="flex flex-col gap-4 border border-background-200 rounded-lg p-4 lg:border-none lg:p-0">
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
            <div className="flex flex-row gap-2 items-center self-end lg:self-start">
              <GameSocialWebsite website={socials?.website || ""} label />
            </div>
          ) : null}
        </div>
      </div>
      <ContextCloser variant={"rounded-muted"} context="game" />
    </div>
  );
}
