import { Empty, LayoutContent, Skeleton, useMediaQuery } from "@cartridge/ui";
import { useMemo } from "react";
import { Trophies } from "./trophies";
import { useArcade } from "@/hooks/arcade";
import { EditionModel, GameModel, Socials } from "@cartridge/arcade";
import { getChecksumAddress } from "starknet";
import { useAchievements } from "@/hooks/achievements";
import { Item } from "@/helpers/achievements";
import banner from "@/assets/banner.png";
import AchievementSummary from "../modules/summary";
import { useAddress } from "@/hooks/address";
import { useLocation, useNavigate } from "react-router-dom";
import { joinPaths } from "@/helpers";
import { useOwnerships } from "@/hooks/ownerships";

export function Achievements({
  game,
  edition,
}: {
  game?: GameModel;
  edition?: EditionModel;
}) {
  const { address, isSelf } = useAddress();
  const { achievements, players, isLoading, isError } = useAchievements();
  const { pins, games, editions } = useArcade();
  const { ownerships } = useOwnerships();

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

  const gameEditions = useMemo(() => {
    if (!game) return [];
    return editions.filter((edition) => edition.gameId === game.id);
  }, [editions, game]);

  const certifieds: { [key: string]: boolean } = useMemo(() => {
    if (!game) return {};
    const gameOwnership = ownerships.find(
      (ownership) => ownership.tokenId === BigInt(game.id),
    );
    if (!gameOwnership) return {};
    const values: { [key: string]: boolean } = {};
    gameEditions.forEach((edition) => {
      const ownership = ownerships.find(
        (ownership) => ownership.tokenId === BigInt(edition.id),
      );
      if (!ownership) return;
      values[edition.id] =
        gameOwnership.accountAddress == ownership.accountAddress;
    });
    return values;
  }, [gameEditions, game]);

  if (isError) return <EmptyState />;

  if (isLoading) return <LoadingState multi={filteredEditions.length > 1} />;

  if (
    (!!edition && gameAchievements.length === 0) ||
    Object.values(achievements).length === 0
  ) {
    return <EmptyState />;
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
                  game={game || games.find((game) => game.id === item.gameId)}
                  certified={certifieds[item.id]}
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
  game,
  certified,
  variant,
}: {
  address: string;
  edition: EditionModel;
  achievements: { [edition: string]: Item[] };
  pins: { [playerId: string]: string[] };
  background: boolean;
  header: boolean;
  game?: GameModel;
  certified?: boolean;
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

  const location = useLocation();
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
        game: game?.name || "Game",
        edition: edition?.name || "Main",
        logo: edition?.properties.icon,
        cover: background ? edition?.properties.banner : banner,
        certified: !!certified,
      },
      socials: { ...edition?.socials },
      onClick: () => {
        if (!game || !edition) return;
        let pathname = location.pathname;
        const gameName = `${game?.name.toLowerCase().replace(/ /g, "-") || game.id}`;
        const editionName = `${edition?.name.toLowerCase().replace(/ /g, "-") || edition.id}`;
        pathname = pathname.replace(/\/game\/[^/]+/, "");
        pathname = pathname.replace(/\/edition\/[^/]+/, "");
        if (game.id !== 0) {
          pathname = joinPaths(
            `/game/${gameName}/edition/${editionName}`,
            pathname,
          );
        }
        navigate(pathname || "/");
      },
    };
  }, [
    gameAchievements,
    game,
    edition,
    pinneds,
    background,
    location,
    navigate,
  ]);

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

const LoadingState = ({ multi }: { multi?: boolean }) => {
  if (multi) {
    return (
      <div className="flex flex-col gap-y-3 lg:gap-y-4 overflow-hidden h-full py-3 lg:py-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="min-h-[99px] w-full rounded" />
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-y-3 lg:gap-y-4 overflow-hidden h-full py-3 lg:py-6">
      <Skeleton className="min-h-[97px] lg:min-h-10 w-full rounded" />
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className="min-h-[177px] w-full rounded" />
      ))}
    </div>
  );
};

const EmptyState = () => {
  return (
    <Empty
      title="No achievements exist for this game."
      icon="achievement"
      className="h-full py-3 lg:py-6"
    />
  );
};
