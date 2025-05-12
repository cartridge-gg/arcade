import { createContext, useState, ReactNode, useMemo } from "react";
import {
  useCollectiblesQuery,
  useCollectionsQuery,
} from "@cartridge/utils/api/cartridge";
import { useArcade } from "@/hooks/arcade";

const LIMIT = 10000;

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

  const [offset, setOffset] = useState(0);
  const [erc721s, setErc721s] = useState<Collection[]>([]);
  const [erc1155s, setErc1155s] = useState<Collection[]>([]);

  const projects = useMemo(
    () => editions.map((edition) => edition.config.project),
    [editions],
  );

  const { status: collectionStatus } = useCollectionsQuery(
    {
      accountAddress: address ?? "",
      projects: projects,
    },
    {
      queryKey: ["collections", projects, offset, address],
      enabled: projects.length > 0 && !!address && BigInt(address) !== 0n,
      refetchOnWindowFocus: false,
      onSuccess: ({ collections }) => {
        const newCollections: { [key: string]: Collection } = {};
        collections?.edges.forEach((e) => {
          const contractAddress = e.node.meta.contractAddress;
          const imagePath = e.node.meta.imagePath;
          const name = e.node.meta.name;
          const count = e.node.meta.assetCount;
          const first = e.node.assets.length > 0 ? e.node.assets[0] : undefined;
          let metadata: { image?: string } = {};
          try {
            metadata = JSON.parse(!first?.metadata ? "{}" : first?.metadata);
          } catch (error) {
            console.warn(error, { data: first?.metadata });
          }
          const project = e.node.meta.project;
          newCollections[`${contractAddress}`] = {
            address: contractAddress,
            imageUrl: metadata?.image ?? imagePath,
            name: name ? name : "---",
            totalCount: count,
            type: CollectionType.ERC721,
            project: project,
          };
        });
        if (collections?.edges.length === LIMIT) {
          setOffset(offset + LIMIT);
        }
        setErc721s(
          Object.values(newCollections).sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
      },
    },
  );

  const { status: collectibleStatus } = useCollectiblesQuery(
    {
      accountAddress: address ?? "",
      projects: projects,
    },
    {
      queryKey: ["collections", projects, offset, address],
      enabled: projects.length > 0 && !!address && BigInt(address) !== 0n,
      refetchOnWindowFocus: false,
      onSuccess: ({ collectibles }) => {
        const newCollections: { [key: string]: Collection } = {};
        collectibles?.edges.forEach((e) => {
          const contractAddress = e.node.meta.contractAddress;
          const imagePath = e.node.meta.imagePath;
          const name = e.node.meta.name;
          const count = e.node.meta.assetCount;
          const first = e.node.assets.length > 0 ? e.node.assets[0] : undefined;
          let metadata: { image?: string } = {};
          try {
            metadata = JSON.parse(!first?.metadata ? "{}" : first?.metadata);
          } catch (error) {
            console.warn(error, { data: first?.metadata });
          }
          const project = e.node.meta.project;
          newCollections[`${contractAddress}`] = {
            address: contractAddress,
            imageUrl: metadata?.image ?? imagePath,
            name: name ? name : "---",
            totalCount: count,
            type: CollectionType.ERC1155,
            project: project,
          };
        });
        if (collectibles?.edges.length === LIMIT) {
          setOffset(offset + LIMIT);
        }
        setErc1155s(
          Object.values(newCollections).sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
      },
    },
  );

  const status = useMemo(() => {
    if (collectionStatus === "error" || collectibleStatus === "error") {
      return "error";
    }
    if (collectionStatus === "loading" && collectibleStatus === "loading") {
      return "loading";
    }
    if (collectionStatus === "idle" && collectibleStatus === "idle") {
      return "idle";
    }
    return "success";
  }, [collectionStatus, collectibleStatus]);

  const collections = useMemo(
    () => [...erc721s, ...erc1155s],
    [erc721s, erc1155s],
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
