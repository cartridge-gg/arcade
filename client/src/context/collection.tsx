import { createContext, ReactNode, useMemo } from "react";
import { useArcade } from "@/hooks/arcade";
import { DEFAULT_PROJECT } from "@/constants";
import { useCollectibles } from "@/hooks/token-fetcher";


export enum CollectionType {
  ERC721 = "ERC-721",
  ERC1155 = "ERC-1155",
}

export type Collection = {
  address: string;
  name: string;
  type: CollectionType;
  imageUrl: string;
  totalCount: number;
  project: string;
};

export type CollectionContextType = {
  collections: Collection[];
  status: "success" | "error" | "idle" | "loading";
};

export const CollectionContext = createContext<CollectionContextType | null>(
  null,
);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const { editions, player: address } = useArcade();

  const projects = useMemo(
    () => [
      DEFAULT_PROJECT,
      ...editions.map((edition) => edition.config.project),
    ],
    [editions],
  );
  const { collections: collectibles, status: ercStatus } = useCollectibles(projects, address)


  return (
    <CollectionContext.Provider
      value={{
        collections: collectibles,
        status: ercStatus,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}
