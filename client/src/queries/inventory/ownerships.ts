import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { useOwnershipsQuery as useCartridgeOwnershipsQuery } from "@cartridge/ui/utils/api/cartridge";

export interface Ownership {
  ownerAddress: string;
  contractAddress: string;
  tokenId: string;
  amount: string;
  project: string;
  timestamp: number;
}

export interface OwnershipsResponse {
  ownerships: {
    items: Ownership[];
    totalCount: number;
  };
}

export function useOwnershipsQuery(address: string, projects: string[]) {
  // Use the Cartridge API hook if available
  const result = useCartridgeOwnershipsQuery(
    {
      project: projects[0] || "", // Default project
      contractAddresses: [],
      tokenIds: [],
    },
    {
      queryKey: queryKeys.inventory.ownerships(address, projects),
      enabled: !!address && projects.length > 0,
      ...queryConfigs.inventory,
    },
  );

  // Return with proper typing
  return {
    ...result,
    data: result.data as OwnershipsResponse | undefined,
  };
}
