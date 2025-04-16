import { LayoutContent, useMediaQuery } from "@cartridge/ui-next";
import { useMemo } from "react";
import { Trophies } from "./trophies";
import { useArcade } from "@/hooks/arcade";
import { GameModel } from "@bal7hazar/arcade-sdk";
import { getChecksumAddress } from "starknet";
import { useAchievements } from "@/hooks/achievements";
import { Item } from "@/helpers/achievements";
import banner from "@/assets/banner.png";
import {
  AchievementsComingSoon,
  AchievementsError,
  AchievementsLoading,
} from "../errors";
import AchievementSummary from "../modules/summary";
import { useAddress } from "@/hooks/address";

export function Achievements({ game }: { game?: GameModel }) {
  const { address, isSelf } = useAddress();
  const { achievements, players, isLoading, isError } = useAchievements();
  const { pins, games } = useArcade();

  const isMobile = useMediaQuery("(max-width: 1024px)");

  const gamePlayers = useMemo(() => {
    return players[game?.config.project || ""] || [];
  }, [players, game]);

  const gameAchievements = useMemo(() => {
    return achievements[game?.config.project || ""] || [];
  }, [achievements, game]);

  const { pinneds } = useMemo(() => {
    const ids = pins[getChecksumAddress(address)] || [];
    const pinneds = gameAchievements
      .filter(
        (item) => item.completed && (ids.length === 0 || ids.includes(item.id)),
      )
      .sort((a, b) => a.id.localeCompare(b.id))
      .sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage))
      .slice(0, 3); // There is a front-end limit of 3 pinneds
    return { pinneds };
  }, [gameAchievements, pins, address, self]);

  const { points: gamePoints } = useMemo(() => {
    const points =
      gamePlayers.find((player) => BigInt(player.address) === BigInt(address))
        ?.earnings || 0;
    return { points };
  }, [address, gamePlayers]);

  const filteredGames = useMemo(() => {
    return !game ? games : [game];
  }, [games, game]);

  if (isError) return <AchievementsError />;

  if (isLoading) return <AchievementsLoading />;

  if (
    (!!game && gameAchievements.length === 0) ||
    Object.values(achievements).length === 0
  ) {
    return <AchievementsComingSoon />;
  }

  return (
    <LayoutContent className="gap-y-6 select-none h-full overflow-clip p-0">
      <div className="h-full flex flex-col justify-between gap-y-6">
        <div
          className="p-0 mt-0 overflow-y-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex flex-col gap-3 lg:gap-4 py-3 lg:py-6">
            <div className="flex flex-col gap-y-3 lg:gap-y-4">
              {filteredGames.map((item, index) => (
                <GameRow
                  key={index}
                  address={address}
                  game={item}
                  achievements={achievements}
                  pins={pins}
                  background={filteredGames.length > 1}
                  header={!game || isMobile}
                  variant={!game ? "default" : "dark"}
                />
              ))}
            </div>

            {game && (
              <Trophies
                address={address}
                achievements={gameAchievements}
                softview={!isSelf}
                enabled={pinneds.length < 3}
                game={game}
                pins={pins}
                earnings={gamePoints}
              />
            )}
          </div>
        </div>
      </div>
    </LayoutContent>
  );
}

export function GameRow({
  address,
  game,
  achievements,
  pins,
  background,
  header,
  variant,
}: {
  address: string;
  game: GameModel;
  achievements: { [game: string]: Item[] };
  pins: { [playerId: string]: string[] };
  background: boolean;
  header: boolean;
  variant: "default" | "dark";
}) {
  const gameAchievements = useMemo(() => {
    return achievements[game?.config.project || ""] || [];
  }, [achievements, game]);

  const { pinneds } = useMemo(() => {
    const ids = pins[getChecksumAddress(address)] || [];
    const pinneds = gameAchievements
      .filter(
        (item) => item.completed && (ids.length === 0 || ids.includes(item.id)),
      )
      .sort((a, b) => a.id.localeCompare(b.id))
      .sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage))
      .slice(0, 3); // There is a front-end limit of 3 pinneds
    return { pinneds };
  }, [gameAchievements, pins, address, self]);

  const summaryProps = useMemo(() => {
    return {
      achievements: gameAchievements.map((achievement) => {
        return {
          id: achievement.id,
          content: {
            points: achievement.earning,
            difficulty: parseFloat(achievement.percentage),
            hidden: achievement.hidden,
            icon: achievement.icon,
            tasks: achievement.tasks,
            timestamp: achievement.timestamp,
          },
          pin: {
            pinned: pinneds.some(
              (pinneds) =>
                pinneds.id === achievement.id && achievement.completed,
            ),
          },
        };
      }),
      metadata: {
        name: game?.metadata.name || "Game",
        logo: game?.metadata.image,
        cover: background ? game?.metadata.banner : banner,
      },
      socials: { ...game?.socials },
    };
  }, [gameAchievements, game, pinneds, background]);

  return (
    <div className="rounded-lg overflow-hidden">
      <AchievementSummary
        {...summaryProps}
        variant={variant}
        active
        header={header}
        color={game.metadata.color}
      />
    </div>
  );
}
