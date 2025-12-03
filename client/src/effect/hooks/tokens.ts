import { useAtomValue } from "@effect-atom/atom-react";
import { useMemo } from "react";
import {
  tokenContractsAtom,
  tokenContractAtom,
  type EnrichedTokenContract,
} from "../atoms/tokens";
import { unwrapOr, toCollectionStatus } from "../utils/result";

export const useTokenContracts = () => {
  const result = useAtomValue(tokenContractsAtom);
  const data = unwrapOr(result, [] as EnrichedTokenContract[]);
  const status = toCollectionStatus(result);
  return { data, status };
};

export const useTokenContract = (
  address: string | undefined,
): EnrichedTokenContract | null | undefined => {
  const result = useAtomValue(tokenContractAtom(address));
  return useMemo(
    () => unwrapOr(result, null as EnrichedTokenContract | null),
    [result],
  );
};

export type { EnrichedTokenContract };
