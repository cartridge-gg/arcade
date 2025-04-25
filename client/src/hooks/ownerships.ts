import { useContext, useMemo } from "react";
import { useProject } from "./project";
import { useArcade } from "./arcade";
import { OwnershipContext } from "@/context/ownership";

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
  const { games, editions } = useArcade();
  const { project } = useProject();

  if (!context) {
    throw new Error(
      "The `useOwnerships` hook must be used within a `OwnershipProvider`",
    );
  }

  const { collection, status } = context;

  const ownerships: { [key: string]: boolean } = useMemo(() => {
    if (!collection) return {};
    const tokenIds = collection.tokenIds.map((tokenId) => BigInt(tokenId));
    const editionIds = editions.map((edition) => BigInt(edition.id));
    const gameIds = games.map((game) => BigInt(game.id));
    const ids = [...editionIds, ...gameIds];
    const ownerships: { [key: string]: boolean } = {};
    ids.forEach((id) => {
      ownerships[id.toString()] = tokenIds.includes(id);
    });
    return ownerships;
  }, [collection, project]);

  return { ownerships, status };
};
