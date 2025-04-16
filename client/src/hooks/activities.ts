import { useContext, useMemo } from "react";
import { useProject } from "./project";
import { ActivitiesContext } from "@/context";
import { Activity } from "@/context/activities";

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
  const { project } = useProject();

  if (!context) {
    throw new Error(
      "The `useActivities` hook must be used within a `ActivitiesProvider`",
    );
  }

  const {
    activities: allActivities,
    playerActivities: allPlayerActivities,
    usernames,
    status,
  } = context;

  const aggregatedActivities: { [key: string]: Activity[] } = useMemo(() => {
    const result: { [key: string]: Activity[] } = {};
    Object.entries(allActivities).forEach(([project, activities]) => {
      let username = "";
      const aggregatedActivities: Activity[] = [];
      activities.forEach((activity) => {
        if (activity.callerAddress !== username) {
          username = activity.callerAddress;
          aggregatedActivities.push({ ...activity });
        } else {
          aggregatedActivities[aggregatedActivities.length - 1].count +=
            activity.count;
          aggregatedActivities[aggregatedActivities.length - 1].timestamp =
            activity.timestamp;
        }
      });
      result[project] = aggregatedActivities;
    });
    return result;
  }, [allActivities]);

  const activities = useMemo(() => {
    if (!project)
      return Object.values(allActivities).flatMap((activities) => activities);
    return allActivities[project];
  }, [project, allActivities]);

  const playerActivities = useMemo(() => {
    if (!project)
      return Object.values(allPlayerActivities).flatMap(
        (activities) => activities,
      );
    return allPlayerActivities[project];
  }, [project, allPlayerActivities]);

  return {
    aggregatedActivities,
    usernames,
    activities,
    playerActivities,
    status,
  };
};
