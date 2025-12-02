import { useMemo } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import {
  StatusType,
  type EditionModel,
  type GameModel,
  type OrderModel,
  type SaleEvent,
} from "@cartridge/arcade";
import { useMarketplace } from "@/hooks/marketplace";
import { useTokenContracts, type EnrichedTokenContract } from "@/effect";
import { collectionEditionsAtom, unwrapOr } from "@/effect";
import { resizeImage } from "@/lib/helpers";
import {
  deriveBestPrice,
  deriveLatestSalePrice,
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
  },
): MarketplaceCollectionListItem[] => {
  const { orders, sales, edition, game, currentPathname } = options;

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

    const target = buildMarketplaceTargetPath(
      currentPathname,
      collectionAddress,
      game ?? null,
      edition ?? null,
    );
    const totalCount = Number.parseInt(collection.total_supply ?? "0");

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
  game,
  currentPathname,
}: UseMarketplaceCollectionsViewModelArgs): MarketplaceCollectionsViewModel {
  const collectionEditionsResult = useAtomValue(collectionEditionsAtom);
  const collectionEditions = unwrapOr(collectionEditionsResult, []);
  const { data: allCollections, status } = useTokenContracts();
  const { listings: orders, sales } = useMarketplace();

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
      }),
    [filteredCollections, orders, sales, currentPathname, edition, game],
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
