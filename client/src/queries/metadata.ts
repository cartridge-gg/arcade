import {
  aggregateTraitMetadata,
  fetchCollectionTraitMetadata,
  type TraitMetadataRow,
  type TraitSelection,
} from "@cartridge/arcade/marketplace";
import { queryKeys } from "@/queries/keys";
import { useQuery } from "@tanstack/react-query";

export type Metadata = TraitMetadataRow;

interface MetadataQueryOptions {
  contractAddress: string;
  traits: TraitSelection[];
  projects?: string[];
}

const metadataQueryFn = async ({
  contractAddress,
  traits,
  projects,
}: MetadataQueryOptions): Promise<Metadata[]> => {
  if (!contractAddress) {
    return [];
  }

  try {
    const result = await fetchCollectionTraitMetadata({
      address: contractAddress,
      traits,
      projects,
    });

    if (result.errors.length > 0) {
      console.warn(
        "Failed to fetch metadata for some projects:",
        result.errors.map((error) => ({
          projectId: error.projectId,
          message: error.error.message,
        })),
      );
    }

    return aggregateTraitMetadata(result.pages);
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return [];
  }
};

export const getMetadataQueryOptions = ({
  contractAddress,
  traits,
  projects,
}: MetadataQueryOptions) => {
  return {
    queryKey: [
      ...queryKeys.metadata.traits(contractAddress, traits),
      projects?.slice().sort().join(",") ?? "default",
    ] as const,
    queryFn: () =>
      metadataQueryFn({
        contractAddress,
        traits,
        projects,
      }),
  };
};

export const useMetadata = ({
  contractAddress,
  traits,
  projects,
  enabled = true,
}: MetadataQueryOptions & { enabled?: boolean }) => {
  return useQuery({
    ...getMetadataQueryOptions({
      contractAddress,
      traits,
      projects,
    }),
    enabled: enabled && !!contractAddress,
    refetchOnWindowFocus: false,
  });
};
