import { CollectibleCard, Empty, Skeleton } from "@cartridge/ui";
import { useMemo } from "react";
import { getChecksumAddress } from "starknet";
import { type OrderModel, StatusType } from "@cartridge/arcade";
import { useMarketplace } from "@/hooks/marketplace";
import { Link, useRouterState } from "@tanstack/react-router";
import { joinPaths, resizeImage } from "@/helpers";
import type {
  CollectionEditionModel,
  EditionModel,
  GameModel,
} from "@cartridge/arcade";
import { erc20Metadata } from "@cartridge/presets";
import makeBlockie from "ethereum-blockies-base64";
import {
  useCollectionEditions,
  useEditions,
  useGames,
  useTokenContracts,
} from "@/collections";
import { FloatingLoadingSpinner } from "@/components/ui/floating-loading-spinner";

export const Marketplace = ({ edition }: { edition?: EditionModel }) => {
  const editions = useEditions();
  const games = useGames();
  const collectionEditions = useCollectionEditions();

  const { data: allCollections, status } = useTokenContracts();

  const collections = useMemo(() => {
    if (!edition) return allCollections;
    return allCollections.filter((collection) => {
      return collectionEditions.some(
        (collectionEdition) =>
          BigInt((collectionEdition as CollectionEditionModel).collection) ===
            BigInt(collection.contract_address) &&
          BigInt((collectionEdition as CollectionEditionModel).edition) ===
            BigInt(edition.id),
      );
    });
  }, [allCollections, collectionEditions, edition]);

  if ((status === "idle" || status === "loading") && collections.length === 0) {
    return <LoadingState />;
  }

  if (status !== "loading" && collections.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {collections.length === 0 && (
        <Empty
          title="No collections available - Failed to connect to data source"
          className="h-full py-3 lg:py-6"
        />
      )}
      {collections.length > 0 && (
        <div
          className="py-6 grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 place-items-center select-none overflow-y-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          {collections.map((collection) => (
            <Item
              key={`${collection.project}-${collection.contract_address}`}
              project={collection.project}
              collectionAddress={collection.contract_address}
              collectionName={collection.name}
              collectionImage={collection.image}
              collectionTotalSupply={Number.parseInt(collection.total_supply)}
              editions={editions as EditionModel[]}
              games={games as GameModel[]}
            />
          ))}
        </div>
      )}
    </>
  );
};

function Item({
  project,
  collectionAddress,
  collectionName,
  collectionImage,
  collectionTotalSupply,
  editions,
  games,
}: {
  project: string;
  collectionAddress: string;
  collectionName: string;
  collectionImage: string;
  collectionTotalSupply: number;
  editions: EditionModel[];
  games: GameModel[];
}) {
  const { orders, sales } = useMarketplace();

  const { location } = useRouterState();

  const listingCount = useMemo(() => {
    const collectionOrders = orders[collectionAddress];
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
  }, [collectionAddress, orders]);

  const lastSale = useMemo(() => {
    if (!sales[collectionAddress]) return undefined;
    const orderedSales = Object.values(sales[collectionAddress]).flatMap((i) =>
      Object.values(i).sort((a, b) => b.time - a.time),
    );
    const ls = orderedSales[orderedSales.length - 1];

    const erc20Data = erc20Metadata.find(
      (m) =>
        getChecksumAddress(m.l2_token_address) ===
        getChecksumAddress(ls.order.currency),
    );
    const image =
      erc20Metadata.find(
        (m) => getChecksumAddress(m.l2_token_address) === ls.order.currency,
      )?.logo_url || makeBlockie(ls.order.currency);
    const decimals = erc20Data?.decimals || 0;
    const price = ls.order.price / 10 ** decimals;
    return { value: price.toString(), image };
  }, [sales, collectionAddress]);

  const price = useMemo(() => {
    if (!orders[collectionAddress]) return undefined;
    const listings = Object.values(orders[collectionAddress]).flatMap((i) =>
      Object.values(i).sort((a, b) => a.price - b.price),
    );
    const cheapest = listings[listings.length - 1];

    const erc20Data = erc20Metadata.find(
      (m) =>
        getChecksumAddress(m.l2_token_address) ===
        getChecksumAddress(cheapest.currency),
    );
    const image =
      erc20Metadata.find(
        (m) => getChecksumAddress(m.l2_token_address) === cheapest.currency,
      )?.logo_url || makeBlockie(cheapest.currency);
    const decimals = erc20Data?.decimals || 0;
    const price = cheapest.price / 10 ** decimals;
    return { value: price.toString(), image };
  }, [orders, collectionAddress]);

  const { game, edition } = useMemo(() => {
    if (!project) return { game: null, edition: null };
    const edition = editions.find(
      (edition) => edition.config.project === project,
    );
    if (!edition) return { game: null, edition: null };
    const game = games.find((game) => game.id === edition.gameId);
    return { game, edition };
  }, [collectionAddress, editions]);

  const target = useMemo(() => {
    let pathname = location.pathname;
    pathname = pathname.replace(/\/game\/[^/]+/, "");
    pathname = pathname.replace(/\/edition\/[^/]+/, "");
    pathname = pathname.replace(/\/player\/[^/]+/, "");
    pathname = pathname.replace(/\/tab\/[^/]+/, "");
    pathname = pathname.replace(/\/collection\/[^/]+/, "");
    const address = collectionAddress.toLowerCase();
    if (game && edition) {
      const gameName = game.name.replace(/ /g, "-").toLowerCase();
      const editionName = edition.name.replace(/ /g, "-").toLowerCase();
      pathname = joinPaths(
        pathname,
        `/game/${gameName}/edition/${editionName}/collection/${address}`,
      );
    } else if (game) {
      const gameName = game.name.replace(/ /g, "-").toLowerCase();
      pathname = joinPaths(pathname, `/game/${gameName}/collection/${address}`);
    } else {
      pathname = `/collection/${address}`;
    }
    return pathname || "/";
  }, [collectionAddress, location.pathname, game, edition]);

  return (
    <Link to={target} className="w-full group select-none">
      <CollectibleCard
        title={collectionName}
        image={resizeImage(collectionImage, 300, 300) ?? collectionImage}
        totalCount={collectionTotalSupply as unknown as number}
        selectable={false}
        listingCount={listingCount}
        lastSale={lastSale ?? null}
        price={price ?? null}
        className={"cursor-pointer"}
      />
    </Link>
  );
}

const LoadingState = () => {
  return (
    <div>
      <div className="py-6 grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 place-items-center select-none">
        <Skeleton className="w-full h-[164px] rounded" />
        <Skeleton className="w-full h-[164px] rounded" />
        <Skeleton className="hidden lg:block w-full h-[164px] rounded" />
      </div>
      <FloatingLoadingSpinner
        isLoading={true}
        loadingMessage="Loading collections."
      />
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
