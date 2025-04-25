import { useContext, useMemo } from "react";
import { CollectionContext } from "../context/collection";
import { useProject } from "./project";
import { useArcade } from "./arcade";
import { DEFAULT_PROJECT } from "@/constants";

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
  const context = useContext(CollectionContext);
  const { games, editions } = useArcade();
  const { project } = useProject();

  if (!context) {
    throw new Error(
      "The `useOwnerships` hook must be used within a `CollectionProvider`",
    );
  }

  const { collections: allCollections, status } = context;

  const ownerships: { [key: string]: boolean } = useMemo(() => {
    const collection = allCollections.find((collection) =>
      collection.imageUrl.includes(DEFAULT_PROJECT),
    );
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
  }, [allCollections, project]);

  return { ownerships, status };
};
