import { CollectibleCard, Empty, Skeleton } from "@cartridge/ui";
import { useCallback, useMemo } from "react";
import { getChecksumAddress } from "starknet";
import { OrderModel, StatusType } from "@cartridge/marketplace";
import { useMarketplace } from "@/hooks/marketplace";
import { useLocation, useNavigate } from "react-router-dom";
import { joinPaths } from "@/helpers";
import { EditionModel, GameModel } from "@cartridge/arcade";
import { erc20Metadata } from "@cartridge/presets";
import makeBlockie from "ethereum-blockies-base64";
import { useMarketCollectionFetcher } from "@/hooks/marketplace-fetcher";
import { useEditions, useGames } from "@/collections";
import { Contract } from "@/store";
import { FloatingLoadingSpinner } from "@/components/ui/floating-loading-spinner";

export const Marketplace = ({ edition }: { edition?: EditionModel }) => {
  const editions = useEditions();
  const games = useGames();
  const projectsList = useMemo(() => {
    if (edition) return [edition.config.project];
    return editions.map(e => e.config.project)
  }, [editions, edition]);

  const { collections, status, editionError, loadingProgress } = useMarketCollectionFetcher({ projects: projectsList });

  if ((status === "idle" || status === "loading") && collections.length === 0) {
    return <LoadingState />;
  }

  if (status !== "loading" && collections.length === 0 && !editionError) {
    return <EmptyState />;
  }

  const isStillLoading = status === "loading" || (loadingProgress && loadingProgress.total > 0 && loadingProgress.completed < loadingProgress.total);

  return (
    <>
      {collections.length === 0 && editionError && editionError.length > 0 && (
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
            collection={collection}
            editions={editions as EditionModel[]}
            games={games as GameModel[]}
          />
        ))}
        </div>
      )}
      <FloatingLoadingSpinner
        isLoading={isStillLoading && collections.length > 0}
        loadingProgress={loadingProgress}
      />
    </>
  );
};

function Item({
  project,
  collection,
  editions,
  games,
}: {
  project: string;
  collection: Contract;
  editions: EditionModel[];
  games: GameModel[];
}) {
  const { orders, sales } = useMarketplace();

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
    const orderedSales = Object.values(
      sales[collection.contract_address],
    ).flatMap((i) => Object.values(i).sort((a, b) => b.time - a.time));
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
  }, [sales, collection.contract_address]);

  const price = useMemo(() => {
    if (!orders[collection.contract_address]) return undefined;
    const listings = Object.values(orders[collection.contract_address]).flatMap(
      (i) => Object.values(i).sort((a, b) => a.price - b.price),
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
  }, [orders, collection.contract_address]);

  const { game, edition } = useMemo(() => {
    if (!project) return { game: null, edition: null };
    const edition = editions.find(
      (edition) => edition.config.project === project,
    );
    if (!edition) return { game: null, edition: null };
    const game = games.find((game) => game.id === edition.gameId);
    return { game, edition };
  }, [collection, editions]);

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
        image={collection.image}
        // totalCount={collection.totalSupply as unknown as number}
        selectable={false}
        listingCount={listingCount}
        onClick={handleClick}
        lastSale={lastSale ?? null}
        price={price ?? null}
        className={"cursor-pointer"}
      />
    </div>
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
