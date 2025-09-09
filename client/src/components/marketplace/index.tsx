import { CollectibleCard, Empty, Skeleton } from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAddress } from "@/hooks/address";
import { getChecksumAddress } from "starknet";
import { OrderModel, StatusType } from "@cartridge/marketplace";
import { useMarketplace } from "@/hooks/marketplace";
import { useMarketCollections } from "@/hooks/market-collections";
import { Token } from "@dojoengine/torii-wasm";
import { useProject } from "@/hooks/project";
import { useLocation, useNavigate } from "react-router-dom";
import { joinPaths } from "@/helpers";
import { MetadataHelper } from "@/helpers/metadata";
import { useArcade } from "@/hooks/arcade";
import { EditionModel, GameModel } from "@cartridge/arcade";
import { erc20Metadata } from "@cartridge/presets";
import placeholder from "@/assets/placeholder.svg";
import makeBlockie from "ethereum-blockies-base64";

export const Marketplace = () => {
  const { collections } = useMarketCollections();
  const { editions, games } = useArcade();
  const { edition } = useProject();

  const fileteredCollections: (Token & { count: number; project: string })[] =
    useMemo(() => {
      const data = Object.entries(collections).flatMap(
        ([project, collection]) => {
          return Object.entries(collection).map(([address, token]) => {
            return {
              ...token,
              contract_address: getChecksumAddress(address),
              count: (token as Token & { count: number }).count,
              project,
            };
          });
        },
      );
      if (!edition) return data;
      return data.filter(
        (collection) => collection.project === edition.config.project,
      );
    }, [collections, edition]);

  if (!collections) {
    return <LoadingState />;
  }

  if (!!collections && fileteredCollections.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className="py-6 grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 place-items-center select-none overflow-y-scroll"
      style={{ scrollbarWidth: "none" }}
    >
      {fileteredCollections.map((collection) => (
        <Item
          key={`${collection.project}-${collection.contract_address}`}
          project={collection.project}
          collection={collection}
          editions={editions}
          games={games}
        />
      ))}
    </div>
  );
};

function Item({
  project,
  collection,
  editions,
  games,
}: {
  project: string;
  collection: Token & { count: number };
  editions: EditionModel[];
  games: GameModel[];
}) {
  const { isSelf } = useAddress();
  const { orders, sales } = useMarketplace();
  const [image, setImage] = useState<string>(placeholder);

  const location = useLocation();
  const navigate = useNavigate();

  const listingCount = useMemo(() => {
    const collectionOrders = orders[collection.contract_address];
    if (!collectionOrders) return 0;
    const tokenOrders = Object.entries(collectionOrders).reduce(
      (acc, [token, orders]) => {
        if (Object.values(orders).length === 0) return acc;
        acc[token] = Object.values(orders).filter(
          (order) => !!order && order.status.value === StatusType.Placed,
        );
        return acc;
      },
      {} as { [token: string]: OrderModel[] },
    );
    return Object.values(tokenOrders).length;
  }, [collection, orders]);

  const lastSale = useMemo(() => {
    if (!sales[collection.contract_address]) return undefined;
    const orderedSales = Object.values(sales[collection.contract_address]).flatMap(i => Object.values(i).sort((a, b) => b.time - a.time))
    const ls = orderedSales[orderedSales.length - 1];

    const erc20Data = erc20Metadata.find(m => getChecksumAddress(m.l2_token_address) === getChecksumAddress(ls.order.currency));
    const image =
      erc20Metadata.find(
        (m) => getChecksumAddress(m.l2_token_address) === ls.order.currency,
      )?.logo_url || makeBlockie(ls.order.currency);
    const decimals = erc20Data?.decimals || 0;
    const price = ls.order.price / 10 ** decimals;
    return { value: price.toString(), image };
  }, [sales, collection.contract_address])

  const price = useMemo(() => {
    if (!orders[collection.contract_address]) return undefined;
    const listings = Object.values(orders[collection.contract_address]).flatMap(i => Object.values(i).sort((a, b) => a.price - b.price))
    const cheapest = listings[listings.length - 1];

    const erc20Data = erc20Metadata.find(m => getChecksumAddress(m.l2_token_address) === getChecksumAddress(cheapest.currency));
    const image =
      erc20Metadata.find(
        (m) => getChecksumAddress(m.l2_token_address) === cheapest.currency,
      )?.logo_url || makeBlockie(cheapest.currency);
    const decimals = erc20Data?.decimals || 0;
    const price = cheapest.price / 10 ** decimals;
    return { value: price.toString(), image };
  }, [orders, collection.contract_address])


  const { game, edition } = useMemo(() => {
    if (!project) return { game: null, edition: null };
    const edition = editions.find(
      (edition) => edition.config.project === project,
    );
    if (!edition) return { game: null, edition: null };
    const game = games.find((game) => game.id === edition.gameId);
    return { game, edition };
  }, [collection, editions]);

  useEffect(() => {
    const fetchImage = async () => {
      const toriiImage = await MetadataHelper.getToriiImage(
        project,
        collection,
      );
      if (toriiImage) {
        setImage(toriiImage);
        return;
      }
      const metadataImage = await MetadataHelper.getMetadataImage(collection);
      if (metadataImage) {
        setImage(metadataImage);
        return;
      }
    };
    fetchImage();
  }, [collection, project]);

  const handleClick = useCallback(() => {
    let pathname = location.pathname;
    pathname = pathname.replace(/\/game\/[^/]+/, "");
    pathname = pathname.replace(/\/edition\/[^/]+/, "");
    pathname = pathname.replace(/\/player\/[^/]+/, "");
    pathname = pathname.replace(/\/tab\/[^/]+/, "");
    pathname = pathname.replace(/\/collection\/[^/]+/, "");
    const collectionAddress = collection.contract_address.toLowerCase();
    if (game && edition) {
      const gameName = game.name.replace(/ /g, "-").toLowerCase();
      const editionName = edition.name.replace(/ /g, "-").toLowerCase();
      pathname = joinPaths(
        pathname,
        `/game/${gameName}/edition/${editionName}/collection/${collectionAddress}`,
      );
    } else if (game) {
      const gameName = game.name.replace(/ /g, "-").toLowerCase();
      pathname = joinPaths(
        pathname,
        `/game/${gameName}/collection/${collectionAddress}`,
      );
    } else {
      pathname = joinPaths(pathname, `/collection/${collectionAddress}`);
    }
    navigate(pathname || "/");
  }, [collection, location, navigate, game, edition]);

  return (
    <div className="w-full group select-none">
      <CollectibleCard
        title={collection.name}
        image={image}
        totalCount={collection.count}
        listingCount={listingCount}
        onClick={isSelf ? handleClick : undefined}
        lastSale={lastSale ?? "---"}
        price={price ?? "---"}
        className={
          isSelf ? "cursor-pointer" : "cursor-default pointer-events-none"
        }
      />
    </div>
  );
}

const LoadingState = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 place-items-center select-none">
      <Skeleton className="w-full h-[164px] rounded" />
      <Skeleton className="w-full h-[164px] rounded" />
      <Skeleton className="hidden lg:block w-full h-[164px] rounded" />
    </div>
  );
};

const EmptyState = () => {
  return (
    <Empty
      title="No related collections"
      icon="inventory"
      className="h-full py-3 lg:py-6"
    />
  );
};
