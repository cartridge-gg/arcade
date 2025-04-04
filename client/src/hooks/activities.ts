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
  const { project } = useProject();

  if (!context) {
    throw new Error(
      "The `useActivities` hook must be used within a `ActivitiesProvider`",
    );
  }

  const { activities: allActivities, status } = context;

  const activities = useMemo(() => {
    if (!project)
      return Object.values(allActivities).flatMap((activities) => activities);
    // return allActivities[project];
    return allActivities[project === "ryomainnet" ? "dopewarsbal" : project];
  }, [project, allActivities]);

  return { activities, status };
};
