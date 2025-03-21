import { useSearchParams } from "react-router-dom";
import { LayoutContent, AchievementSummary } from "@cartridge/ui-next";
import { useMemo } from "react";
import { Trophies } from "./trophies";
import { useArcade } from "@/hooks/arcade";
import { GameModel } from "@bal7hazar/arcade-sdk";
import { addAddressPadding } from "starknet";
import { useAchievements } from "@/hooks/achievements";
import { useAccount } from "@starknet-react/core";
import { Item } from "@/helpers/achievements";
import banner from "@/assets/banner.svg";
import { AchievementsError, AchievementsLoading } from "../errors";

export function Achievements({ game }: { game?: GameModel }) {
  const { address: self } = useAccount();
  const { achievements, players, isLoading, isError } = useAchievements();
  const { pins, games } = useArcade();

  const gamePlayers = useMemo(() => {
    return players[game?.project || ""] || [];
  }, [players, game]);

  const gameAchievements = useMemo(() => {
    return achievements[game?.project || ""] || [];
  }, [achievements, game]);

  const [searchParams] = useSearchParams();
  const address = useMemo(() => {
    return searchParams.get("address") || self || "0x0";
  }, [searchParams, self]);

  const { pinneds } = useMemo(() => {
    const ids = pins[addAddressPadding(address || self || "0x0")] || [];
    const pinneds = gameAchievements
      .filter((item) => ids.includes(item.id))
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

  const isSelf = useMemo(() => {
    return !searchParams.get("address") || address === self;
  }, [searchParams, self]);

  const filteredGames = useMemo(() => {
    return !game ? games : [game];
  }, [games, game]);

  if (isError) return <AchievementsError />;

  if (isLoading) return <AchievementsLoading />;

  if (
    (!!game && gameAchievements.length === 0) ||
    Object.values(achievements).length === 0
  ) {
    return (
      <div className="flex justify-center items-center h-full border border-dashed rounded-md border-background-400 mb-4">
        <p className="text-foreground-400">No trophies available</p>
      </div>
    );
  }

  return (
    <LayoutContent className="gap-y-6 select-none h-full overflow-clip p-0">
      <div className="h-full flex flex-col justify-between gap-y-6">
        <div
          className="p-0 mt-0 pb-6 overflow-y-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-y-6">
              {filteredGames.map((item, index) => (
                <GameRow
                  key={index}
                  address={address}
                  game={item}
                  achievements={achievements}
                  pins={pins}
                  variant={!game ? "default" : "faded"}
                />
              ))}
            </div>

            {game && (
              <Trophies
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
  variant,
}: {
  address: string;
  game: GameModel;
  achievements: { [game: string]: Item[] };
  pins: { [playerId: string]: string[] };
  variant: "default" | "faded";
}) {
  const gameAchievements = useMemo(() => {
    return achievements[game?.project || ""] || [];
  }, [achievements, game]);

  const { pinneds } = useMemo(() => {
    const ids = pins[addAddressPadding(address)] || [];
    const pinneds = gameAchievements
      .filter((item) => ids.includes(item.id))
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
        cover: banner,
      },
      socials: { ...game?.socials },
    };
  }, [gameAchievements, game, pinneds]);

  return (
    <AchievementSummary
      {...summaryProps}
      variant={variant}
      active
      color={game.metadata.color}
    />
  );
}
