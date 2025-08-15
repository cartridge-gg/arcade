import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';

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

async function fetchTransfers(projects: TransferProject[]): Promise<TransfersResponse> {
  // TODO: Replace with actual Cartridge API call
  // This should use @cartridge/ui/utils/api/cartridge useTransfersQuery
  throw new Error('TODO: implement me at activities/transfers.ts - Need to integrate Cartridge API for fetching ERC20/721 transfers');
}

export function useTransfersQuery(address: string, projects: TransferProject[]) {
  return useQuery({
    queryKey: queryKeys.activities.transfers(address, projects),
    queryFn: () => fetchTransfers(projects),
    enabled: !!address && projects.length > 0,
    ...queryConfigs.activities,
  });
}

// Query for specific token transfers
export function useTokenTransfersQuery(
  address: string,
  tokenAddress: string,
  projects: TransferProject[]
) {
  return useQuery({
    queryKey: [...queryKeys.activities.transfers(address, projects), tokenAddress],
    queryFn: async () => {
      const data = await fetchTransfers(projects);
      // Filter transfers for specific token
      return {
        transfers: {
          items: data.transfers.items.map(item => ({
            ...item,
            transfers: item.transfers.filter(
              t => t.contractAddress.toLowerCase() === tokenAddress.toLowerCase()
            ),
          })),
        },
      };
    },
    enabled: !!address && !!tokenAddress && projects.length > 0,
    ...queryConfigs.activities,
  });
}