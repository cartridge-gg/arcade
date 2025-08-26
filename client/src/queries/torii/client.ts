import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { useEffect, useRef } from "react";

export interface ToriiClient {
  projectId: string;
  url: string;
  connected: boolean;
  client?: any; // Actual Torii client instance
}

export interface Entity {
  id: string;
  model: string;
  data: any;
  metadata?: any;
}

async function initializeToriiClient(
  projectId: string,
  url: string,
): Promise<ToriiClient> {
  // TODO: Replace with actual Torii client initialization
  // This should use SDK provider.getToriiClient(url)
  throw new Error(
    "TODO: implement me at torii/client.ts - Need to initialize Torii client from SDK",
  );
}

export function useToriiClientQuery(projectId: string, url: string) {
  return useQuery({
    queryKey: queryKeys.torii.client(projectId),
    queryFn: () => initializeToriiClient(projectId, url),
    enabled: !!projectId && !!url,
    staleTime: Infinity, // Client connections should persist
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Query for fetching entities from Torii
export function useToriiEntitiesQuery(
  projectId: string,
  model: string,
  filter?: any,
) {
  return useQuery({
    queryKey: queryKeys.torii.entities(projectId, model),
    queryFn: async () => {
      // TODO: Fetch entities from Torii client
      // This would use the Torii client to query specific models
      throw new Error(
        "TODO: implement me at torii/client.ts - Need to fetch entities from Torii",
      );
    },
    enabled: !!projectId && !!model,
    ...queryConfigs.torii,
  });
}

// Hook for Torii subscriptions
export function useToriiSubscription(
  projectId: string,
  models: string[],
  onUpdate?: (entities: Entity[]) => void,
) {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!projectId || models.length === 0) return;

    const setupSubscription = async () => {
      try {
        // TODO: Setup Torii subscription
        // This would use the Torii client to subscribe to model updates
        throw new Error(
          "TODO: implement me at torii/client.ts - Need to setup Torii subscription",
        );
      } catch (error) {
        console.error("Failed to setup Torii subscription:", error);
      }
    };

    setupSubscription();

    return () => {
      // Cleanup subscription on unmount
      if (subscriptionRef.current) {
        // Unsubscribe from Torii updates
        if (typeof subscriptionRef.current.unsubscribe === "function") {
          subscriptionRef.current.unsubscribe();
        }
        if (typeof subscriptionRef.current.close === "function") {
          subscriptionRef.current.close();
        }
        subscriptionRef.current = null;
      }
    };
  }, [projectId, models, queryClient]);

  return subscriptionRef.current;
}

// Query for batch fetching multiple models
export function useToriiModelsQuery(projectId: string, models: string[]) {
  return useQuery({
    queryKey: queryKeys.torii.subscription(projectId, models),
    queryFn: async () => {
      // TODO: Fetch multiple models in parallel
      throw new Error(
        "TODO: implement me at torii/client.ts - Need to fetch multiple models from Torii",
      );
    },
    enabled: !!projectId && models.length > 0,
    ...queryConfigs.torii,
  });
}
