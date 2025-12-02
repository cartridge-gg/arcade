import { useAtomValue } from "@effect-atom/atom-react";
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
  return { data: unwrapOr(result, new Map<string, string>()) };
};

export const useAccount = (identifier: string | undefined) => {
  const result = useAtomValue(accountAtom(identifier));
  return { data: unwrapOr(result, null) };
};

export const useAccountByAddress = (address: string | undefined) => {
  const result = useAtomValue(accountByAddressAtom(address));
  return { data: unwrapOr(result, null) };
};

export const useAccountByUsername = (username: string | undefined) => {
  const result = useAtomValue(accountByUsernameAtom(username));
  return { data: unwrapOr(result, null) };
};

export const useAccountsByAddresses = (addresses: string[]) => {
  const result = useAtomValue(accountsByAddressesAtom(addresses));
  return { data: unwrapOr(result, []) };
};

export type { Account };
