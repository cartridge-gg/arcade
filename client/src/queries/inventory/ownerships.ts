import { useMemo } from "react";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { useOwnershipsQuery as useCartridgeOwnershipsQuery } from "@cartridge/ui/utils/api/cartridge";
import { useAccount } from "@starknet-react/core";
import { DEFAULT_PROJECT_QUERY } from "@/constants";
import { UseBaseQueryResult } from "@tanstack/react-query";

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

export function useOwnershipsQuery(): UseBaseQueryResult<Ownership[]> {
  const { address = '' } = useAccount();
  const projects = [DEFAULT_PROJECT_QUERY];
  // Use the Cartridge API hook if available
  const result = useCartridgeOwnershipsQuery(
    {
      projects,
    },
    {
      queryKey: queryKeys.inventory.ownerships(address, projects),
      enabled: !!address && projects.length > 0,
      ...queryConfigs.inventory,
    },
  );

  const ownerships = useMemo(() => {
    if (!result.data) return [];

    return result.data?.items
      .flatMap((item) => {
        return item.ownerships.map((ownership) => {
          const contractAddress = ownership.contractAddress;
          const accountAddress = ownership.accountAddress;
          const tokenId = BigInt(ownership.tokenId);
          const balance = BigInt(ownership.balance);
          return {
            contractAddress,
            accountAddress,
            tokenId,
            balance,
          };
        });
      })
      .filter((item) => BigInt(item.balance) != 0n) || [];

  }, [result])
  // Return with proper typing
  return {
    ...result,
    data: ownerships,
  };
}
