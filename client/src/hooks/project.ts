import { useMemo } from "react";
import { useArcade } from "./arcade";
import { useParams, useSearchParams } from "react-router-dom";
import { useAddressByUsernameQuery } from "@cartridge/ui/utils/api/cartridge";
import { getChecksumAddress } from "starknet";

/**
 * Custom hook to access the Project context and account information.
 * Must be used within a ProjectProvider component.
 *
 * @returns An object containing:
 * - project: The project name
 * - namespace: The namespace name
 * - gameId: The game id
 * - setProject: A function to set the project name
 * - setNamespace: A function to set the namespace name
 * - setGameId: A function to set the game id
 * @throws {Error} If used outside of a ProjectProvider context
 */
export const useProject = () => {
  const { games, editions } = useArcade();

  const {
    game: gameParam,
    edition: editionParam,
    player: playerParam,
    collection: collectionParam,
    tab,
  } = useParams<{
    game: string;
    edition: string;
    player: string;
    collection: string;
    tab: string;
  }>();

  const [searchParams, _] = useSearchParams();

  const filter = useMemo(() => {
    return searchParams.get("filter");
  }, [searchParams]);

  const { data: playerData } = useAddressByUsernameQuery(
    {
      username: playerParam?.toLowerCase() || "",
    },
    {
      enabled: !!playerParam && !playerParam.match(/^0x[0-9a-fA-F]+$/),
      refetchOnWindowFocus: false,
    },
  );

  const game = useMemo(() => {
    if (!gameParam || games.length === 0) return;
    return games.find(
      (game) =>
        game.id.toString() === gameParam ||
        game.name.toLowerCase().replace(/ /g, "-") === gameParam.toLowerCase(),
    );
  }, [gameParam, games]);

  const collection = useMemo(() => {
    if (!collectionParam) return;
    return getChecksumAddress(collectionParam);
  }, [collectionParam]);

  const edition = useMemo(() => {
    if (!game || editions.length === 0) return;
    const gameEditions = editions.filter(
      (edition) => edition.gameId === game.id,
    );
    if (gameEditions.length === 0) return;
    if (!editionParam) {
      return gameEditions
        .sort((a, b) => b.id - a.id)
        .sort((a, b) => b.priority - a.priority)[0];
    }
    return gameEditions.find(
      (edition) =>
        edition.id.toString() === editionParam ||
        edition.name.toLowerCase().replace(/ /g, "-") ===
          editionParam.toLowerCase(),
    );
  }, [game, editionParam, editions]);

  const player = useMemo(() => {
    if (playerParam && playerParam.match(/^0x[0-9a-fA-F]+$/)) {
      return getChecksumAddress(playerParam);
    }
    const address = playerData?.account?.controllers?.edges?.[0]?.node?.address;
    if (address) {
      return getChecksumAddress(address);
    }
    return;
  }, [playerData, playerParam]);

  return {
    game,
    edition,
    player,
    filter,
    collection,
    tab,
  };
};
