import { useAtomValue, Atom, type Result } from "@effect-atom/atom-react";
import { useMemo } from "react";
import {
  listedTokensAtom,
  type EnrichedListedToken,
} from "../atoms/listed-tokens";
import { unwrapOr, toStatus, type ResultStatus } from "../utils/result";

export interface UseListedTokensResult {
  tokens: EnrichedListedToken[];
  status: ResultStatus;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

type ListedTokensResult = Result.Result<EnrichedListedToken[], unknown>;

const emptyResultAtom = Atom.make(() => ({
  _tag: "Success" as const,
  value: [] as EnrichedListedToken[],
}));

export const useListedTokens = (
  project: string,
  address: string,
  tokenIds: string[],
  enabled = true,
): UseListedTokensResult => {
  const stableTokenIds = useMemo(
    () => (enabled && tokenIds.length > 0 ? tokenIds.slice().sort() : []),
    [tokenIds, enabled],
  );

  const atom = useMemo(
    () =>
      enabled && address && stableTokenIds.length > 0
        ? listedTokensAtom(project, address, stableTokenIds)
        : emptyResultAtom,
    [project, address, stableTokenIds, enabled],
  );

  const result = useAtomValue(atom as Atom.Atom<ListedTokensResult>);

  return useMemo(() => {
    const isFailure = result._tag === "Failure";
    const isInitial = result._tag === "Initial";
    const tokens = unwrapOr(result, []);

    return {
      tokens,
      status: toStatus(result),
      isLoading: isInitial,
      isError: isFailure,
      errorMessage: isFailure ? String((result as any).error) : null,
    };
  }, [result]);
};
