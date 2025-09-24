import { useContext, useMemo } from "react";
import { useProject } from "./project";
import { ActivitiesContext } from "@/context";

/**
 * Custom hook to access the Activities context and account information.
 * Must be used within a ActivitiesProvider component.
 *
 * @returns An object containing:
 * - activities: The registered activities
 * - status: The status of the activities
 * @throws {Error} If used outside of a ActivitiesProvider context
 */
export const useActivities = () => {
  const context = useContext(ActivitiesContext);
  const { edition } = useProject();

  if (!context) {
    throw new Error(
      "The `useActivities` hook must be used within a `ActivitiesProvider`",
    );
  }

  const { erc20s, erc721s, actions, trophies, status } = context;

  const filteredActivities = useMemo(() => {
    if (!edition) {
      return [
        ...Object.values(erc20s).flat(),
        ...Object.values(erc721s).flat(),
        ...Object.values(actions).flat(),
        ...Object.values(trophies).flat(),
      ];
    }
    return [
      ...(erc20s[edition.config.project] || []),
      ...(erc721s[edition.config.project] || []),
      ...(actions[edition.config.project] || []),
      ...(trophies[edition.config.project] || []),
    ];
  }, [edition, erc20s, erc721s, actions, trophies]);

  const sortedActivities = useMemo(() => {
    return filteredActivities.sort((a, b) => b.timestamp - a.timestamp);
  }, [filteredActivities]);

  return {
    activities: sortedActivities,
    status,
  };
};
