import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import type { UIEvent } from "react";
import type { EditionModel } from "@cartridge/arcade";
import { LeaderboardView } from "@/components/ui/leaderboard/LeaderboardView";
import {
  useLeaderboardViewModel,
  type LeaderboardEntry,
} from "./useLeaderboardViewModel";

const DEFAULT_CAP = 30;
const ROW_HEIGHT = 44;

interface LeaderboardContainerProps {
  edition?: EditionModel;
}

const ensureHighlightVisible = (entries: LeaderboardEntry[], cap: number) => {
  if (entries.length <= cap) return entries;
  const highlightIndex = entries.findIndex((entry) => entry.highlight);
  if (highlightIndex === -1) {
    return entries.slice(0, cap);
  }
  if (highlightIndex < cap) {
    return entries.slice(0, cap);
  }
  return [...entries.slice(0, cap - 1), entries[highlightIndex]];
};

export const LeaderboardContainer = ({
  edition,
}: LeaderboardContainerProps) => {
  const {
    isConnected,
    isLoading,
    isError,
    allEntries,
    followingEntries,
    getPlayerTarget,
  } = useLeaderboardViewModel({ edition });

  const [cap, setCap] = useState(DEFAULT_CAP);
  const allListRef = useRef<HTMLDivElement>(null);
  const followingListRef = useRef<HTMLDivElement>(null);

  const limitedAllEntries = useMemo(
    () => ensureHighlightVisible(allEntries, cap),
    [allEntries, cap],
  );

  const limitedFollowingEntries = useMemo(
    () => ensureHighlightVisible(followingEntries, cap),
    [followingEntries, cap],
  );

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const newCap = Math.ceil(
      (target.scrollTop + target.clientHeight) / ROW_HEIGHT,
    );
    setCap((prev) => (newCap >= prev ? newCap + 5 : prev));
  }, []);

  useEffect(() => {
    setCap(DEFAULT_CAP);
    requestAnimationFrame(() => {
      if (allListRef.current) {
        allListRef.current.scrollTop = 0;
      }
      if (followingListRef.current) {
        followingListRef.current.scrollTop = 0;
      }
    });
  }, [edition?.config.project, allEntries.length, followingEntries.length]);

  return (
    <LeaderboardView
      isConnected={isConnected}
      isLoading={isLoading}
      isError={isError}
      allEntries={limitedAllEntries}
      followingEntries={limitedFollowingEntries}
      getPlayerTarget={getPlayerTarget}
      onScroll={handleScroll}
      allListRef={allListRef}
      followingListRef={followingListRef}
    />
  );
};
