import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { ArcadeContext } from "./arcade";
import { Token } from "@dojoengine/torii-wasm";
import { getChecksumAddress } from "starknet";

const LIMIT = 1000;

export type Collection = Record<string, Token>;
export type Collections = Record<string, Collection>;
type WithCount<T> = T & { count: number };

/**
 * Interface defining the shape of the Collection context.
 */
interface MarketCollectionContextType {
  /** The Collection client instance */
  collections: Collections;
}
/**
 * React context for sharing Collection-related data throughout the application.
 */
export const MarketCollectionContext =
  createContext<MarketCollectionContextType | null>(null);

function deduplicateCollections(collections: Collections): Collections {
  const hasContract = (res: Collections, contract: string): boolean => {
    for (const project in res) {
      for (const c in res[project]) {
        if (c === contract) {
          return true;
        }
      }
    }
    return false;
  };

  const res: Collections = {};
  for (const project in collections) {
    res[project] = {};
    for (const contract in collections[project]) {
      if (hasContract(res, contract)) {
        continue;
      }
      res[project][contract] = collections[project][contract];
    }
  }
  return res;
}

/**
 * Provider component that makes Collection context available to child components.
 *
 * @param props.children - Child components that will have access to the Collection context
 * @throws {Error} If MarketCollectionProvider is used more than once in the component tree
 */
export const MarketCollectionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const currentValue = useContext(MarketCollectionContext);

  if (currentValue) {
    throw new Error("MarketCollectionProvider can only be used once");
  }

  const context = useContext(ArcadeContext);

  if (!context) {
    throw new Error(
      "MarketCollectionProvider must be used within ArcadeProvider",
    );
  }

  const [collections, setCollections] = useState<Collections>({});
  const { clients } = context;

  useEffect(() => {
    if (!clients || Object.keys(clients).length === 0) return;
    const fetchCollections = async () => {
      const collections: Collections = {};
      await Promise.all(
        Object.keys(clients).map(async (project) => {
          const client = clients[project];
          try {
            let tokens = await client.getTokens({
              contract_addresses: [],
              token_ids: [],
              pagination: {
                cursor: undefined,
                limit: LIMIT,
                order_by: [],
                direction: "Forward",
              },
            });
            const allTokens = [...tokens.items];
            while (tokens.next_cursor) {
              tokens = await client.getTokens({
                contract_addresses: [],
                token_ids: [],
                pagination: {
                  limit: LIMIT,
                  cursor: tokens.next_cursor,
                  order_by: [],
                  direction: "Forward",
                },
              });
              allTokens.push(...tokens.items);
            }

            const filtereds = allTokens.filter((token) => !!token.metadata);
            if (!filtereds.length) return;

            const collection: Record<
              string,
              WithCount<Token>
            > = filtereds.reduce(
              (acc: Record<string, WithCount<Token>>, token: Token) => {
                const address = getChecksumAddress(token.contract_address);
                if (address in acc) {
                  acc[address].count += 1;
                  return acc;
                }
                acc[address] = {
                  ...token,
                  contract_address: address,
                  count: 1,
                };

                return acc;
              },
              {},
            );

            collections[project] = collection;
            return;
          } catch (error) {
            console.error("Error fetching tokens:", error, project);
            return;
          }
        }),
      );
      setCollections(deduplicateCollections(collections));
    };
    fetchCollections();
  }, [clients]);

  return (
    <MarketCollectionContext.Provider
      value={{
        collections,
      }}
    >
      {children}
    </MarketCollectionContext.Provider>
  );
};
