import { Thumbnail } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { EditionsContainer } from "@/features/editions";
import { GameSocialWebsite } from "@/components/ui/modules/game-social";
import type { GameModel, EditionModel, Socials } from "@cartridge/arcade";
import { ContextCloser } from "../modules/context-closer";
import { useTheme } from "@/hooks/context";
import { useEffect, useMemo, useState } from "react";
import banner from "@/assets/banner.png";

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
  const { cover } = useTheme();
  const targetBanner = useMemo(() => cover ?? banner, [cover]);

  const [currentBanner, setCurrentBanner] = useState<string>(banner);
  const [transitioningOut, setTransitioningOut] = useState(false);
  const [transitioningIn, setTransitioningIn] = useState(false);

  useEffect(() => {
    if (targetBanner !== currentBanner) {
      setTransitioningOut(true);

      const timeoutOut = setTimeout(() => {
        setCurrentBanner(targetBanner);
        setTransitioningOut(false);
        setTransitioningIn(true);

        const timeoutIn = setTimeout(() => {
          setTransitioningIn(false);
        }, 100);

        return () => clearTimeout(timeoutIn);
      }, 100);

      return () => clearTimeout(timeoutOut);
    }
  }, [targetBanner, currentBanner]);

  if (isDashboard) return null;

  return (
    <div
      className={cn(
        "w-full flex flex-col gap-4 lg:p-4 lg:mb-6 lg:border lg:border-background-200 lg:rounded-lg bg-background-125 order-1 lg:order-1",
        isDashboard ? "p-0" : "p-4",
        "relative",
      )}
    >
      <div
        className={cn(
          "hidden lg:block", // only show on large screens
          "absolute top-0 left-0 inset-0 bg-no-repeat bg-cover bg-top transition-all duration-100 opacity-[0.16] rounded-lg",
          transitioningOut ? "blur-[256px] grayscale" : "",
          transitioningIn ? "blur-0 grayscale-0" : "",
        )}
        style={{
          backgroundImage: `linear-gradient(to top, var(--background-100) 0%, transparent 100%), url(${currentBanner})`,
          zIndex: 0,
        }}
      />
      <div className="relative flex flex-col gap-4 border border-background-200 rounded-lg p-4 lg:border-none lg:p-0 z-10">
        <div
          className={cn(
            "block: lg:hidden", // only show on mobile screens
            "absolute top-0 left-0 inset-0 bg-no-repeat bg-cover bg-top transition-all duration-100 opacity-[0.16] rounded-lg",
            transitioningOut ? "blur-[256px] grayscale" : "",
            transitioningIn ? "blur-0 grayscale-0" : "",
          )}
          style={{
            backgroundImage: `linear-gradient(to top, var(--background-100) 0%, transparent 100%), url(${currentBanner})`,
            zIndex: 0,
          }}
        />
        <div className="flex items-start justify-between pr-9">
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
      <div className="absolute top-5 right-5 z-10">
        <ContextCloser
          className="rounded-none rounded-bl rounded-tr-lg bg-background-125 hover:bg-background-200 p-2 w-8 h-8 border-r-0 border-t-0"
          context="game"
        />
      </div>
    </div>
  );
}
