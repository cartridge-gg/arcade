import type { EditionModel, GameModel } from "@cartridge/arcade";
import { joinPaths } from "@/lib/helpers";

const GAME_ROUTE_REGEX = /\/game\/[^/]+/;
const EDITION_ROUTE_REGEX = /\/edition\/[^/]+/;
const PLAYER_ROUTE_REGEX = /\/player\/[^/]+/;
const TAB_ROUTE_REGEX = /\/tab\/[^/]+/;
const COLLECTION_ROUTE_REGEX = /\/collection\/[^/]+/;
const MARKETPLACE_ROUTE_REGEX = /\/(marketplace|portal)/;

export const buildMarketplaceTargetPath = (
  basePathname: string,
  collectionAddress: string,
  game: GameModel | null,
  edition: EditionModel | null,
) => {
  let pathname = basePathname;

  pathname = pathname.replace(GAME_ROUTE_REGEX, "");
  pathname = pathname.replace(EDITION_ROUTE_REGEX, "");
  pathname = pathname.replace(PLAYER_ROUTE_REGEX, "");
  pathname = pathname.replace(TAB_ROUTE_REGEX, "");
  pathname = pathname.replace(COLLECTION_ROUTE_REGEX, "");
  pathname = pathname.replace(MARKETPLACE_ROUTE_REGEX, "");

  const address = collectionAddress.toLowerCase();

  if (game && edition) {
    const gameName = game.name.replace(/ /g, "-").toLowerCase();
    const editionName = edition.name.replace(/ /g, "-").toLowerCase();
    return joinPaths(
      pathname,
      `/game/${gameName}/edition/${editionName}/collection/${address}`,
    );
  }

  if (game) {
    const gameName = game.name.replace(/ /g, "-").toLowerCase();
    return joinPaths(pathname, `/game/${gameName}/collection/${address}`);
  }

  return `/collection/${address}`;
};
