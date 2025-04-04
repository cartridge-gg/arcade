import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutContent,
  AchievementLeaderboard,
  TabsContent,
} from "@cartridge/ui-next";
import { useCallback, useMemo } from "react";
import { useArcade } from "@/hooks/arcade";
import { GameModel } from "@bal7hazar/arcade-sdk";
import { addAddressPadding, getChecksumAddress } from "starknet";
import { useAchievements } from "@/hooks/achievements";
import {
  Connect,
  LeaderboardComingSoon,
  LeaderboardEmpty,
  LeaderboardError,
  LeaderboardLoading,
} from "../errors";
import AchievementLeaderboardRow from "../modules/leaderboard-row";
import { useAccount } from "@starknet-react/core";
import ArcadeSubTabs, { SubTabValue } from "../modules/sub-tabs";

export function Leaderboard({ game }: { game?: GameModel }) {
  const [searchParams] = useSearchParams();
  const { isConnected, address } = useAccount();
  const { achievements, globals, players, usernames, isLoading, isError } =
    useAchievements();
  const { pins, follows } = useArcade();

  const following = useMemo(() => {
    if (!address) return [];
    const addresses = follows[getChecksumAddress(address)] || [];
    if (addresses.length === 0) return [];
    return [...addresses, getChecksumAddress(address)];
  }, [follows, address]);

  const navigate = useNavigate();

  const gamePlayers = useMemo(() => {
    return players[game?.config.project || ""] || [];
  }, [players, game]);

  const gameAchievements = useMemo(() => {
    return achievements[game?.config.project || ""] || [];
  }, [achievements, game]);

  const handleClick = useCallback(
    (address: string) => {
      // On click, we update the url param address to the address of the player
      const url = new URL(window.location.href);
      url.searchParams.set("address", address);
      navigate(url.toString().replace(window.location.origin, ""));
    },
    [navigate],
  );

  const defaultValue = useMemo(() => {
    // Default tab is ignored if there is no address,
    // meanning the user is not connected and doesnt inspect another user
    return searchParams.get("subTab") || "all";
  }, [searchParams]);

  const handleTabClick = useCallback(
    (value: string) => {
      // Clicking on a tab updates the url param tab to the value of the tab
      // So the tab is persisted in the url and the user can update and share the url
      const url = new URL(window.location.href);
      url.searchParams.set("subTab", value);
      navigate(url.toString().replace(window.location.origin, ""));
    },
    [navigate],
  );

  const gameData = useMemo(() => {
    let rank = 0;
    const data = gamePlayers.map((player, index) => {
      if (BigInt(player.address) === BigInt(address || "0x0")) rank = index + 1;
      return {
        address: player.address,
        name:
          usernames[addAddressPadding(player.address)] ||
          player.address.slice(0, 9),
        rank: index + 1,
        points: player.earnings,
        highlight: BigInt(player.address) === BigInt(address || "0x0"),
        pins: pins[addAddressPadding(player.address)]
          ?.map((id) => {
            const achievement = gameAchievements.find((a) => a?.id === id);
            return achievement ? { id, icon: achievement.icon } : undefined;
          })
          .filter(Boolean) as { id: string; icon: string }[],
      };
    });
    if (rank <= 100) {
      return {
        all: data.slice(0, 100),
        following: data
          .filter((player) =>
            following.includes(getChecksumAddress(player.address)),
          )
          .slice(0, 100),
      };
    }
    const selfData = data.find(
      (player) => BigInt(player.address) === BigInt(address || "0x0"),
    );
    return selfData
      ? {
          all: [...data.slice(0, 99), selfData],
          following: [
            ...data
              .filter((player) =>
                following.includes(getChecksumAddress(player.address)),
              )
              .slice(0, 99),
            selfData,
          ],
        }
      : {
          all: data.slice(0, 100),
          following: data
            .filter((player) =>
              following.includes(getChecksumAddress(player.address)),
            )
            .slice(0, 100),
        };
  }, [gamePlayers, gameAchievements, address, pins, usernames, following]);

  const gamesData = useMemo(() => {
    let rank = 0;
    const data = globals.map((player, index) => {
      if (BigInt(player.address) === BigInt(address || "0x0")) rank = index + 1;
      return {
        address: player.address,
        name:
          usernames[addAddressPadding(player.address)] ||
          player.address.slice(0, 9),
        rank: index + 1,
        points: player.earnings,
        highlight: BigInt(player.address) === BigInt(address || "0x0"),
      };
    });
    if (rank <= 100) {
      return {
        all: data.slice(0, 100),
        following: data
          .filter((player) =>
            following.includes(getChecksumAddress(player.address)),
          )
          .slice(0, 100),
      };
    }
    const selfData =
      data.find(
        (player) => BigInt(player.address) === BigInt(address || "0x0"),
      ) || data[0];
    return {
      all: [...data.slice(0, 99), selfData],
      following: [...data.slice(0, 99), selfData].filter((player) =>
        following.includes(getChecksumAddress(player.address)),
      ),
    };
  }, [globals, address, usernames, following]);

  if (isError) return <LeaderboardError />;

  if (isLoading) return <LeaderboardLoading />;

  if (
    (!!game && gameAchievements.length === 0) ||
    Object.values(achievements).length === 0 ||
    (!game && gamesData.all.length === 0) ||
    (!!game && gameData.all.length === 0)
  ) {
    return <LeaderboardComingSoon />;
  }

  return (
    <LayoutContent className="select-none h-full overflow-clip p-0">
      <div
        className="p-0 py-4 mt-0 h-full overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        <ArcadeSubTabs
          tabs={["all", "following"]}
          defaultValue={defaultValue as SubTabValue}
          onTabClick={(tab: SubTabValue) => handleTabClick(tab)}
          className="mb-4"
        >
          <div
            className="flex justify-center gap-8 w-full h-full overflow-y-scroll"
            style={{ scrollbarWidth: "none" }}
          >
            <TabsContent className="p-0 mt-0 grow w-full" value="all">
              <AchievementLeaderboard className="h-full rounded">
                {!game
                  ? gamesData.all.map((item, index) => (
                      <AchievementLeaderboardRow
                        key={index}
                        pins={[]}
                        rank={item.rank}
                        name={item.name}
                        points={item.points}
                        highlight={item.highlight}
                        onClick={() => handleClick(item.address)}
                      />
                    ))
                  : gameData.all.map((item, index) => (
                      <AchievementLeaderboardRow
                        key={index}
                        pins={item.pins || []}
                        rank={item.rank}
                        name={item.name}
                        points={item.points}
                        highlight={item.highlight}
                        onClick={() => handleClick(item.address)}
                      />
                    ))}
              </AchievementLeaderboard>
            </TabsContent>
            <TabsContent className="p-0 mt-0 grow w-full" value="following">
              {!isConnected ? (
                <Connect />
              ) : following.length === 0 ? (
                <LeaderboardEmpty />
              ) : (
                <AchievementLeaderboard className="h-full rounded">
                  {!game
                    ? gamesData.following.map((item, index) => (
                        <AchievementLeaderboardRow
                          key={index}
                          pins={[]}
                          rank={item.rank}
                          name={item.name}
                          points={item.points}
                          highlight={item.highlight}
                          onClick={() => handleClick(item.address)}
                        />
                      ))
                    : gameData.following.map((item, index) => (
                        <AchievementLeaderboardRow
                          key={index}
                          pins={item.pins || []}
                          rank={item.rank}
                          name={item.name}
                          points={item.points}
                          highlight={item.highlight}
                          onClick={() => handleClick(item.address)}
                        />
                      ))}
                </AchievementLeaderboard>
              )}
            </TabsContent>
          </div>
        </ArcadeSubTabs>
      </div>
    </LayoutContent>
  );
}
