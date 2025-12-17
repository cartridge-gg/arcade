import {
  collectionOrdersAtom,
  listingsAtom,
  marketplaceFeeAtom,
  orderAtom,
  ordersAtom,
  salesAtom,
  tokenOrdersAtom,
} from "@/effect/atoms";
import { ArcadeProvider as ExternalProvider } from "@cartridge/arcade";
import { useAtomValue } from "@effect-atom/atom-react";
import { useRouterState, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { constants } from "starknet";
import { parseRouteParams } from "./project";

export const useMarketplace = () => {
  const chainId = constants.StarknetChainId.SN_MAIN;
  const provider = useMemo(() => new ExternalProvider(chainId), []);

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

  const collectionOrders = useAtomValue(
    collectionOrdersAtom(contractAddress || "0x0"),
  );

  const tokenOrdersKey = JSON.stringify({
    contractAddress: contractAddress || "0x0",
    tokenId: tokenId || "0x0",
  });
  const tokenOrders = useAtomValue(tokenOrdersAtom(tokenOrdersKey));

  const orderKey = JSON.stringify({
    contractAddress: contractAddress || "0x0",
    tokenId: tokenId || "0x0",
  });
  const order = useAtomValue(orderAtom(orderKey));

  const marketplaceFee = useAtomValue(marketplaceFeeAtom(amount));

  const getCollectionOrders = useCallback(
    (addr: string) => collectionOrdersAtom(addr),
    [],
  );

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
