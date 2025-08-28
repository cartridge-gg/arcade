import { useContext, useMemo } from "react";
import { Token, TokenContext } from "../../context/token";
import { useCreditBalance } from "@cartridge/ui/utils";
import { useAccountNameQuery } from "../users/accounts";

export * from "./balances";
export * from "./prices";
export * from "./credits";

// Re-export common types
export type { TokenBalance, BalancesResponse } from "./balances";
export type { TokenPrice, PricesResponse } from "./prices";
export type { Credits } from "./credits";

/**
 * Query hook equivalent of useTokens that accesses Token context and account information.
 * Must be used within a TokenProvider component.
 *
 * @param address - The user's address
 * @param edition - The current edition object with config.project
 * @returns An object containing:
 * - tokens: The registered tokens
 * - status: The status of the tokens
 * - credits: The credits token object
 * @throws {Error} If used outside of a TokenProvider context
 */
export const useTokensQuery = ({
  address,
  edition,
}: {
  address: string;
  edition?: { config: { project: string } };
}) => {
  const context = useContext(TokenContext);

  if (!context) {
    throw new Error(
      "The `useTokensQuery` hook must be used within a `TokenProvider`",
    );
  }

  const { tokens: allTokens, status } = context;

  const tokens = useMemo(() => {
    if (!edition) return allTokens;
    return allTokens.filter(
      (token) =>
        token.metadata.project === edition.config.project ||
        !token.metadata.project,
    );
  }, [allTokens, edition]);

  const { data: accountData } = useAccountNameQuery(address);
  const username = accountData?.accounts?.edges?.[0]?.node?.username ?? "";

  const creditBalance = useCreditBalance({
    username,
    interval: 30000,
  });

  const credits: Token = useMemo(() => {
    return {
      balance: {
        amount: Number(creditBalance.balance.value),
        value: 0,
        change: 0,
      },
      metadata: {
        name: "Credits",
        symbol: "Credits",
        decimals: 0,
        image: "https://static.cartridge.gg/presets/credit/icon.svg",
      },
    };
  }, [creditBalance]);

  return { tokens, status, credits };
};

