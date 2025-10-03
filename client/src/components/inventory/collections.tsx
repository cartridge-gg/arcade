import { CollectibleCard, Skeleton } from "@cartridge/ui";
import { useArcade } from "@/hooks/arcade";
import { useCallback, useMemo } from "react";
import type { EditionModel } from "@cartridge/arcade";
import placeholder from "@/assets/placeholder.svg";
import { useAccount } from "@starknet-react/core";
import type ControllerConnector from "@cartridge/connector/controller";
import { CollectionType } from "@/context/collection";
import { useAddress } from "@/hooks/address";
import { type OrderModel, StatusType } from "@cartridge/arcade";
import { useMarketplace } from "@/hooks/marketplace";
import { Link, useRouterState } from "@tanstack/react-router";
import { useUsername } from "@/hooks/account";
import { joinPaths, resizeImage } from "@/helpers";
import { useAnalytics } from "@/hooks/useAnalytics";
import { TAB_SEGMENTS } from "@/hooks/project";
import type { EnrichedTokenContract } from "@/collections";
import { useCollections } from "@/hooks/collections";
import { getChecksumAddress } from "starknet";

interface CollectionsProps {
  collections: EnrichedTokenContract[];
  status:
    | "loading"
    | "error"
    | "idle"
    | "success"
    | "initialCommit"
    | "ready"
    | "cleaned-up";
}

export const Collections = ({ collections, status }: CollectionsProps) => {
  const { editions } = useArcade();
  const { collections: ownedCollections } = useCollections();

  const filteredCollections = useMemo(() => {
    const ownedAddresses = new Set(
      ownedCollections.map((c) => getChecksumAddress(c.address)),
    );
    return collections.filter((c) => ownedAddresses.has(c.contract_address));
  }, [collections, ownedCollections]);

  switch (status) {
    case "loading": {
      return <LoadingState />;
    }
    default: {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 place-items-center select-none">
          {filteredCollections.map((collection) => (
            <Item
              key={collection.contract_address}
              collection={collection}
              editions={editions}
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
}: {
  collection: EnrichedTokenContract;
  editions: EditionModel[];
}) {
  const { isSelf, address } = useAddress();
  const { connector } = useAccount();
  const { orders } = useMarketplace();
  const { trackEvent, events } = useAnalytics();

  const edition = useMemo(() => {
    return editions.find(
      (edition) => edition.config.project === collection.project,
    );
  }, [editions, collection]);

  const listingCount = useMemo(() => {
    const collectionOrders = orders[collection.contract_address];
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

  const { location } = useRouterState();

  const collectionType = useMemo(() => {
    return collection.contract_type === "ERC721"
      ? CollectionType.ERC721
      : CollectionType.ERC1155;
  }, [collection.contract_type]);

  const target = useMemo(() => {
    if (isSelf) return undefined;
    const segments = location.pathname.split("/").filter(Boolean);
    const playerIndex = segments.indexOf("player");
    const baseSegments =
      playerIndex === -1 ? segments : segments.slice(0, playerIndex);
    const last = baseSegments[baseSegments.length - 1];
    if (TAB_SEGMENTS.includes(last as (typeof TAB_SEGMENTS)[number])) {
      baseSegments.pop();
    }
    baseSegments.push("collection", collection.contract_address, "items");
    return baseSegments.length ? joinPaths(...baseSegments) : "/";
  }, [isSelf, location.pathname, collection.contract_address]);

  const handleClick = useCallback(async () => {
    trackEvent(events.INVENTORY_COLLECTION_CLICKED, {
      collection_address: collection.contract_address,
      collection_name: collection.name,
      collection_type: collectionType,
      total_count: Number(collection.totalSupply),
      listing_count: listingCount,
      is_self: isSelf,
      from_page: location.pathname,
    });

    if (isSelf) {
      const controller = (connector as ControllerConnector)?.controller;
      if (!controller || !username) {
        console.error("Connector not initialized");
        return;
      }
      let subpath;
      switch (collectionType) {
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
      const options = [`ps=${collection.project}`, "closable=true"];
      if (preset) {
        options.push(`preset=${preset}`);
      } else {
        options.push("preset=cartridge");
      }
      const path = `account/${username}/inventory/${subpath}/${collection.contract_address}${options.length > 0 ? `?${options.join("&")}` : ""}`;
      controller.openProfileAt(path);
    }
  }, [
    collection.contract_address,
    collection.name,
    collectionType,
    collection.totalSupply,
    collection.project,
    connector,
    username,
    edition,
    location.pathname,
    isSelf,
    trackEvent,
    events,
    listingCount,
  ]);

  const content = (
    <CollectibleCard
      title={collection.name}
      image={resizeImage(collection.image, 300, 300) || placeholder}
      totalCount={Number(collection.totalSupply)}
      listingCount={listingCount}
      onClick={isSelf ? handleClick : undefined}
    />
  );

  if (target) {
    return (
      <Link
        to={target}
        search={{ filter: username.toLowerCase() }}
        className="w-full group select-none"
        onClick={handleClick}
      >
        {content}
      </Link>
    );
  }

  return <div className="w-full group select-none">{content}</div>;
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
