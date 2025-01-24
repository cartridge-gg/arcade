import { Spinner } from "@cartridge/ui-next";
import { TrophiesTab, LeaderboardTab } from "./tab";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Trophies } from "./trophies";
import { Leaderboard } from "./leaderboard";
import { useData } from "@/hooks/context";
import { useArcade } from "@/hooks/arcade";
import { GameModel } from "@bal7hazar/arcade-sdk";
import { addAddressPadding } from "starknet";
import { useAccount } from "@starknet-react/core";
import { useProject } from "@/hooks/project";

export function Achievements() {
  const { address: self } = useAccount();
  const {
    trophies: { achievements, players, isLoading },
    setAccountAddress,
  } = useData();

  const { pins, games } = useArcade();

  const { address } = useParams<{ address: string }>();
  const { project, namespace } = useProject();

  const [activeTab, setActiveTab] = useState<"trophies" | "leaderboard">(
    "trophies",
  );

  const game: GameModel | undefined = useMemo(() => {
    return Object.values(games).find(
      (game) => game.namespace === namespace && game.project === project,
    );
  }, [games, project, namespace]);

  const { pinneds, completed, total } = useMemo(() => {
    const ids = pins[addAddressPadding(address || self || "0x0")] || [];
    const pinneds = achievements
      .filter((item) => ids.includes(item.id))
      .sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage))
      .slice(0, 3); // There is a front-end limit of 3 pinneds
    const completed = achievements.filter((item) => item.completed).length;
    const total = achievements.length;
    return { pinneds, completed, total };
  }, [achievements, pins, address, self]);

  const { rank, earnings } = useMemo(() => {
    const rank =
      players.findIndex(
        (player) =>
          BigInt(player.address || 0) === BigInt(address || self || 0),
      ) + 1;
    const earnings =
      players.find(
        (player) =>
          BigInt(player.address || 0) === BigInt(address || self || 0),
      )?.earnings || 0;
    return { rank, earnings };
  }, [address, self, players]);

  const isSelf = useMemo(() => {
    return !address || address === self;
  }, [address, self]);

  useEffect(() => {
    setAccountAddress(address || self || "");
  }, [address, self, setAccountAddress]);

  return (
    <div className="w-3/4">
      {achievements.length ? (
        <div className="pb-4 select-none flex flex-col gap-y-6">
          {isSelf && (
            <div className="flex justify-between gap-x-3 gap-y-4">
              <TrophiesTab
                active={activeTab === "trophies"}
                completed={completed}
                total={total}
                onClick={() => setActiveTab("trophies")}
              />
              <LeaderboardTab
                active={activeTab === "leaderboard"}
                rank={rank}
                earnings={earnings}
                onClick={() => setActiveTab("leaderboard")}
              />
            </div>
          )}
          {(!isSelf || activeTab === "trophies") && (
            <Trophies
              achievements={achievements}
              softview={!isSelf}
              enabled={pinneds.length < 3}
              game={game}
              pins={pins}
            />
          )}
          {isSelf && activeTab === "leaderboard" && (
            <Leaderboard
              players={players}
              address={self || ""}
              achievements={achievements}
              pins={pins}
            />
          )}
        </div>
      ) : isLoading ? (
        <div className="pb-4 select-none">
          <div className="flex justify-center items-center h-full border border-dashed rounded-md text-muted-foreground/10 mb-4">
            <Spinner className="text-muted-foreground/30" size="lg" />
          </div>
        </div>
      ) : (
        <div className="pb-4 select-none">
          <div className="flex justify-center items-center h-full border border-dashed rounded-md text-muted-foreground/10 mb-4">
            <p className="text-muted-foreground/30">No trophies available</p>
          </div>
        </div>
      )}
    </div>
  );
}
