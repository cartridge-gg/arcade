import { bookAtom, listingsAtom, ordersAtom, salesAtom } from "@/effect/atoms";
import { ArcadeProvider as ExternalProvider } from "@cartridge/arcade";
import { type OrderModel, StatusType } from "@cartridge/arcade";
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { useRouterState, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { constants, getChecksumAddress } from "starknet";
import { useArcadeInit } from "./arcadeInit";
import { parseRouteParams } from "./project";

export const useMarketplace = () => {
  // const { chainId, provider, addOrder, removeOrder } = useArcadeInit();
  const chainId = constants.StarknetChainId.SN_MAIN;
  const provider = useMemo(() => new ExternalProvider(chainId), []);
  const setOrders = useAtomSet(ordersAtom);

  const addOrder = useCallback(
    (order: OrderModel) => {
      const collection = getChecksumAddress(order.collection);
      const token = order.tokenId.toString();
      setOrders((prev) => ({
        ...prev,
        [collection]: {
          ...(prev[collection] || {}),
          [token]: {
            ...(prev[collection]?.[token] || {}),
            [order.id]: order,
          },
        },
      }));
    },
    [setOrders],
  );

  const removeOrder = useCallback(
    (order: OrderModel) => {
      const collection = getChecksumAddress(order.collection);
      const token = order.tokenId.toString();
      setOrders((prev) => {
        const newOrders = { ...prev };
        if (newOrders[collection]?.[token]?.[order.id]) {
          delete newOrders[collection][token][order.id];
        }
        return newOrders;
      });
    },
    [setOrders],
  );

  const book = useAtomValue(bookAtom);
  const orders = useAtomValue(ordersAtom);
  const listings = useAtomValue(listingsAtom);
  const sales = useAtomValue(salesAtom);

  const routerState = useRouterState();
  const search = useSearch({ strict: false });
  const params = useMemo(
    () => parseRouteParams(routerState.location.pathname),
    [routerState.location.pathname],
  );

  const contractAddress = params.collection;
  const tokenId = useMemo(() => {
    if (params.token) return params.token;
    if (!search) return undefined;
    const value = (search as Record<string, unknown>).token;
    return typeof value === "string" ? value : undefined;
  }, [params.token, search]);
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
