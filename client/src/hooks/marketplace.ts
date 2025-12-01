import { bookAtom, listingsAtom, ordersAtom, salesAtom } from "@/effect/atoms";
import {
  ArcadeProvider as ExternalProvider,
  StatusType,
} from "@cartridge/arcade";
import type { OrderModel } from "@cartridge/arcade";
import { useAtomValue } from "@effect-atom/atom-react";
import { useRouterState, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { constants, getChecksumAddress } from "starknet";
import { parseRouteParams } from "./project";

export const useMarketplace = () => {
  const chainId = constants.StarknetChainId.SN_MAIN;
  const provider = useMemo(() => new ExternalProvider(chainId), []);

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
        (acc, [token, tokenOrders]) => {
          const filtered = Object.values(tokenOrders).filter(
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
  }, [orders, contractAddress, tokenId]);

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
    setAmount,
    order,
    collectionOrders,
    tokenOrders,
    getCollectionOrders,
  };
};
