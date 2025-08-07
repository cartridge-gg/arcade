import { CollectibleCard, Skeleton } from "@cartridge/ui";
import { useArcade } from "@/hooks/arcade";
import { useCallback, useMemo } from "react";
import { EditionModel } from "@cartridge/arcade";
import placeholder from "@/assets/placeholder.svg";
import { useAccount } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Chain, mainnet } from "@starknet-react/chains";
import { Collection, CollectionType } from "@/context/collection";
import { useAddress } from "@/hooks/address";
import { getChecksumAddress } from "starknet";
import { OrderModel, StatusType } from "@cartridge/marketplace";
import { useMarketplace } from "@/hooks/marketplace";
import { useLocation, useNavigate } from "react-router-dom";
import { useUsername } from "@/hooks/account";
import { joinPaths } from "@/helpers";

interface CollectionsProps {
  collections: Collection[];
  status: "loading" | "error" | "idle" | "success";
}

export const Collections = ({ collections, status }: CollectionsProps) => {
  const { editions, chains } = useArcade();

  switch (status) {
    case "loading": {
      return <LoadingState />;
    }
    default: {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 place-items-center select-none">
          {collections.map((collection) => (
            <Item
              key={collection.address}
              collection={collection}
              editions={editions}
              chains={chains}
            />
          ))}
        </div>
      );
    }
  }
};

function Item({
  collection,
  editions,
  chains,
}: {
  collection: Collection;
  editions: EditionModel[];
  chains: Chain[];
}) {
  const { isSelf, address } = useAddress();
  const { connector } = useAccount();
  const { orders } = useMarketplace();

  const edition = useMemo(() => {
    return editions.find(
      (edition) => edition.config.project === collection.project,
    );
  }, [editions, collection]);

  const chain: Chain = useMemo(() => {
    return (
      chains.find(
        (chain) => chain.rpcUrls.default.http[0] === edition?.config.rpc,
      ) || mainnet
    );
  }, [chains, edition]);

  const listingCount = useMemo(() => {
    const collectionOrders = orders[getChecksumAddress(collection.address)];
    if (!collectionOrders) return 0;
    const tokenOrders = Object.entries(collectionOrders).reduce(
      (acc, [token, orders]) => {
        const filteredOrders = Object.values(orders).filter(
          (order) =>
            !!order &&
            order.status.value === StatusType.Placed &&
            BigInt(order.owner) === BigInt(address),
        );
        if (filteredOrders.length) {
          acc[token] = filteredOrders;
        }
        return acc;
      },
      {} as { [token: string]: OrderModel[] },
    );
    return Object.values(tokenOrders).length;
  }, [orders, address]);

  const { username } = useUsername({ address });

  const navigate = useNavigate();
  const location = useLocation();
  const handleClick = useCallback(async () => {
    // If the user is not logged in, or not the current user then we navigate to the marketplace
    if (!isSelf) {
      const player = username.toLowerCase();
      let pathname = location.pathname;
      pathname = pathname.replace(/\/player\/[^/]+/, "");
      pathname = pathname.replace(/\/tab\/[^/]+/, "");
      pathname = joinPaths(
        pathname,
        `/collection/${collection.address}/tab/items?filter=${player}`,
      );
      navigate(pathname || "/");
      return;
    }
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) {
      console.error("Connector not initialized");
      return;
    }
    let subpath;
    switch (collection.type) {
      case CollectionType.ERC721:
        subpath = "collection";
        break;
      case CollectionType.ERC1155:
        subpath = "collectible";
        break;
      default:
        console.error("Unknown collection type");
        return;
    }
    if (!subpath) return;
    const preset = edition?.properties.preset;
    let options = [`ps=${collection.project}`, "closable=true"];
    if (preset) {
      options.push(`preset=${preset}`);
    } else {
      options.push("preset=cartridge");
    }
    const path = `inventory/${subpath}/${collection.address}${options.length > 0 ? `?${options.join("&")}` : ""}`;
    controller.switchStarknetChain(`0x${chain.id.toString(16)}`);
    controller.openProfileTo(path);
  }, [
    collection.address,
    connector,
    collection.type,
    edition,
    location,
    navigate,
    isSelf,
  ]);

  return (
    <div className="w-full group select-none">
      <CollectibleCard
        title={collection.name}
        image={
          collection.imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/") ||
          placeholder
        }
        totalCount={collection.totalCount}
        listingCount={listingCount}
        onClick={handleClick}
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
