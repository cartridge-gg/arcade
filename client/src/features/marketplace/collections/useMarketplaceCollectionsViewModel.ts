import { useMemo } from "react";
import { getChecksumAddress } from "starknet";
import {
  StatusType,
  type CollectionEditionModel,
  type EditionModel,
  type GameModel,
  type OrderModel,
  type SaleEvent,
} from "@cartridge/arcade";
import { useMarketplace } from "@/hooks/marketplace";
import {
  useCollectionEditions,
  useEditions,
  useGames,
  useTokenContracts,
  type EnrichedTokenContract,
} from "@/collections";
import { resizeImage } from "@/helpers";
import {
  deriveBestPrice,
  deriveLatestSalePrice,
} from "@/shared/marketplace/utils";
import { buildMarketplaceTargetPath } from "@/shared/marketplace/path";

export interface MarketplaceCollectionPriceInfo {
  value: string;
  image: string;
}

export interface MarketplaceCollectionListItem {
  key: string;
  title: string;
  image: string;
  totalCount: number;
  listingCount: number;
  lastSale: MarketplaceCollectionPriceInfo | null;
  price: MarketplaceCollectionPriceInfo | null;
  href: string;
}

interface UseMarketplaceCollectionsViewModelArgs {
  edition?: EditionModel;
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
    orders: ReturnType<typeof useMarketplace>["orders"];
    sales: ReturnType<typeof useMarketplace>["sales"];
    editions: EditionModel[];
    games: GameModel[];
    currentPathname: string;
  },
): MarketplaceCollectionListItem[] => {
  const { orders, sales, editions, games, currentPathname } = options;

  return collections.map((collection) => {
    const collectionAddress = collection.contract_address;
    const collectionOrders = orders[collectionAddress];
    const listingCount = buildListingCount(collectionOrders);
    const lastSale = deriveLatestSalePrice(
      sales[collectionAddress] as
        | Record<string, Record<string, SaleEvent>>
        | undefined,
    );
    const price = deriveBestPrice(collectionOrders);

    const edition =
      editions.find((item) => item.config.project === collection.project) ||
      null;

    const game = edition
      ? games.find((g) => g.id === edition.gameId) || null
      : null;

    const target = buildMarketplaceTargetPath(
      currentPathname,
      collectionAddress,
      game,
      edition,
    );
    const totalCount = Number.parseInt(collection.total_supply);

    return {
      key: `${collection.project}-${collectionAddress}`,
      title: collection.name,
      image: resizeImage(collection.image, 300, 300) ?? collection.image,
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
  currentPathname,
}: UseMarketplaceCollectionsViewModelArgs): MarketplaceCollectionsViewModel {
  const editions = useEditions();
  const games = useGames();
  const collectionEditions = useCollectionEditions();
  const { data: allCollections, status } = useTokenContracts();
  const { orders, sales } = useMarketplace();

  const filteredCollections = useMemo(() => {
    if (!edition) return allCollections;

    const typedCollectionEditions =
      collectionEditions as CollectionEditionModel[];

    return allCollections.filter((collection) =>
      typedCollectionEditions.some((collectionEdition) => {
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
      buildMarketplaceItems(filteredCollections as EnrichedTokenContract[], {
        orders,
        sales,
        editions,
        games,
        currentPathname,
      }),
    [filteredCollections, orders, sales, editions, games, currentPathname],
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
