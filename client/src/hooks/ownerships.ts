import { useContext } from "react";
import { OwnershipContext } from "@/context/ownerships";

/**
 * Custom hook to access the Ownerships context and account information.
 * Must be used within a CollectionProvider component.
 *
 * @returns An object containing:
 * - ownerships: The registered ownerships
 * - status: The status of the ownerships
 * @throws {Error} If used outside of a CollectionProvider context
 */
export const useOwnerships = () => {
  const context = useContext(OwnershipContext);

  if (!context) {
    throw new Error(
      "The `useOwnerships` hook must be used within a `OwnershipProvider`",
    );
  }

  const { ownerships, status } = context;

  return { ownerships, status };
};
