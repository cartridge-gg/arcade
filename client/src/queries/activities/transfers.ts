import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';
import { useTransfersQuery as useCartridgeTransfersQuery } from '@cartridge/ui/utils/api/cartridge';

export interface TransferProject {
  project: string;
  address: string;
  limit?: number;
  date?: string;
}

export interface Transfer {
  tokenId: string;
  amount: string;
  decimals: string;
  symbol: string;
  contractAddress: string;
  transactionHash: string;
  eventId: string;
  fromAddress: string;
  toAddress: string;
  executedAt: string;
  name?: string;
  metadata?: any;
}

export interface TransfersResponse {
  transfers: {
    items: {
      meta: { project: string };
      transfers: Transfer[];
    }[];
  };
}

export function useTransfersQuery(address: string, projects: TransferProject[]) {
  // Use the Cartridge API hook directly
  const result = useCartridgeTransfersQuery(
    { projects },
    {
      queryKey: queryKeys.activities.transfers(address, projects),
      enabled: !!address && projects.length > 0,
      ...queryConfigs.activities,
    }
  );

  // Return with proper typing
  return {
    ...result,
    data: result.data as TransfersResponse | undefined,
  };
}

