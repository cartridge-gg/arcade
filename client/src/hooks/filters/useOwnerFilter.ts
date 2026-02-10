import { useState, useMemo, useCallback } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import { accountsAtom, type Account } from "@/effect/atoms";
import { unwrapOr } from "@/effect";
import { useProject } from "@/hooks/project";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{64}$/;

export const isValidAddress = (value: string): boolean => {
  return ADDRESS_REGEX.test(value);
};

export interface UseOwnerFilterReturn {
  inputValue: string;
  setInputValue: (value: string) => void;
  resolvedAddress: string | null;
  isPlayerAddress: boolean;
  isValidInput: boolean;
  isAddressInput: boolean;
  suggestions: Account[];
  selectedAccount: Account | null;
  clearOwner: () => void;
}

export function useOwnerFilter(): UseOwnerFilterReturn {
  const [inputValue, setInputValue] = useState("");

  const accountsResult = useAtomValue(accountsAtom);
  const accounts = unwrapOr(accountsResult, []);

  const isAddressInput = useMemo(
    () => isValidAddress(inputValue),
    [inputValue],
  );

  const suggestions = useMemo(() => {
    if (!inputValue.trim() || isAddressInput) {
      return [];
    }
    const searchLower = inputValue.toLowerCase();
    return accounts
      .filter((a) => a.username.toLowerCase().includes(searchLower))
      .slice(0, 10);
  }, [accounts, inputValue, isAddressInput]);

  const selectedAccount = useMemo(() => {
    if (isAddressInput) return null;
    return (
      accounts.find(
        (a) => a.username.toLowerCase() === inputValue.toLowerCase(),
      ) ?? null
    );
  }, [accounts, inputValue, isAddressInput]);

  const { tab, player } = useProject();

  const resolvedAddress = useMemo(() => {
    if (isAddressInput) return inputValue;
    if (selectedAccount) return selectedAccount.address;
    return null;
  }, [tab, player, isAddressInput, inputValue, selectedAccount]);

  const playerAddress = useMemo(
    () => (tab === "inventoryitems" ? (player ?? "0x0") : null),
    [tab, player],
  );

  const isValidInput = resolvedAddress !== null || inputValue === "";

  const clearOwner = useCallback(() => {
    setInputValue("");
  }, []);

  return {
    inputValue,
    setInputValue,
    resolvedAddress: playerAddress ?? resolvedAddress,
    isPlayerAddress: Boolean(playerAddress),
    isValidInput,
    isAddressInput,
    suggestions,
    selectedAccount,
    clearOwner,
  };
}
