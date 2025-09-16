import { useCallback, useEffect, useState } from "react";
import { useArcade } from "./arcade";
import { useProject } from "./project";
import { Token, ToriiClient, TokenBalance } from "@dojoengine/torii-wasm";
export type { Collection, Collections } from "@/context/market-collection";


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
  const { edition } = useProject();
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

      // Only fetch from current edition's client
      if (edition?.config.project && clients[edition.config.project]) {
        return await fetchCollectionFromClient(
          clients,
          edition.config.project,
          address,
          count,
          cursor,
        );
      }

      // If no edition is selected, return empty (don't search other projects)
      return { items: [], cursor: undefined, client: undefined };
    },
    [clients, client, edition],
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
  const { edition } = useProject();
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

      // Only fetch from current edition's client
      if (edition?.config.project && clients[edition.config.project]) {
        return await fetchBalancesFromClient(
          clients,
          edition.config.project,
          address,
          count,
          cursor,
        );
      }

      // If no edition is selected, return empty (don't search other projects)
      return { items: [], cursor: undefined, client: undefined };
    },
    [clients, client, edition],
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
