import { useMemo } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { getChecksumAddress } from "starknet";
import { toast } from "sonner";
import { useAccount } from "@starknet-react/core";
import type ControllerConnector from "@cartridge/connector/controller";
import { Socials, type EditionModel, type GameModel } from "@cartridge/arcade";
import { useAddress } from "@/hooks/address";
import { useAchievements } from "@/hooks/achievements";
import { useArcade } from "@/hooks/arcade";
import { useOwnerships } from "@/hooks/ownerships";
import { useAnalytics } from "@/hooks/useAnalytics";
import { joinPaths } from "@/lib/helpers";
import banner from "@/assets/banner.png";
import type { Item } from "@/lib/achievements";
import type { AchievementSummaryProps } from "@/components/ui/modules/summary";

export interface AchievementSummaryCardView {
  id: string;
  variant: AchievementSummaryProps["variant"];
  header: boolean;
  achievements: AchievementSummaryProps["achievements"];
  metadata: AchievementSummaryProps["metadata"];
  socials?: AchievementSummaryProps["socials"];
  active: boolean;
  color?: string;
  onClick?: () => void;
}

export interface TrophyShareView {
  website?: string;
  twitter?: string;
  timestamp?: number;
  points: number;
  difficulty: number;
  title: string;
  onShare: () => void;
}

export interface TrophyPinView {
  pinned: boolean;
  enabled: boolean;
  onPin: (
    pinned: boolean,
    setLoading: (loading: boolean) => void,
  ) => Promise<void>;
}

export interface TrophyAchievementView {
  id: string;
  index: number;
  completed: boolean;
  content: {
    points: number;
    difficulty: number;
    hidden: boolean;
    icon?: string;
    title: string;
    description?: string;
    tasks?: Item["tasks"];
    timestamp?: number;
  };
  share?: TrophyShareView;
  pin?: TrophyPinView;
}

export interface TrophyGroupView {
  name: string;
  items: TrophyAchievementView[];
}

export interface TrophiesViewModel {
  groups: TrophyGroupView[];
  softView: boolean;
  enabled: boolean;
}

export interface AchievementsViewModel {
  status: "loading" | "error" | "empty" | "success";
  summaryCards: AchievementSummaryCardView[];
  showTrophies: boolean;
  trophies?: TrophiesViewModel;
  multiEdition: boolean;
}

interface UseAchievementsViewModelArgs {
  game?: GameModel;
  edition?: EditionModel;
  isMobile: boolean;
}

const HIDDEN_GROUP = "Hidden";
const MAX_PINNEDS = 3;

