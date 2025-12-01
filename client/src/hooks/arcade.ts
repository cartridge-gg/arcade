import { ArcadeProvider as ExternalProvider } from "@cartridge/arcade";
import {
  accessesAtom,
  collectionEditionsAtom,
  editionsAtom,
  followsAtom,
  gamesAtom,
  pinsAtom,
  playerAtom,
} from "@/effect/atoms";
import { unwrapOr } from "@/effect/utils/result";
import {
  type AccessModel,
  type CollectionEditionModel,
  type EditionModel,
  type FollowEvent,
  type GameModel,
  type PinEvent,
  RoleType,
} from "@cartridge/arcade";
import { useAtom, useAtomValue } from "@effect-atom/atom-react";
import { useAccount } from "@starknet-react/core";
import { useMemo } from "react";
import { constants, getChecksumAddress } from "starknet";
import { useOwnerships } from "./ownerships";

export const useArcade = () => {
  //const { chainId, provider, chains } = useArcadeInit();
  const chainId = constants.StarknetChainId.SN_MAIN;
  const provider = useMemo(() => new ExternalProvider(chainId), []);
  const chains: string[] = [];

  const gamesResult = useAtomValue(gamesAtom);
  const games = unwrapOr(gamesResult, [] as GameModel[]);

  const editionsResult = useAtomValue(editionsAtom);
  const editions = unwrapOr(editionsResult, [] as EditionModel[]);

  const accessesResult = useAtomValue(accessesAtom);
  const accesses = unwrapOr(accessesResult, [] as AccessModel[]);

  const collectionEditionsResult = useAtomValue(collectionEditionsAtom);
  const collectionEditionsData = unwrapOr(
    collectionEditionsResult,
    [] as CollectionEditionModel[],
  );

  const pinsResult = useAtomValue(pinsAtom);
  const pinsData = unwrapOr(pinsResult, [] as PinEvent[]);

  const followsResult = useAtomValue(followsAtom);
  const followsData = unwrapOr(followsResult, [] as FollowEvent[]);

  const [player, setPlayer] = useAtom(playerAtom);

  const { address } = useAccount();
  const { ownerships } = useOwnerships();

  const pins = useMemo(() => {
    const result: { [playerId: string]: string[] } = {};
    for (const pin of pinsData) {
      const playerId = getChecksumAddress(pin.playerId);
      if (!result[playerId]) {
        result[playerId] = [];
      }
      if (pin.time !== 0) {
        result[playerId] = [
          ...new Set([...result[playerId], pin.achievementId]),
        ];
      }
    }
    return result;
  }, [pinsData]);

  const follows = useMemo(() => {
    const result: { [playerId: string]: string[] } = {};
    for (const follow of followsData) {
      const follower = getChecksumAddress(follow.follower);
      const followed = getChecksumAddress(follow.followed);
      if (!result[follower]) {
        result[follower] = [];
      }
      if (follow.time !== 0) {
        result[follower] = [...new Set([...result[follower], followed])];
      }
    }
    return result;
  }, [followsData]);

  const collectionEditions = useMemo(() => {
    const results: { [collection: string]: number[] } = {};
    for (const ce of collectionEditionsData) {
      if (!results[ce.collection]) {
        results[ce.collection] = [];
      }
      results[ce.collection].push(Number.parseInt(ce.edition));
    }
    return results;
  }, [collectionEditionsData]);

  const access = useMemo(() => {
    return accesses.find(
      (acc) => BigInt(acc.address) === BigInt(address || "0x1"),
    );
  }, [accesses, address]);

  const admin = useMemo(() => {
    return (
      access?.role?.value === RoleType.Owner ||
      access?.role.value === RoleType.Admin
    );
  }, [access]);

  const filteredGames = useMemo(() => {
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
        const game = games.find((g) => g.id === edition.gameId);
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
    games: filteredGames,
    editions: filteredEditions,
    collectionEditions,
    chains,
    player,
    setPlayer,
  };
};
