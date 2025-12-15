import { useMemo } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import {
  StatusType,
  type CollectionEditionModel,
  type EditionModel,
  type GameModel,
  type OrderModel,
} from "@cartridge/arcade";
import { useMarketplace } from "@/hooks/marketplace";
import { useTokenContracts, type EnrichedTokenContract } from "@/effect";
import {
  collectionEditionsAtom,
  editionsAtom,
  gamesAtom,
  unwrapOr,
} from "@/effect";
import { resizeImage } from "@/lib/helpers";
import {
  deriveBestPrice,
  deriveLatestSalePrice,
  getCachedChecksumAddress,
} from "@/lib/shared/marketplace/utils";
import { buildMarketplaceTargetPath } from "@/lib/shared/marketplace/path";

export interface MarketplaceCollectionPriceInfo {
  value: string;
  image: string;
}

export interface MarketplaceCollectionListItem {
  key: string;
  title: string;
  image: string;
  gameIcon?: string;
  totalCount: number;
  listingCount: number;
  lastSale: MarketplaceCollectionPriceInfo | null;
  price: MarketplaceCollectionPriceInfo | null;
  href: string;
}

interface UseMarketplaceCollectionsViewModelArgs {
  edition?: EditionModel;
  game?: GameModel;
  currentPathname: string;
}

interface MarketplaceCollectionsViewModel {
  items: MarketplaceCollectionListItem[];
  isLoading: boolean;
  isEmpty: boolean;
}

const buildListingCount = (
  collectionOrders?: Record<string, Record<string, OrderModel | null>>,
) => {
  if (!collectionOrders) return 0;

  return Object.values(collectionOrders).reduce((count, tokenOrders) => {
    const placedOrders = Object.values(tokenOrders).filter(
      (order) => !!order && order.status.value === StatusType.Placed,
    );
    if (placedOrders.length === 0) return count;
    return count + 1;
  }, 0);
};

const buildMarketplaceItems = (
  collections: EnrichedTokenContract[],
  options: {
    orders: ReturnType<typeof useMarketplace>["listings"];
    sales: ReturnType<typeof useMarketplace>["sales"];
    currentPathname: string;
    edition: EditionModel | undefined;
    game: GameModel | undefined;
    games: GameModel[];
    editions: EditionModel[];
    collectionEditions: CollectionEditionModel[];
  },
): MarketplaceCollectionListItem[] => {
  const {
    orders,
    sales,
    edition,
    game,
    currentPathname,
    games,
    editions,
    collectionEditions,
  } = options;

  return collections.map((collection) => {
    const collectionAddress = collection.contract_address;
    const collectionOrders = orders[collectionAddress];
    const listingCount = buildListingCount(collectionOrders);
    const lastSale = deriveLatestSalePrice(
      sales[getCachedChecksumAddress(collectionAddress)] as
        | Record<string, Record<string, OrderModel>>
        | undefined,
    );
    const price = deriveBestPrice(collectionOrders);

    const target = buildMarketplaceTargetPath(
      currentPathname,
      collectionAddress,
      game ?? null,
      edition ?? null,
    );
    const totalCount = Number.parseInt(collection.total_supply ?? "0");

    // Find the game icon for this collection using: collection → edition → game
    // 1. Find the edition that this collection belongs to
    const collectionEdition = collectionEditions.find(
      (ce) => BigInt(ce.collection) === BigInt(collectionAddress),
    );

    // 2. Find the edition details
    const collectionEditionDetails = collectionEdition
      ? editions.find((e) => BigInt(e.id) === BigInt(collectionEdition.edition))
      : undefined;

    // 3. Find the game using the edition's gameId
    const collectionGame = collectionEditionDetails
      ? games.find((g) => g.id === collectionEditionDetails.gameId)
      : undefined;

    const gameIcon = collectionGame?.properties.icon;
    return {
      key: `${collection.project}-${collectionAddress}`,
      title: collection.name,
      image: resizeImage(collection.image, 300, 300) ?? collection.image,
      gameIcon,
      totalCount: Number.isNaN(totalCount) ? 0 : totalCount,
      listingCount,
      lastSale,
      price,
      href: target,
    };
  });
};

export function useMarketplaceCollectionsViewModel({
  edition,
  game,
  currentPathname,
}: UseMarketplaceCollectionsViewModelArgs): MarketplaceCollectionsViewModel {
  const collectionEditionsResult = useAtomValue(collectionEditionsAtom);
  const collectionEditions = unwrapOr(collectionEditionsResult, []);
  const editionsResult = useAtomValue(editionsAtom);
  const editions = unwrapOr(editionsResult, [] as EditionModel[]);
  const { data: allCollections, status } = useTokenContracts();
  const { listings: orders, sales } = useMarketplace();
  const gamesResult = useAtomValue(gamesAtom);
  const games = unwrapOr(gamesResult, [] as GameModel[]);

  const filteredCollections = useMemo(() => {
    if (!edition) return allCollections;

    return allCollections.filter((collection) =>
      collectionEditions.some((collectionEdition) => {
        return (
          BigInt(collectionEdition.collection) ===
            BigInt(collection.contract_address) &&
          BigInt(collectionEdition.edition) === BigInt(edition.id)
        );
      }),
    );
  }, [allCollections, collectionEditions, edition]);

  const items = useMemo(
    () =>
      buildMarketplaceItems(filteredCollections, {
        orders,
        sales,
        currentPathname,
        edition,
        game,
        games,
        editions,
        collectionEditions,
      }),
    [
      filteredCollections,
      orders,
      sales,
      currentPathname,
      edition,
      game,
      games,
      editions,
      collectionEditions,
    ],
  );

  const isLoading =
    (status === "idle" || status === "loading") &&
    filteredCollections.length === 0;

  const isEmpty = status !== "loading" && filteredCollections.length === 0;

  return {
    items,
    isLoading,
    isEmpty,
  };
}
