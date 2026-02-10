import { useMemo } from "react";
import { useArcade } from "@/hooks/arcade";
import { useInventoryCollections } from "@/hooks/collections";
import { useAddress } from "@/hooks/address";
import { useAccount } from "@starknet-react/core";
import { useMarketplace } from "@/hooks/marketplace";
import { useRouterState } from "@tanstack/react-router";
import { getChecksumAddress } from "starknet";
import { joinPaths } from "@/lib/helpers";
import { useAccountByAddress, type EnrichedTokenContract } from "@/effect";
import { StatusType } from "@cartridge/arcade";
import { useAnalytics } from "@/hooks/useAnalytics";

export interface InventoryCollectionCardView {
  id: string;
  title: string;
  image: string;
  icon: string;
  totalCount: number;
  listingCount: number;
  ownedCount: number;
  backgroundColor?: string;
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

export function useInventoryCollectionsViewModel({
  collections,
  status,
}: UseInventoryCollectionsViewModelArgs): InventoryCollectionsViewModel {
  const { editions } = useArcade();
  const { collections: ownedCollections } = useInventoryCollections();
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
    // console.log(`COLLECTIONS:`, filteredCollections)
    return filteredCollections.map((contract) => {
      const collectionOrders = orders[contract.contract_address];
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
      const collection = ownedCollections.find(
        (c) => getChecksumAddress(c.address) === contract.contract_address,
      );
      const ownedCount = collection?.totalCount || 0;
      const icon =
        collection?.iconUrl ||
        contract.image ||
        collection?.tokenImageUrl ||
        "";
      const image =
        collection?.tokenImageUrl ||
        contract.image ||
        collection?.iconUrl ||
        "";
      const backgroundColor =
        collection?.tokenBackgroundColor ||
        contract.background_color ||
        undefined;

      const content: InventoryCollectionCardView = {
        id: contract.contract_address,
        title: contract.name,
        image,
        icon,
        totalCount: Number(contract.totalSupply),
        ownedCount,
        listingCount,
        backgroundColor,
      };

      const handleClick = async () => {
        trackEvent(events.INVENTORY_COLLECTION_CLICKED, {
          collection_address: contract.contract_address,
          collection_name: contract.name,
          collection_type: contract.contract_type,
          total_count: Number(contract.totalSupply),
          listing_count: listingCount,
          is_self: isSelf,
          from_page: location.pathname,
        });
      };

      content.onClick = handleClick;

      // possible from -> to locations:
      // /inventory -> /inventory/collection/$collection
      // /game/$game/inventory -> /game/$game/inventory/collection/$collection
      // /player/$player/inventory -> /player/$player/inventory/collection/$collection
      // /player/$player -> /player/$player/inventory/collection/$collection
      const segments = location.pathname.split("/").filter(Boolean);
      const baseSegments = [...segments];
      const lastSegment = baseSegments.at(-1);
      if (lastSegment !== "inventory") {
        baseSegments.push("inventory");
      }
      baseSegments.push("collection", contract.contract_address);
      content.href = joinPaths(...baseSegments);

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
