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
        edition.name.toLowerCase().replace(/ /g, "-") === editionParam.toLowerCase()
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
      const newCollections: Collections = {};
      
      // Priority 1: Load current edition's tokens first if available
      if (currentEdition?.config.project && clients[currentEdition.config.project]) {
        const currentProject = currentEdition.config.project;
        if (!loadedProjectsRef.current.has(currentProject)) {
          const collection = await fetchProjectTokens(currentProject, clients[currentProject]);
          if (collection && isMountedRef.current) {
            newCollections[currentProject] = collection;
            setCollections(prev => ({
              ...prev,
              [currentProject]: collection,
            }));
            loadedProjectsRef.current.add(currentProject);
          }
        }
      }
      
      // Priority 2: Load other projects in background
      const otherProjects = Object.keys(clients).filter(
        project => project !== currentEdition?.config.project && !loadedProjectsRef.current.has(project)
      );
      
      // Load other projects sequentially with delay to avoid overwhelming
      for (const project of otherProjects) {
        if (!isMountedRef.current) break;
        
        // Small delay between projects to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const collection = await fetchProjectTokens(project, clients[project]);
        if (collection && isMountedRef.current) {
          newCollections[project] = collection;
          setCollections(prev => deduplicateCollections({
            ...prev,
            [project]: collection,
          }));
          loadedProjectsRef.current.add(project);
        }
      }
    };
    
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
