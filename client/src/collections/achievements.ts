import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { queryClient, queryKeys } from "@/queries";

type Progression = {
  tokenId: string;
};

export const achievementsCollections = createCollection(
  queryCollectionOptions({
    queryKey: queryKeys.achievements.all,
    queryFn: async () => {
      return [];
    },
    queryClient,
    getKey: (item: Progression) => item.tokenId,
  }),
);
