import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/queries/keys";
import { queryConfigs } from "@/queries/queryClient";

// Import the query functions directly
import { useProgressionsQuery as originalProgressionsQuery } from "@/queries/achievements/progressions";
import { useTrophiesQuery as originalTrophiesQuery } from "@/queries/achievements/trophies";
import { useCollectiblesQuery as originalCollectiblesQuery } from "@/queries/inventory/collectibles";
import { useCollectionsQuery as originalCollectionsQuery } from "@/queries/inventory/collections";
import { useOwnershipsQuery as originalOwnershipsQuery } from "@/queries/inventory/ownerships";
import { useBalancesQuery as originalBalancesQuery } from "@/queries/tokens/balances";
import { useCreditsQuery as originalCreditsQuery } from "@/queries/tokens/credits";
import { useAccountNameQuery, useAccountNamesQuery } from "@/queries/users/accounts";
import { useActivitiesQuery as originalActivitiesQuery } from "@/queries/activities/transactions";
import { useTransfersQuery as originalTransfersQuery } from "@/queries/activities/transfers";
import { useMetricsQuery as originalMetricsQuery } from "@/queries/discovery/metrics";
import { usePlaythroughsQuery as originalPlaythroughsQuery } from "@/queries/discovery/playthroughs";

// Re-export the hooks with simpler names for use with collections
export const useProgressions = originalProgressionsQuery;
export const useTrophies = originalTrophiesQuery;
export const useCollectibles = originalCollectiblesQuery;
export const useCollections = originalCollectionsQuery;
export const useOwnerships = originalOwnershipsQuery;
export const useBalances = originalBalancesQuery;
export const useCredits = originalCreditsQuery;
export const useAccountByAddress = useAccountNameQuery;
export const useAccounts = useAccountNamesQuery;
export const useTransactions = originalActivitiesQuery;
export const useTransfers = originalTransfersQuery;
export const useMetrics = originalMetricsQuery;
export const usePlaythroughs = originalPlaythroughsQuery;
export const useActivities = originalActivitiesQuery;

// Re-export types for convenience
export type {
  ProgressionProject,
  Collectible,
  Collection,
  TokenBalance,
  Account,
  Activity,
  Transfer,
  Metric,
  Discover,
  PlaythroughProject,
} from "@/collections";
