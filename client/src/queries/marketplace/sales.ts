import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';

export interface Sale {
  id: string;
  orderId: string;
  collection: string;
  tokenId: string;
  price: string;
  currency: string;
  seller: string;
  buyer: string;
  transactionHash: string;
  timestamp: number;
}

export interface SalesResponse {
  sales: Sale[];
  totalSales: number;
  totalVolume: string;
}

async function fetchSales(collectionId: string, limit: number = 50): Promise<SalesResponse> {
  // TODO: Replace with actual marketplace SDK call
  // This should use @cartridge/marketplace SaleEvent
  throw new Error('TODO: implement me at marketplace/sales.ts - Need to integrate Marketplace SDK for fetching sales history');
}

export function useSalesQuery(collectionId: string, limit?: number) {
  return useQuery({
    queryKey: queryKeys.marketplace.sales(collectionId, limit),
    queryFn: () => fetchSales(collectionId, limit),
    enabled: !!collectionId,
    ...queryConfigs.marketplace,
  });
}

// Query for collection statistics
export function useCollectionStatsQuery(collectionId: string) {
  return useQuery({
    queryKey: queryKeys.marketplace.stats(collectionId),
    queryFn: async () => {
      // TODO: Compute collection statistics from sales and orders
      // Including floor price, volume, unique holders, etc.
      throw new Error('TODO: implement me at marketplace/sales.ts - Need to compute collection statistics');
    },
    enabled: !!collectionId,
    staleTime: 1000 * 60 * 5, // 5 minutes for stats
  });
}