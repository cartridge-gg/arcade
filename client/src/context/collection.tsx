import { createContext, useState, ReactNode, useMemo } from "react";
import { useCollectionsQuery } from "@cartridge/utils/api/cartridge";
import { useAddress } from "@/hooks/address";
import { useArcade } from "@/hooks/arcade";

const LIMIT = 1000;

export type Collection = {
  address: string;
  name: string;
  type: string;
  imageUrl: string;
  totalCount: number;
  project: string;
  tokenIds: string[];
};

export type CollectionContextType = {
  collections: Collection[];
  status: "success" | "error" | "idle" | "loading";
};

export const CollectionContext = createContext<CollectionContextType | null>(
  null,
);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const { address } = useAddress();
  const { projects: slots } = useArcade();

  const [offset, setOffset] = useState(0);
  const [collections, setCollections] = useState<Collection[]>([]);

  const projects = useMemo(() => slots.map((slot) => slot.project), [slots]);

  const { status } = useCollectionsQuery(
    {
      accountAddress: address ?? "",
      projects: projects,
    },
    {
      queryKey: ["collections", projects, offset, address],
      enabled: projects.length > 0 && !!address,
      refetchOnWindowFocus: true,
      onSuccess: ({ collections }) => {
        const newCollections: { [key: string]: Collection } = {};
        collections?.edges.forEach((e) => {
          const contractAddress = e.node.meta.contractAddress;
          const imagePath = e.node.meta.imagePath;
          const name = e.node.meta.name;
          const count = e.node.meta.assetCount;
          const project = e.node.meta.project;
          const tokenIds = e.node.assets.map((asset) => asset.tokenId);
          newCollections[`${contractAddress}`] = {
            address: contractAddress,
            imageUrl: imagePath,
            name,
            totalCount: count,
            type: "ERC-721",
            tokenIds: tokenIds,
            project: project,
          };
        });
        if (collections?.edges.length === LIMIT) {
          setOffset(offset + LIMIT);
        }
        setCollections(
          Object.values(newCollections).sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
      },
    },
  );

  return (
    <CollectionContext.Provider
      value={{
        collections,
        status,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}
