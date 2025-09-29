import { useCallback, useContext, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getChecksumAddress } from "starknet";
import { type OrderModel, StatusType } from "@cartridge/arcade";
import { ArcadeContext } from "@/context";

/**
 * Custom hook to access the Marketplace context and account information.
 * Must be used within a ArcadeProvider component.
 *
 * @returns An object containing:
 * - chainId: The chain id
 * - provider: The Marketplace provider instance
 * - orders: All the existing orders
 * @throws {Error} If used outside of a ArcadeProvider context
 */
export const useMarketplace = () => {
  const context = useContext(ArcadeContext);

  if (!context) {
    throw new Error(
      "The `useMarketplace` hook must be used within a `ArcadeProvider`",
    );
  }

  const { address: contractAddress, tokenId } = useParams();
  const {
    chainId,
    provider,
    orders,
    addOrder,
    removeOrder,
    listings,
    sales,
    book,
  } = context;
  const [amount, setAmount] = useState<number>(0);

  const getCollectionOrders = useCallback(
    (contractAddress: string) => {
      const collection = getChecksumAddress(contractAddress);
      const collectionOrders = orders[collection];
      if (!collectionOrders) return {};
      return Object.entries(collectionOrders).reduce(
        (acc, [token, orders]) => {
          const filtered = Object.values(orders).filter(
            (order) => !!order && order.status.value === StatusType.Placed,
          );
          if (filtered.length === 0) return acc;
          acc[token] = filtered;
          return acc;
        },
        {} as { [token: string]: OrderModel[] },
      );
    },
    [orders],
  );

  const collectionOrders: { [token: string]: OrderModel[] } = useMemo(() => {
    return getCollectionOrders(contractAddress || "0x0");
  }, [getCollectionOrders, contractAddress]);

  const tokenOrders = useMemo(() => {
    const collection = getChecksumAddress(contractAddress || "0x0");
    const collectionOrders = orders[collection];
    if (!collectionOrders) return [];
    const token = BigInt(tokenId || "0x0").toString();
    return Object.values(collectionOrders[token] || {}).filter(
      (order) => order.status.value === StatusType.Placed,
    );
  }, [orders, tokenId]);

  const order: OrderModel | undefined = useMemo(() => {
    if (!contractAddress || !tokenId) return;
    const collection = getChecksumAddress(contractAddress);
    const collectionOrders = orders[collection];
    if (!collectionOrders) return;
    const token = BigInt(tokenId).toString();
    const tokenOrders = Object.values(collectionOrders[token] || {}).filter(
      (order) => order.status.value === StatusType.Placed,
    );
    if (tokenOrders.length === 0) return;
    return tokenOrders[0];
  }, [orders, contractAddress, tokenId]);

  const marketplaceFee = useMemo(() => {
    if (!book) return 0;
    return (book.fee_num * amount) / 10000;
  }, [book, amount]);

  return {
    chainId,
    provider,
    listings,
    sales,
    orders,
    marketplaceFee,
    addOrder,
    removeOrder,
    setAmount,
    order,
    collectionOrders,
    tokenOrders,
    getCollectionOrders,
  };
};
