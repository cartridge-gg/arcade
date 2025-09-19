import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";

import { ArcadeContext } from "./arcade";
import { Token } from "@dojoengine/torii-wasm";


export type Collection = Record<string, Token>;
export type Collections = Record<string, Collection>;

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

  const [collections] = useState<Collections>({});


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
