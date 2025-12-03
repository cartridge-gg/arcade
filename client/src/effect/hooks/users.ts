import { useAtomValue } from "@effect-atom/atom-react";
import { useMemo } from "react";
import {
  accountsMapAtom,
  accountAtom,
  accountByAddressAtom,
  accountByUsernameAtom,
  accountsByAddressesAtom,
  type Account,
} from "../atoms/users";
import { unwrapOr } from "../utils/result";

export const useAccounts = () => {
  const result = useAtomValue(accountsMapAtom);
  return useMemo(
    () => ({ data: unwrapOr(result, new Map<string, string>()) }),
    [result],
  );
};

export const useAccount = (identifier: string | undefined) => {
  const result = useAtomValue(accountAtom(identifier));
  return useMemo(() => ({ data: unwrapOr(result, null) }), [result]);
};

export const useAccountByAddress = (address: string | undefined) => {
  const result = useAtomValue(accountByAddressAtom(address));
  return useMemo(() => ({ data: unwrapOr(result, null) }), [result]);
};

export const useAccountByUsername = (username: string | undefined) => {
  const result = useAtomValue(accountByUsernameAtom(username));
  return useMemo(() => ({ data: unwrapOr(result, null) }), [result]);
};

export const useAccountsByAddresses = (addresses: string[]) => {
  const result = useAtomValue(accountsByAddressesAtom(addresses));
  return useMemo(() => ({ data: unwrapOr(result, []) }), [result]);
};

export type { Account };
