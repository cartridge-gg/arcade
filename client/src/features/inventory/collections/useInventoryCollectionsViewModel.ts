import { useMemo } from "react";
import { useArcade } from "@/hooks/arcade";
import { useCollections } from "@/hooks/collections";
import { useAddress } from "@/hooks/address";
import { useAccount } from "@starknet-react/core";
import { useMarketplace } from "@/hooks/marketplace";
import { useRouterState } from "@tanstack/react-router";
import type ControllerConnector from "@cartridge/connector/controller";
import { CollectionType } from "@/context/collection";
import { getChecksumAddress } from "starknet";
import { joinPaths, resizeImage } from "@/lib/helpers";
import { TAB_SEGMENTS } from "@/hooks/project";
import type { EnrichedTokenContract } from "@/collections";
import { useAccountByAddress } from "@/collections";
import { StatusType, type EditionModel } from "@cartridge/arcade";
import { useAnalytics } from "@/hooks/useAnalytics";

export interface InventoryCollectionCardView {
  id: string;
  title: string;
  image: string;
  totalCount: number;
  listingCount: number;
  href?: string;
  search?: Record<string, string>;
  onClick?: () => void;
}

export interface InventoryCollectionsViewModel {
  isLoading: boolean;
  collectionCards: InventoryCollectionCardView[];
}

interface UseInventoryCollectionsViewModelArgs {
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

const getCollectionType = (collection: EnrichedTokenContract) => {
  return collection.contract_type === "ERC721"
    ? CollectionType.ERC721
    : CollectionType.ERC1155;
};

export function useInventoryCollectionsViewModel({
  collections,
  status,
}: UseInventoryCollectionsViewModelArgs): InventoryCollectionsViewModel {
  const { editions } = useArcade();
  const { collections: ownedCollections } = useCollections();
  const { isSelf, address } = useAddress();
  const { connector } = useAccount();
  const { orders } = useMarketplace();
  const { trackEvent, events } = useAnalytics();
  const { data: account } = useAccountByAddress(address);
  const { location } = useRouterState();

  const ownedAddresses = useMemo(() => {
    const addresses: string[] = [];
    for (const collection of ownedCollections) {
      const address = collection.address;
      if (!address) return;
      addresses.push(address);
      try {
        addresses.push(getChecksumAddress(address));
      } catch {
        // ignore malformed address; fallback to raw value
      }
    }
    return new Set(addresses);
  }, [ownedCollections]);

  const filteredCollections = useMemo(() => {
    return collections.filter((collection) => {
      const address = collection.contract_address;
      if (!address) return false;
      if (ownedAddresses?.has(address)) return true;
      try {
        return ownedAddresses?.has(getChecksumAddress(address));
      } catch {
        return false;
      }
    });
  }, [collections, ownedAddresses]);

  const collectionCards = useMemo(() => {
    return filteredCollections.map((collection) => {
      const edition = editions.find(
        (item: EditionModel) => item.config.project === collection.project,
      );

      const collectionOrders = orders[collection.contract_address];
      const listingCount = collectionOrders
        ? Object.values(collectionOrders).reduce((count, tokenOrders) => {
            const filtered = Object.values(tokenOrders).filter((order) => {
              if (!order) return false;
              return (
                order.status.value === StatusType.Placed &&
                BigInt(order.owner) === BigInt(address)
              );
            });
            return filtered.length > 0 ? count + 1 : count;
          }, 0)
        : 0;

      const collectionType = getCollectionType(collection);

      const content: InventoryCollectionCardView = {
        id: collection.contract_address,
        title: collection.name,
        image: resizeImage(collection.image, 300, 300) || "",
        totalCount: Number(collection.totalSupply),
        listingCount,
      };

      const handleClick = async () => {
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
          const username = await controller?.username();
          if (!controller || !username) {
            console.error("Connector not initialized");
            return;
          }

          let subpath: string | undefined;
          if (collectionType === CollectionType.ERC721) {
            subpath = "collection";
          } else if (collectionType === CollectionType.ERC1155) {
            subpath = "collectible";
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
      };

      content.onClick = handleClick;

      if (!isSelf) {
        const segments = location.pathname.split("/").filter(Boolean);
        const playerIndex = segments.indexOf("player");
        const baseSegments =
          playerIndex === -1 ? segments : segments.slice(0, playerIndex);
        const last = baseSegments[baseSegments.length - 1];
        if (TAB_SEGMENTS.includes(last as (typeof TAB_SEGMENTS)[number])) {
          baseSegments.pop();
        }
        baseSegments.push("collection", collection.contract_address, "items");
        content.href = baseSegments.length ? joinPaths(...baseSegments) : "/";
        if (account?.username) {
          content.search = { filter: account.username.toLowerCase() };
        }
      }

      return content;
    });
  }, [
    filteredCollections,
    editions,
    orders,
    address,
    isSelf,
    connector,
    location.pathname,
    trackEvent,
    events,
    account?.username,
  ]);

  return {
    isLoading: status === "loading",
    collectionCards,
  };
}
