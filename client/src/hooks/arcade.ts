import { useContext, useMemo } from "react";
import { ArcadeContext } from "../context/arcade";
import { useAccount } from "@starknet-react/core";
import { RoleType } from "@cartridge/arcade";
import { useOwnerships } from "./ownerships";

/**
 * Custom hook to access the Arcade context and account information.
 * Must be used within a ArcadeProvider component.
 *
 * @returns An object containing:
 * - chainId: The chain id
 * - provider: The Arcade provider instance
 * - pins: All the existing pins
 * - games: The registered games
 * - chains: The chains
 * @throws {Error} If used outside of a ArcadeProvider context
 */
export const useArcade = () => {
  const context = useContext(ArcadeContext);

  if (!context) {
    throw new Error(
      "The `useArcade` hook must be used within a `ArcadeProvider`",
    );
  }

  const {
    chainId,
    provider,
    pins,
    follows,
    accesses,
    games,
    editions,
    collectionEditions,
    chains,
    clients,
    player,
    setPlayer,
  } = context;
  const { address } = useAccount();
  const { ownerships } = useOwnerships();

  const access = useMemo(() => {
    return accesses.find(
      (access) => BigInt(access.address) === BigInt(address || "0x1"),
    );
  }, [accesses, address]);

  const admin = useMemo(() => {
    return (
      access?.role?.value === RoleType.Owner ||
      access?.role.value === RoleType.Admin
    );
  }, [access]);

  const fileteredGames = useMemo(() => {
    return games.filter((game) => {
      const gameOwner = ownerships.find(
        (ownership) => ownership.tokenId === BigInt(game.id),
      );
      const isGameOwner =
        BigInt(gameOwner?.accountAddress || "0x0") === BigInt(address || "0x1");
      return admin || isGameOwner || (game.whitelisted && game.published);
    });
  }, [games, ownerships, admin, address]);

  const filteredEditions = useMemo(() => {
    return editions
      .filter((edition) => {
        const gameOwner = ownerships.find(
          (ownership) => ownership.tokenId === BigInt(edition.gameId),
        );
        const editionOwner = ownerships.find(
          (ownership) => ownership.tokenId === BigInt(edition.id),
        );
        const isGameOwner =
          BigInt(gameOwner?.accountAddress || "0x0") ===
          BigInt(address || "0x1");
        const isEditionOwner =
          BigInt(editionOwner?.accountAddress || "0x0") ===
          BigInt(address || "0x1");
        return (
          admin ||
          isGameOwner ||
          isEditionOwner ||
          (edition.whitelisted && edition.published)
        );
      })
      .map((edition) => {
        const game = games.find((game) => game.id === edition.gameId);
        const gameOwnership = ownerships.find(
          (ownership) => ownership.tokenId === BigInt(game?.id || "0x0"),
        );
        if (!gameOwnership) return edition;
        const editionOwnership = ownerships.find(
          (ownership) => ownership.tokenId === BigInt(edition.id),
        );
        if (!editionOwnership) return edition;
        edition.certified =
          gameOwnership.accountAddress === editionOwnership.accountAddress;
        return edition.clone();
      });
  }, [editions, games, ownerships, admin, address]);

  return {
    chainId,
    provider,
    pins,
    follows,
    accesses,
    games: fileteredGames,
    editions: filteredEditions,
    collectionEditions,
    chains,
    clients,
    player,
    setPlayer,
  };
};
