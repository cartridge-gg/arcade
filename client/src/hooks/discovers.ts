import { useContext } from "react";
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

  if (!context) {
    throw new Error(
      "The `useDiscovers` hook must be used within a `DiscoversProvider`",
    );
  }

  const { playthroughs, usernames, status } = context;

  return {
    playthroughs,
    usernames,
    status,
  };
};
