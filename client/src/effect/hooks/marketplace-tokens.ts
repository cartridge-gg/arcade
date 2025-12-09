import { useAtom, Atom, type Result } from "@effect-atom/atom-react";
import { useMemo, useCallback } from "react";
import { getChecksumAddress } from "starknet";
import { marketplaceTokensAtom } from "../atoms/marketplace-tokens";
import { useTokenContract, type EnrichedTokenContract } from "./tokens";
import {
  toCollectionStatus,
  unwrapOr,
  type CollectionStatus,
} from "../utils/result";
import type { Token } from "@dojoengine/torii-wasm";

export interface UseMarketplaceTokensResult {
  collection: EnrichedTokenContract | null | undefined;
  tokens: Token[];
  hasMore: boolean;
  status: CollectionStatus;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

type TokenPullResult = Result.Result<
  { done: boolean; items: Token[][] },
  unknown
>;

const DEFAULT_STATE = { done: true, items: [] as Token[][] };
const nullResultAtom = Atom.make(() => ({
  _tag: "Success" as const,
  value: { done: true, items: [] as Token[][] },
}));

export const useMarketplaceTokens = (
  project: string,
  address: string,
  options?: {
    attributeFilters?: { [name: string]: Set<string> };
    tokenIds?: string[];
    enabled?: boolean;
    autoFetch?: boolean;
  },
): UseMarketplaceTokensResult => {
  const { attributeFilters, tokenIds, enabled = true } = options ?? {};

  const collection = useTokenContract(
    address ? getChecksumAddress(address) : undefined,
  );

  const atom = useMemo(
    () =>
      enabled && address
        ? marketplaceTokensAtom(project, address, attributeFilters, tokenIds)
        : null,
    [project, address, attributeFilters, tokenIds, enabled],
  );

  const [result, pullNext] = useAtom(
    (atom ?? nullResultAtom) as Atom.Writable<TokenPullResult, void>,
  );

  const fetchNextPage = useCallback(() => {
    if (result._tag === "Success" && !result.value.done && !result.waiting) {
      pullNext();
    }
  }, [result, pullNext]);

  return useMemo(() => {
    const isFailure = result._tag === "Failure";
    const isInitial = result._tag === "Initial";

    const data = unwrapOr(result, DEFAULT_STATE);
    const tokens = data.items.flat();
    const hasMore = !data.done;
    const status = toCollectionStatus(result);
    const isLoading = isInitial && tokens.length === 0;
    const isFetchingMore = (result as any).waiting === true;

    return {
      collection,
      tokens,
      hasMore,
      status,
      isLoading,
      isError: isFailure,
      errorMessage: isFailure ? String((result as any).error) : null,
      isFetchingNextPage: isFetchingMore,
      fetchNextPage,
    };
  }, [result, collection, fetchNextPage]);
};
