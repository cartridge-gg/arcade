import { useCallback, useContext, useEffect, useState } from "react";
import { MarketCollectionContext } from "@/context/market-collection";
import { useArcade } from "./arcade";
import { Token, ToriiClient, TokenBalance } from "@dojoengine/torii-wasm";
export type { Collection, Collections } from "@/context/market-collection";

/**
 * Custom hook to access the Arcade context and account information.
 * Must be used within a ArcadeProvider component.
 *
 * @returns An object containing:
 * - chainId: The chain id
 * - provider: The Arcade provider instance
 * - pins: All the existing pins
 * - games: The registered games
 * - chains: The chains
 * @throws {Error} If used outside of a ArcadeProvider context
 */
export const useMarketCollections = () => {
  const context = useContext(MarketCollectionContext);

  if (!context) {
    throw new Error(
      "The `useCollections` hook must be used within a `MarketCollectionProvider`",
    );
  }

  const { collections } = context;

  return { collections };
};

async function fetchCollectionFromClient(
  clients: { [key: string]: ToriiClient },
  client: string,
  address: string,
  count: number,
  cursor: string | undefined,
): Promise<{
  items: Token[];
  cursor: string | undefined;
  client: string | undefined;
}> {
  try {
    const tokens = await clients[client].getTokens({
      contract_addresses: [address],
      token_ids: [],
      pagination: {
        cursor: cursor,
        limit: count,
        order_by: [],
        direction: "Forward",
      },
    });
    if (tokens.items.length !== 0) {
      return {
        items: tokens.items,
        cursor: tokens.next_cursor,
        client: client,
      };
    }
    return { items: [], cursor: undefined, client: undefined };
  } catch (err) {
    console.error(err);
    return { items: [], cursor: undefined, client: undefined };
  }
}

async function fetchBalancesFromClient(
  clients: { [key: string]: ToriiClient },
  client: string,
  address: string,
  count: number,
  cursor: string | undefined,
): Promise<{
  items: TokenBalance[];
  cursor: string | undefined;
  client: string | undefined;
}> {
  try {
    const balances = await clients[client].getTokenBalances({
      contract_addresses: [address],
      account_addresses: [],
      token_ids: [],
      pagination: {
        cursor: cursor,
        limit: count,
        order_by: [],
        direction: "Forward",
      },
    });
    if (balances.items.length !== 0) {
      return {
        items: balances.items,
        cursor: balances.next_cursor,
        client: client,
      };
    }
    return { items: [], cursor: undefined, client: undefined };
  } catch (err) {
    console.error(err);
    return { items: [], cursor: undefined, client: undefined };
  }
}

