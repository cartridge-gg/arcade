import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";

import { ArcadeContext } from "./arcade";
import { Token } from "@dojoengine/torii-wasm";
import { getChecksumAddress } from "starknet";
import { useParams } from "react-router-dom";

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
  const { clients, editions } = context;
  const { edition: editionParam } = useParams<{ edition: string }>();
  const loadedProjectsRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  // Get current edition from params
  const currentEdition = useMemo(() => {
    if (!editionParam || editions.length === 0) return null;
    return editions.find(
      (edition) =>
        edition.id.toString() === editionParam ||
        edition.name.toLowerCase().replace(/ /g, "-") ===
          editionParam.toLowerCase(),
    );
  }, [editionParam, editions]);

  // Helper function to fetch tokens for a single project
  const fetchProjectTokens = async (project: string, client: any) => {
    try {
      // Initial fetch with smaller limit for faster first load
      const initialLimit = 100;
      let tokens = await client.getTokens({
        contract_addresses: [],
        token_ids: [],
        pagination: {
          cursor: undefined,
          limit: initialLimit,
          order_by: [],
          direction: "Forward",
        },
      });

      const allTokens = [...tokens.items];

      // Only continue fetching if component is still mounted
      if (!isMountedRef.current) return null;

      // Fetch remaining tokens in background
      while (tokens.next_cursor && isMountedRef.current) {
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
      if (!filtereds.length) return null;

      const collection: Record<string, WithCount<Token>> = filtereds.reduce(
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

      return collection;
    } catch (error) {
      console.error("Error fetching tokens:", error, project);
      return null;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!clients || Object.keys(clients).length === 0) return;

    const fetchCollections = async () => {
      // Only load collections for the current project/edition
      if (
        currentEdition?.config.project &&
        clients[currentEdition.config.project]
      ) {
        const currentProject = currentEdition.config.project;

        // Skip if already loaded for this project
        if (loadedProjectsRef.current.has(currentProject)) return;

        const collection = await fetchProjectTokens(
          currentProject,
          clients[currentProject],
        );
        if (collection && isMountedRef.current) {
          setCollections({
            [currentProject]: collection,
          });
          loadedProjectsRef.current.add(currentProject);
        }
      } else if (!currentEdition) {
        // If no specific edition, load all collections (marketplace view)
        const allCollections: Collections = {};

        for (const project of Object.keys(clients)) {
          if (!isMountedRef.current) break;
          if (loadedProjectsRef.current.has(project)) continue;

          const collection = await fetchProjectTokens(
            project,
            clients[project],
          );
          if (collection && isMountedRef.current) {
            allCollections[project] = collection;
            loadedProjectsRef.current.add(project);
          }
        }

        if (isMountedRef.current && Object.keys(allCollections).length > 0) {
          setCollections(allCollections);
        }
      }
    };

    // Clear loaded projects when edition changes
    loadedProjectsRef.current.clear();

    fetchCollections();
  }, [clients, currentEdition?.config.project]);

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
