import { useAtomValue } from "@effect-atom/atom-react";
import { useMemo } from "react";
import {
  holdersAtom,
  type MarketplaceHolder,
  type HoldersState,
} from "../atoms/holders";
import {
  unwrapOr,
  toCollectionStatus,
  type CollectionStatus,
} from "../utils/result";
import type { EditionModel } from "../atoms/registry";

const DEFAULT_STATE: HoldersState = {
  holders: [],
  totalBalance: 0,
  hasMore: true,
};

export interface UseHoldersResult {
  holders: MarketplaceHolder[];
  totalBalance: number;
  hasMore: boolean;
  status: CollectionStatus;
  isLoading: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  editionError: EditionModel[];
}

export const useHolders = (
  project: string,
  contractAddress: string,
): UseHoldersResult => {
  const result = useAtomValue(holdersAtom(project, contractAddress));

  return useMemo(() => {
    const data = unwrapOr(result, DEFAULT_STATE);
    const status = toCollectionStatus(result);

    const isInitial = result._tag === "Initial";
    const isError = result._tag === "Failure";
    const isLoading = isInitial && data.holders.length === 0;
    const isLoadingMore = !isInitial && data.hasMore;

    return {
      holders: data.holders,
      totalBalance: data.totalBalance,
      hasMore: data.hasMore,
      status,
      isLoading,
      isLoadingMore,
      isError,
      editionError: [],
    };
  }, [result]);
};

export type { MarketplaceHolder };