export function useCollection(
  collectionAddress: string,
  pageSize: number = 50,
  initialCursor?: string,
) {
  const { clients } = useArcade();
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [prevCursors, setPrevCursors] = useState<string[]>([]);
  const [client, setClient] = useState<string | undefined>(undefined);
  const [collection, setCollection] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(
    initialCursor,
  );

  const fetchCollection = useCallback(
    async (address: string, count: number, cursor: string | undefined) => {
      if (client) {
        return await fetchCollectionFromClient(
          clients,
          client,
          address,
          count,
          cursor,
        );
      }

      const collections = await Promise.all(
        Object.keys(clients).map(async (project) => {
          try {
            return await fetchCollectionFromClient(
              clients,
              project,
              address,
              count,
              cursor,
            );
          } catch (err) {
            console.error(err);
          }
        }),
      );
      const filteredCollections = collections.filter(
        (c) => c && c.items && c.items.length > 0,
      );

      if (filteredCollections.length === 0) {
        return { items: [], cursor: undefined, client: undefined };
      }
      return (
        filteredCollections[0] ?? {
          items: [],
          cursor: undefined,
          client: undefined,
        }
      );
    },
    [clients, client],
  );

  const loadPage = useCallback(
    async (pageNumber: number, newCursor?: string) => {
      setIsLoading(true);
      try {
        const {
          items,
          cursor: nextCursor,
          client: fetchedClient,
        } = await fetchCollection(collectionAddress, pageSize, newCursor);
        if (items.length > 0) {
          setCollection(
            items.map((token: Token) => {
              try {
                token.metadata = JSON.parse(
                  token.metadata?.replace(/"trait"/g, '"trait_type"') || "{}",
                );
                return token;
              } catch (_err) {
                console.error(token, _err);
                return token;
              }
            }),
          );
          setCursor(nextCursor);
          setCurrentCursor(newCursor);
          setClient(fetchedClient);
          setCurrentPage(pageNumber);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCollection, collectionAddress, pageSize],
  );

  const getPrevPage = useCallback(() => {
    if (currentPage > 1 && prevCursors.length > 0) {
      const newPrevCursors = [...prevCursors];
      const prevCursor = newPrevCursors.pop() || undefined;
      setPrevCursors(newPrevCursors);
      loadPage(currentPage - 1, prevCursor);
    }
  }, [currentPage, prevCursors, loadPage]);

  const getNextPage = useCallback(() => {
    if (cursor) {
      if (currentCursor) {
        setPrevCursors([...prevCursors, currentCursor]);
      }
      loadPage(currentPage + 1, cursor);
    }
  }, [cursor, prevCursors, currentPage, loadPage, currentCursor]);

  // Handle initial load and cursor changes from URL
  useEffect(() => {
    if (!isLoading) {
      if (initialCursor !== currentCursor) {
        // URL cursor changed, load the page with new cursor
        if (initialCursor) {
          // Navigate to specific cursor
          loadPage(currentPage, initialCursor);
        } else {
          // No cursor means first page
          setCurrentPage(1);
          setCursor(undefined);
          setPrevCursors([]);
          loadPage(1, undefined);
        }
      } else if (collection.length === 0) {
        // Initial load
        loadPage(1, initialCursor);
      }
    }
  }, [initialCursor, collectionAddress, clients]); // React to cursor and address changes

  return {
    collection,
    getPrevPage,
    getNextPage,
    hasPrev: currentPage > 1,
    hasNext: !!cursor,
    isLoading,
    currentPage,
    nextCursor: cursor,
    prevCursor:
      prevCursors.length > 0 ? prevCursors[prevCursors.length - 1] : undefined,
  };
}

export const useBalances = (
  collectionAddress: string,
  pageSize: number = 50,
  initialCursor?: string,
) => {
  const { clients } = useArcade();
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [prevCursors, setPrevCursors] = useState<string[]>([]);
  const [client, setClient] = useState<string | undefined>(undefined);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(
    initialCursor,
  );

  const fetchBalances = useCallback(
    async (address: string, count: number, cursor: string | undefined) => {
      if (client) {
        return await fetchBalancesFromClient(
          clients,
          client,
          address,
          count,
          cursor,
        );
      }

      const balances = await Promise.all(
        Object.keys(clients).map(async (project) => {
          try {
            return await fetchBalancesFromClient(
              clients,
              project,
              address,
              count,
              cursor,
            );
          } catch (err) {
            console.error(err);
          }
        }),
      );
      const filteredBalances = balances.filter(
        (b) => b && b.items && b.items.length > 0,
      );

      if (filteredBalances.length === 0) {
        return { items: [], cursor: undefined, client: undefined };
      }
      return (
        filteredBalances[0] ?? {
          items: [],
          cursor: undefined,
          client: undefined,
        }
      );
    },
    [clients, client],
  );

  const loadPage = useCallback(
    async (pageNumber: number, newCursor?: string) => {
      setIsLoading(true);
      try {
        const {
          items,
          cursor: nextCursor,
          client: fetchedClient,
        } = await fetchBalances(collectionAddress, pageSize, newCursor);
        if (items.length > 0) {
          setBalances(items.filter((item) => parseInt(item.balance, 16) > 0));
          setCursor(nextCursor);
          setCurrentCursor(newCursor);
          setClient(fetchedClient);
          setCurrentPage(pageNumber);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [fetchBalances, collectionAddress, pageSize],
  );

  const getPrevPage = useCallback(() => {
    if (currentPage > 1 && prevCursors.length > 0) {
      const newPrevCursors = [...prevCursors];
      const prevCursor = newPrevCursors.pop() || undefined;
      setPrevCursors(newPrevCursors);
      loadPage(currentPage - 1, prevCursor);
    }
  }, [currentPage, prevCursors, loadPage]);

  const getNextPage = useCallback(() => {
    if (cursor) {
      if (currentCursor) {
        setPrevCursors([...prevCursors, currentCursor]);
      }
      loadPage(currentPage + 1, cursor);
    }
  }, [cursor, prevCursors, currentPage, loadPage, currentCursor]);

  // Handle initial load and cursor changes from URL
  useEffect(() => {
    if (!isLoading) {
      if (initialCursor !== currentCursor) {
        // URL cursor changed, load the page with new cursor
        if (initialCursor) {
          // Navigate to specific cursor
          loadPage(currentPage, initialCursor);
        } else {
          // No cursor means first page
          setCurrentPage(1);
          setCursor(undefined);
          setPrevCursors([]);
          loadPage(1, undefined);
        }
      } else if (balances.length === 0) {
        // Initial load
        loadPage(1, initialCursor);
      }
    }
  }, [initialCursor, collectionAddress, clients]); // React to cursor and address changes

  return {
    balances,
    getPrevPage,
    getNextPage,
    hasPrev: currentPage > 1,
    hasNext: !!cursor,
    isLoading,
    currentPage,
    nextCursor: cursor,
    prevCursor:
      prevCursors.length > 0 ? prevCursors[prevCursors.length - 1] : undefined,
  };
};
