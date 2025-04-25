import { createContext, useState, ReactNode } from "react";
import { useCollectionsQuery } from "@cartridge/utils/api/cartridge";
import { useAccount } from "@starknet-react/core";
import { DEFAULT_PROJECT } from "@/constants";

export type Collection = {
  address: string;
  name: string;
  type: string;
  imageUrl: string;
  totalCount: number;
  project: string;
  tokenIds: string[];
};

export type OwnershipContextType = {
  collection: Collection | undefined;
  status: "success" | "error" | "idle" | "loading";
};

export const OwnershipContext = createContext<OwnershipContextType | null>(
  null,
);

export function OwnershipProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();

  const [collection, setCollection] = useState<Collection | undefined>();

  const { status } = useCollectionsQuery(
    {
      accountAddress: address ?? "",
      projects: [DEFAULT_PROJECT],
    },
    {
      queryKey: ["collections", address],
      enabled: !!address,
      refetchOnWindowFocus: true,
      onSuccess: ({ collections }) => {
        const newCollections: Collection[] = collections?.edges.map((e) => {
          const contractAddress = e.node.meta.contractAddress;
          const imagePath = e.node.meta.imagePath;
          const name = e.node.meta.name;
          const count = e.node.meta.assetCount;
          const project = e.node.meta.project;
          const tokenIds = e.node.assets.map((asset) => asset.tokenId);
          return {
            address: contractAddress,
            imageUrl: imagePath,
            name,
            totalCount: count,
            type: "ERC-721",
            tokenIds: tokenIds,
            project: project,
          };
        });
        if (newCollections.length !== 1) {
          console.error("Expected 1 collection, got", newCollections.length);
          return;
        }
        const newCollection = newCollections[0];
        setCollection(newCollection);
      },
    },
  );

  return (
    <OwnershipContext.Provider
      value={{
        collection,
        status,
      }}
    >
      {children}
    </OwnershipContext.Provider>
  );
}
