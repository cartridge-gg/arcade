import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global defaults
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Disabled to prevent excessive requests
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
export const persister = createAsyncStoragePersister({
  storage: window.localStorage,
})

// Domain-specific configurations
export const queryConfigs = {
  // Achievements - refresh every 10 minutes
  achievements: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  },

  // Activities - no automatic refresh
  activities: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchInterval: false,
  },

  // Marketplace - real-time data
  marketplace: {
    staleTime: 0, // Always stale for real-time data
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: false, // Use WebSocket subscriptions instead
  },

  // Inventory/Collections
  inventory: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 20, // 20 minutes
    refetchInterval: false,
  },

  // Token balances - refresh every 30 seconds
  tokens: {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 30, // 30 seconds
  },

  // User accounts - cache for 24 hours
  users: {
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchInterval: false,
  },

  // Discovery - refresh every 30 seconds
  discovery: {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 30, // 30 seconds
  },

  // Games registry - cache longer
  games: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: false,
  },

  // Torii client data
  torii: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: false,
  },
} as const;
