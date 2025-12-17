import { useCallback, useMemo } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import {
  collectionOrdersWithUsdAtom,
  type ListingWithUsd,
} from "@/effect/atoms/marketplace";

export function useCollectionOrders(collectionAddress: string) {
  const collectionOrders = useAtomValue(
    collectionOrdersWithUsdAtom(collectionAddress || "0x0"),
  );

  const listedTokenIds = useMemo(() => {
    if (!collectionOrders) return [];
    return Object.values(collectionOrders).flatMap((listings) =>
      listings.map((listing) => listing.order.tokenId.toString(16)),
    );
  }, [collectionOrders]);

  const getOrdersForToken = useCallback(
    (rawTokenId?: string | bigint): ListingWithUsd[] => {
      if (!rawTokenId) return [];

      const candidates = new Set<string>();
      const tokenIdString = rawTokenId.toString();
      candidates.add(tokenIdString);

      try {
        if (tokenIdString.startsWith("0x")) {
          const numericId = BigInt(tokenIdString).toString();
          candidates.add(numericId);
        }
      } catch {
        // Ignore parse errors
      }

      for (const candidate of candidates) {
        const orders = collectionOrders?.[candidate];
        if (orders?.length) {
          return orders;
        }
      }

      return [];
    },
    [collectionOrders],
  );

  return { collectionOrders, listedTokenIds, getOrdersForToken };
}
