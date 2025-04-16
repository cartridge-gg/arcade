import { useContext, useMemo } from "react";
import { Token, TokenContext } from "../context/token";
import { useProject } from "./project";
import { useCreditBalance } from "@cartridge/utils";
import { useUsername } from "./account";
import { useAddress } from "./address";

/**
 * Custom hook to access the Token context and account information.
 * Must be used within a TokenProvider component.
 *
 * @returns An object containing:
 * - tokens: The registered tokens
 * - status: The status of the tokens
 * @throws {Error} If used outside of a TokenProvider context
 */
export const useTokens = () => {
  const { address } = useAddress();
  const context = useContext(TokenContext);
  const { project } = useProject();

  if (!context) {
    throw new Error(
      "The `useTokens` hook must be used within a `TokenProvider`",
    );
  }

  const { tokens: allTokens, status } = context;

  const tokens = useMemo(() => {
    if (!project) return allTokens;
    return allTokens.filter(
      (token) => token.metadata.project === project || !token.metadata.project,
    );
  }, [allTokens, project]);

  const { username } = useUsername({ address });

  const creditBalance = useCreditBalance({
    username,
    interval: 3000,
  });
  const credits: Token = useMemo(() => {
    return {
      balance: {
        amount: Number(creditBalance.balance.value),
        value: Number(creditBalance.balance.value) / 10,
        change: 0,
      },
      metadata: {
        name: "Credits",
        symbol: "Credits",
        decimals: 0,
        address: "0x0",
        image: "https://static.cartridge.gg/presets/credit/icon.svg",
      },
    };
  }, [creditBalance]);

  return { tokens, status, credits };
};
