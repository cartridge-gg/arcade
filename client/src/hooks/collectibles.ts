import { useState, useEffect } from "react";
import { fetchToriis, type ClientCallbackParams } from "@cartridge/arcade";
import {
  CollectionType,
  type EnrichedTokenContract,
} from "@/effect/atoms/tokens";
import { addAddressPadding } from "starknet";
import type { TokenBalance } from "@dojoengine/torii-wasm";

export type UseCollectibleBalancesResult = {
  balances: { [key: string]: number };
  status: "idle" | "loading" | "success" | "error";
  error: Error | null;
  refetch: () => void;
};

/**
 * Custom hook for fetching token balances from Torii endpoints
 *
 * @param projects - Array of project identifiers to fetch tokens from
 * @param address - User's wallet address to fetch balances for
 * @returns Object containing tokens, loading status, error state, and refetch function
 *
 * @example
 * ```ts
 * const { tokens, status, error, refetch } = useTokenFetcher(
 *   ['arcade-blobarena', 'arcade-main'],
 *   '0x123...'
 * );
 * ```
 */
export function useCollectibleBalances(
  contract: EnrichedTokenContract | null | undefined,
  accountAddress: string | undefined,
  tokenIds: string[],
): UseCollectibleBalancesResult {
  const [balances, setBalances] = useState<{ [key: string]: number }>({});
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<Error | null>(null);

  const fetchTokens = async () => {
    if (
      !accountAddress ||
      !contract ||
      contract.contract_type !== CollectionType.ERC1155
    ) {
      setStatus("idle");
      setBalances({});
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const result = await fetchToriis([contract.project], {
        client: async ({ client }: ClientCallbackParams) => {
          let iterate = true;
          let next_cursor = undefined;
          let tokenBalances: TokenBalance[] = [];

          while (iterate) {
            // Fetch token balances
            const response: any = await client.getTokenBalances({
              contract_addresses: [contract.contract_address],
              account_addresses: [addAddressPadding(accountAddress)],
              token_ids: tokenIds.map((id) =>
                addAddressPadding(id).replace("0x", ""),
              ),
              pagination: {
                cursor: next_cursor,
                direction: "Forward",
                limit: 1000,
                order_by: [],
              },
            });

            if (response.items && response.items.length > 0) {
              tokenBalances = tokenBalances.concat(
                response.items as TokenBalance[],
              );
            }

            if (!response.next_cursor) {
              iterate = false;
              break;
            }

            next_cursor = response.next_cursor;
          }

          return tokenBalances;
        },
      });

      const newBalances: { [key: string]: number } = {};

      const tokenBalances = result.data[0] as TokenBalance[];
      tokenBalances.forEach((balance) => {
        const b = BigInt(balance.balance ?? 0);
        if (balance.token_id && b > 0n) {
          newBalances[balance.token_id] = Number(b);
        }
      });

      setBalances((prev) => ({
        ...prev,
        ...newBalances,
      }));

      setStatus("success");
    } catch (err) {
      console.error("Error fetching tokens:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch tokens"),
      );
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract?.contract_address, accountAddress, tokenIds]); // Using join to create stable dependency

  const refetch = () => {
    fetchTokens();
  };

  return {
    balances,
    status,
    error,
    refetch,
  };
}