export function useAchievementsViewModel({
  game,
  edition,
  isMobile,
}: UseAchievementsViewModelArgs): AchievementsViewModel {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const { address, isSelf } = useAddress();
  const normalizedAddress = address ? getChecksumAddress(address) : "";
  const { achievements, players, isLoading, isError } = useAchievements();
  const arcade = useArcade();
  const { pins, games, editions, provider } = arcade;
  const { ownerships } = useOwnerships();
  const { connector, account } = useAccount();
  const social = provider.social;
  const { trackEvent, events } = useAnalytics();

  const playerPins = useMemo(() => {
    if (!address) return [];
    return (
      pins[normalizedAddress] ??
      pins[address] ??
      pins[address.toLowerCase()] ??
      []
    );
  }, [pins, normalizedAddress, address]);

  const filteredEditions = useMemo(() => {
    return edition ? [edition] : editions;
  }, [edition, editions]);

  const certifiedMap = useMemo(() => {
    if (!game) return {} as Record<string, boolean>;
    const gameOwnership = ownerships.find(
      (ownership) => ownership.tokenId === BigInt(game.id),
    );
    if (!gameOwnership) return {} as Record<string, boolean>;
    const result: Record<string, boolean> = {};
    filteredEditions
      .filter((item) => item.gameId === game.id)
      .forEach((item) => {
        const ownership = ownerships.find(
          (candidate) => candidate.tokenId === BigInt(item.id),
        );
        if (!ownership) return;
        result[item.id] =
          gameOwnership.accountAddress === ownership.accountAddress;
      });
    return result;
  }, [game, ownerships, filteredEditions]);

  const dataByProject = useMemo(() => {
    return filteredEditions.map((item) => {
      const projectKey = item.config.project || "";
      const items = achievements[projectKey] || [];
      const projectPlayers = players[projectKey] || [];
      const projectGame = game || games.find((g) => g.id === item.gameId);
      return {
        edition: item,
        achievements: items,
        players: projectPlayers,
        game: projectGame,
      };
    });
  }, [filteredEditions, achievements, players, game, games]);

  const hasAchievements = useMemo(() => {
    if (edition) {
      return (achievements[edition.config.project || ""] || []).length > 0;
    }
    return Object.values(achievements).some((value) => value.length > 0);
  }, [achievements, edition]);

  const summaryCards = useMemo(() => {
    return dataByProject.map(
      ({ edition: currentEdition, achievements: items, game: projectGame }) => {
        const pinneds = items
          .filter(
            (item) =>
              item.completed &&
              (playerPins.length === 0 || playerPins.includes(item.id)),
          )
          .sort((a, b) => a.id.localeCompare(b.id))
          .sort(
            (a, b) =>
              Number.parseFloat(a.percentage) - Number.parseFloat(b.percentage),
          )
          .slice(0, MAX_PINNEDS);

        const achievementsForSummary = items.map((achievement) => ({
          id: achievement.id,
          content: {
            points: achievement.earning,
            difficulty: Number.parseFloat(achievement.percentage),
            hidden: achievement.hidden,
            icon: achievement.icon,
            tasks: achievement.tasks,
            timestamp: achievement.timestamp,
            title: achievement.title,
          },
          pin: {
            pinned: pinneds.some(
              (pinned) => pinned.id === achievement.id && achievement.completed,
            ),
          },
        }));

        const metadata = {
          game: projectGame?.name || "Game",
          edition: currentEdition.name || "Main",
          logo: currentEdition.properties.icon,
          cover:
            filteredEditions.length > 1
              ? currentEdition.properties.banner || banner
              : currentEdition.properties.banner || banner,
          certified: !!certifiedMap[currentEdition.id],
        } satisfies AchievementSummaryProps["metadata"];

        const socials = Socials.merge(
          projectGame?.socials,
          currentEdition.socials,
        );
        const variant = edition ? "dark" : "default";
        const header = !edition || isMobile;

        const onClick =
          !projectGame || !currentEdition
            ? undefined
            : () => {
                let pathname = location.pathname;
                const gameSegment = `${String(
                  projectGame.name || projectGame.id,
                )
                  .toLowerCase()
                  .replace(/ /g, "-")}`;
                const editionSegment = `${String(
                  currentEdition.name || currentEdition.id,
                )
                  .toLowerCase()
                  .replace(/ /g, "-")}`;
                pathname = pathname.replace(/\/game\/[^/]+/, "");
                pathname = pathname.replace(/\/edition\/[^/]+/, "");
                if (projectGame.id !== 0) {
                  pathname = joinPaths(
                    `/game/${gameSegment}/edition/${editionSegment}`,
                    pathname,
                  );
                }
                navigate({ to: pathname || "/" });
              };

        return {
          id: currentEdition.id.toString(),
          achievements: achievementsForSummary,
          metadata,
          socials,
          variant,
          header,
          active: true,
          color: currentEdition.color,
          onClick,
        } satisfies AchievementSummaryCardView;
      },
    );
  }, [
    dataByProject,
    playerPins,
    normalizedAddress,
    filteredEditions.length,
    certifiedMap,
    edition,
    isMobile,
    location.pathname,
    navigate,
  ]);

  const trophies = useMemo(() => {
    if (!edition) return undefined;
    const projectKey = edition.config.project || "";
    const items = achievements[projectKey] || [];
    if (items.length === 0) return undefined;

    const socials = Socials.merge(game?.socials, edition.socials);
    const enabled = playerPins.length < MAX_PINNEDS;

    const handlePin = async (
      currentPinned: boolean,
      achievementId: string,
      achievementName: string,
      setLoading: (loading: boolean) => void,
    ) => {
      if (!account || (!enabled && !currentPinned)) return;
      const controller = (connector as ControllerConnector)?.controller;
      if (!controller) return;
      setLoading(true);
      try {
        const calls = currentPinned
          ? social.unpin({ achievementId })
          : social.pin({ achievementId });
        const result = await account.execute(calls);
        if (result) {
          trackEvent(
            currentPinned
              ? events.ACHIEVEMENT_UNPINNED
              : events.ACHIEVEMENT_PINNED,
            {
              achievement_id: achievementId,
              achievement_name: achievementName,
              achievement_game: edition.name,
            },
          );
          toast.success(
            `Trophy ${currentPinned ? "unpinned" : "pinned"} successfully`,
          );
        }
      } catch (error) {
        console.error(error);
        toast.error(`Failed to ${currentPinned ? "unpin" : "pin"} trophy`);
      } finally {
        setLoading(false);
      }
    };

    const groupsMap: Record<string, Item[]> = {};
    items.forEach((item) => {
      const groupName =
        item.hidden && !item.completed ? HIDDEN_GROUP : item.group;
      groupsMap[groupName] = groupsMap[groupName] || [];
      groupsMap[groupName].push(item);
    });

    const sortGroupItems = (groupItems: Item[]) =>
      [...groupItems]
        .sort((a, b) => a.id.localeCompare(b.id))
        .sort((a, b) => a.index - b.index);

    const groups: TrophyGroupView[] = Object.entries(groupsMap)
      .map(([groupName, items]) => {
        const sortedItems =
          groupName === HIDDEN_GROUP
            ? [...items].sort((a, b) => a.earning - b.earning)
            : sortGroupItems(items);

        const achievementsForGroup: TrophyAchievementView[] = sortedItems.map(
          (item) => {
            const completed = item.completed;
            const content = {
              points: item.earning,
              difficulty: Number.parseFloat(item.percentage),
              hidden: item.hidden,
              icon: item.hidden && !completed ? undefined : item.icon,
              title: item.title,
              description: item.description,
              tasks: item.tasks,
              timestamp: completed ? item.timestamp : undefined,
            };

            const share =
              isSelf || !completed || !socials.website || !socials.twitter
                ? undefined
                : ({
                    website: socials.website,
                    twitter: socials.twitter,
                    timestamp: item.timestamp,
                    points: item.earning,
                    difficulty: Number.parseFloat(item.percentage),
                    title: item.title,
                    onShare: () => {
                      trackEvent(events.ACHIEVEMENT_SHARED, {
                        achievement_id: item.id,
                        achievement_name: item.title,
                        achievement_game: edition.name,
                        social_platform: "twitter",
                      });
                    },
                  } satisfies TrophyShareView);

            const pin =
              isSelf && completed
                ? {
                    pinned: playerPins.includes(item.id),
                    enabled,
                    onPin: async (
                      currentPinned: boolean,
                      setLoading: (loading: boolean) => void,
                    ) =>
                      handlePin(currentPinned, item.id, item.title, setLoading),
                  }
                : undefined;

            return {
              id: item.id,
              index: item.index,
              completed,
              content,
              share,
              pin,
            } satisfies TrophyAchievementView;
          },
        );

        return {
          name: groupName,
          items: achievementsForGroup,
        } satisfies TrophyGroupView;
      })
      .sort((a, b) =>
        a.name === HIDDEN_GROUP
          ? 1
          : b.name === HIDDEN_GROUP
            ? -1
            : a.name.localeCompare(b.name),
      );

    return {
      groups,
      softView: !isSelf,
      enabled,
    } satisfies TrophiesViewModel;
  }, [
    edition,
    achievements,
    game,
    playerPins,
    account,
    connector,
    social,
    trackEvent,
    events,
    isSelf,
  ]);

  const status: AchievementsViewModel["status"] = isError
    ? "error"
    : isLoading
      ? "loading"
      : !hasAchievements
        ? "empty"
        : "success";

  return {
    status,
    summaryCards,
    showTrophies: Boolean(edition),
    trophies,
    multiEdition: !edition,
  };
}
