import { useContext, useMemo } from "react";
import { useProject } from "./project";
import { DiscoversContext } from "@/context";

/**
 * Custom hook to access the Discovers context and account information.
 * Must be used within a DiscoversProvider component.
 *
 * @returns An object containing:
 * - activities: The registered activities
 * - status: The status of the activities
 * @throws {Error} If used outside of a DiscoversProvider context
 */
export const useDiscovers = () => {
  const context = useContext(DiscoversContext);
  const { edition } = useProject();

  if (!context) {
    throw new Error(
      "The `useDiscovers` hook must be used within a `DiscoversProvider`",
    );
  }

  const { discovers, aggregates, usernames, status } = context;

  const filteredDiscovers = useMemo(() => {
    if (!edition)
      return Object.values(discovers).flatMap((activities) => activities);
    return discovers[edition.config.project];
  }, [edition, discovers]);

  return {
    discovers: filteredDiscovers,
    aggregates,
    usernames,
    status,
  };
};
