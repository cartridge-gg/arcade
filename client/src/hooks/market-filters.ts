import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MarketFiltersContext } from "@/context/market-filters";
import { useProject } from "./project";
import { useBalances, useCollection } from "./market-collections";
import { SearchResult } from "@cartridge/ui";
import { OrderModel, Token } from "@cartridge/marketplace";
import { useMarketplace } from "./marketplace";
import { useUsernames } from "./account";
import { getChecksumAddress } from "starknet";
import { MetadataHelper } from "@/helpers/metadata";
import { useSearchParams } from "react-router-dom";

export type Asset = Token & { orders: OrderModel[]; owner: string };

/**
 * Custom hook to access the MarketFilters context and account information.
 * Must be used within a MarketFiltersProvider component.
 *
 * @returns An object containing:
 * - active: The active filter
 * - metadata: The metadata
 * - filteredMetadata: The filtered metadata
 * - setActive: The function to set the active filter
 * - setMetadata: The function to set the metadata
 * - setFilteredMetadata: The function to set the filtered metadata
 * - setActive: The function to set the active filter
 * @throws {Error} If used outside of a MarketFiltersProvider context
 */
export const useMarketFilters = () => {
  const context = useContext(MarketFiltersContext);

  if (!context) {
    throw new Error(
      "The `useFilters` hook must be used within a `MarketFiltersProvider`",
    );
  }

  const {
    active,
    isActive,
    setActive,
    allMetadata,
    setAllMetadata,
    filteredMetadata,
    setFilteredMetadata,
    addSelected,
    isSelected,
    resetSelected,
    clearable,
    empty,
  } = context;

  const { collection: collectionAddress } = useProject();
  const { orders } = useMarketplace();
  const { collection } = useCollection(collectionAddress || "", 1000);
  const { balances } = useBalances(collectionAddress || "", 1000);
  const [selected, setSelected] = useState<SearchResult | undefined>();
  const [selection, setSelection] = useState<Asset[]>([]);

  const accounts = useMemo(() => {
    if (!balances || balances.length === 0) return [];
    const owners = balances
      .filter((balance) => parseInt(balance.balance, 16) > 0)
      .map((balance) => `0x${BigInt(balance.account_address).toString(16)}`);
    return Array.from(new Set(owners));
  }, [balances, collectionAddress]);

  const { usernames } = useUsernames({ addresses: accounts });

  const tokens: (Token & { orders: OrderModel[]; owner: string })[] =
    useMemo(() => {
      if (!collection || !collectionAddress) return [];
      const collectionOrders = orders[getChecksumAddress(collectionAddress)];
      return collection
        .map((token) => {
          const balance = balances.find(
            (balance) => balance.token_id === token.token_id,
          );
          if (!collectionOrders || Object.keys(collectionOrders).length === 0)
            return {
              ...token,
              orders: [],
              owner: balance?.account_address || "0x0",
            };
          const tokenOrders =
            collectionOrders[Number(token.token_id).toString()];
          if (!tokenOrders || Object.keys(tokenOrders).length === 0)
            return {
              ...token,
              orders: [],
              owner: balance?.account_address || "0x0",
            };
          const fileteredOrders = Object.values(tokenOrders).filter(
            (order) =>
              BigInt(order.owner) === BigInt(balance?.account_address || "0x0"),
          );
          if (!fileteredOrders || fileteredOrders.length === 0)
            return {
              ...token,
              orders: [],
              owner: balance?.account_address || "0x0",
            };
          const order = fileteredOrders[0];
          return {
            ...token,
            orders: fileteredOrders.map((order) => order).slice(0, 1),
            owner: balance?.account_address || order.owner,
          };
        })
        .sort((a, b) => b.orders.length - a.orders.length);
    }, [collection, balances, orders]);

  const filteredTokens = useMemo(() => {
    const account = usernames.find(
      (item) => item.username === selected?.label,
    )?.address;
    const tokenIds = balances
      .filter(
        (balance) =>
          getChecksumAddress(balance.account_address) ===
          getChecksumAddress(account || "0x0"),
      )
      .map((balance) => balance.token_id);
    return tokens.filter((token) => {
      const attributes =
        (
          token.metadata as unknown as {
            attributes: { trait_type: string; value: string }[];
          }
        ).attributes || [];
      return (
        (token.orders.length > 0 || active === 1) &&
        (empty || isSelected(attributes)) &&
        (!account || tokenIds.includes(token.token_id)) &&
        token.owner !== "0x0"
      );
    });
  }, [tokens, active, isSelected, empty, selected, balances]);

  const filteredBalances = useMemo(() => {
    const tokenIds = filteredTokens.map((token) => token.token_id);
    return balances.filter((balance) => {
      return tokenIds.includes(balance.token_id);
    });
  }, [balances, filteredTokens]);

  const handleReset = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const [searchParams, setSearchParams] = useSearchParams();
  const handleSetSelected = useCallback(
    (selected: SearchResult | undefined) => {
      if (!selected) {
        // Remove the filter from the url
        searchParams.delete("filter");
        setSearchParams(searchParams);
      } else {
        searchParams.set("filter", selected.label);
        setSearchParams(searchParams);
      }
      setSelected(selected);
    },
    [setSelected, searchParams, setSearchParams],
  );

  useEffect(() => {
    if (!tokens) return;
    setAllMetadata(MetadataHelper.extract(tokens));
  }, [tokens, setAllMetadata]);

  useEffect(() => {
    if (!filteredTokens) return;
    setFilteredMetadata(MetadataHelper.extract(filteredTokens));
  }, [filteredTokens, setFilteredMetadata]);

  return {
    // Context
    active,
    isActive,
    setActive,
    allMetadata,
    setAllMetadata,
    filteredMetadata,
    setFilteredMetadata,
    addSelected,
    isSelected,
    resetSelected,
    clearable,
    empty,
    // Hook
    selected,
    setSelected: handleSetSelected,
    selection,
    handleReset,
    tokens,
    balances,
    filteredTokens,
    filteredBalances,
  };
};
