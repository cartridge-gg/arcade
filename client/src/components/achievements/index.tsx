import { LayoutContent, useMediaQuery } from "@cartridge/ui-next";
import { useMemo } from "react";
import { Trophies } from "./trophies";
import { useArcade } from "@/hooks/arcade";
import { EditionModel, GameModel, Socials } from "@bal7hazar/arcade-sdk";
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
import { useNavigate } from "react-router-dom";

export function Achievements({
  game,
  edition,
}: {
  game?: GameModel;
  edition?: EditionModel;
}) {
  const { address, isSelf } = useAddress();
  const { achievements, players, isLoading, isError } = useAchievements();
  const { pins, editions } = useArcade();

  const isMobile = useMediaQuery("(max-width: 1024px)");

  const gamePlayers = useMemo(() => {
    return players[edition?.config.project || ""] || [];
  }, [players, edition]);

  const gameAchievements = useMemo(() => {
    return achievements[edition?.config.project || ""] || [];
  }, [achievements, edition]);

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

  const filteredEditions = useMemo(() => {
    return !edition ? editions : [edition];
  }, [editions, edition]);

  const socials = useMemo(() => {
    return Socials.merge(game?.socials, edition?.socials);
  }, [game, edition]);

  if (isError) return <AchievementsError />;

  if (isLoading) return <AchievementsLoading />;

  if (
    (!!edition && gameAchievements.length === 0) ||
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
              {filteredEditions.map((item, index) => (
                <Row
                  key={index}
                  address={address}
                  edition={item}
                  achievements={achievements}
                  pins={pins}
                  background={filteredEditions.length > 1}
                  header={!edition || isMobile}
                  variant={!edition ? "default" : "dark"}
                />
              ))}
            </div>

            {edition && (
              <Trophies
                achievements={gameAchievements}
                softview={!isSelf}
                enabled={pinneds.length < 3}
                socials={socials}
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

export function Row({
  address,
  edition,
  achievements,
  pins,
  background,
  header,
  variant,
}: {
  address: string;
  edition: EditionModel;
  achievements: { [edition: string]: Item[] };
  pins: { [playerId: string]: string[] };
  background: boolean;
  header: boolean;
  variant: "default" | "dark";
}) {
  const gameAchievements = useMemo(() => {
    return achievements[edition?.config.project || ""] || [];
  }, [achievements, edition]);

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

  const navigate = useNavigate();
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
        name: edition?.name || "Game",
        logo: edition?.properties.icon,
        cover: background ? edition?.properties.banner : banner,
      },
      socials: { ...edition?.socials },
      onClick: () => {
        const url = new URL(window.location.href);
        url.searchParams.set("edition", edition.id.toString());
        navigate(url.toString().replace(window.location.origin, ""));
      },
    };
  }, [gameAchievements, edition, pinneds, background, navigate]);

  return (
    <div className="rounded-lg overflow-hidden">
      <AchievementSummary
        {...summaryProps}
        variant={variant}
        active
        header={header}
        color={edition.color}
      />
    </div>
  );
}
