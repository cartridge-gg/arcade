import { createContext, type ReactNode, useMemo } from "react";
import { useArcade } from "@/hooks/arcade";
import { erc20Metadata } from "@cartridge/presets";
import { getChecksumAddress, RpcProvider } from "starknet";
import {
  ETH_CONTRACT_ADDRESS,
  STRK_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  useERC20Balance,
  type UseERC20BalanceResponse,
} from "@cartridge/ui/utils";
import { DEFAULT_TOKENS_PROJECT } from "@/constants";
import { useCountervalue, useBalancesQuery } from "@/queries";

const DEFAULT_ERC20_ADDRESSES: string[] = [];

const EXTRA_ERC20_ADDRESSES: string[] = [
  STRK_CONTRACT_ADDRESS,
  ETH_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
];

export type Balance = {
  amount: number;
  value: number;
  change: number;
};

export type Metadata = {
  name: string;
  symbol: string;
  decimals: number;
  address?: string;
  image?: string;
  project?: string;
};

export type Token = {
  balance: Balance;
  metadata: Metadata;
};

export type TokenContextType = {
  tokens: Token[];
  status: "success" | "error" | "pending";
};

export const TokenContext = createContext<TokenContextType | null>(null);

export function TokenProvider({ children }: { children: ReactNode }) {
  const { editions, player: address } = useArcade();

  const provider = useMemo(
    () => new RpcProvider({ nodeUrl: import.meta.env.VITE_RPC_URL }),
    [],
  );
  const projects = useMemo(
    () => editions.map((edition) => edition.config.project),
    [editions],
  );

  const { data: toriiData = {}, status } = useBalancesQuery(projects);

  // Query default ERC20 balances
  const contractAddresses = [
    ...DEFAULT_ERC20_ADDRESSES,
    ...EXTRA_ERC20_ADDRESSES,
  ].filter((address) => !toriiData[address]);
  const { data: rpcData }: UseERC20BalanceResponse = useERC20Balance({
    address: address ? getChecksumAddress(address) : address,
    contractAddress: contractAddresses,
    provider,
    interval: 30000,
  });

  const tokenData = useMemo(
    () =>
      rpcData.map((token) => ({
        balance: `${Number(token.balance.value) / 10 ** (token.meta.decimals || 0)}`,
        address: token.meta.address,
      })),
    [rpcData],
  );

  // Get prices for filtered tokens
  const { countervalues } = useCountervalue({ tokens: tokenData });

  // Merge data
  const data = useMemo(() => {
    const newData: TokenContextType = { tokens: [], status: "success" };
    for (const token of rpcData) {
      const contractAddress = token.meta.address;
      const value = countervalues.find(
        (v) => BigInt(v?.address || "0x0") === BigInt(contractAddress),
      );
      const change = value ? value.current.value - value.period.value : 0;
      const image = erc20Metadata.find(
        (metadata) =>
          getChecksumAddress(metadata.l2_token_address) ===
          getChecksumAddress(contractAddress),
      )?.logo_url;
      const newToken: Token = {
        balance: {
          amount: Number(token.balance.value) / 10 ** token.meta.decimals,
          value: value?.current.value || 0,
          change,
        },
        metadata: {
          project: EXTRA_ERC20_ADDRESSES.includes(
            getChecksumAddress(contractAddress),
          )
            ? DEFAULT_TOKENS_PROJECT
            : undefined,
          name: token.meta.name,
          symbol: token.meta.symbol,
          decimals: token.meta.decimals,
          address: contractAddress,
          image: image,
        },
      };
      newData.tokens?.push(newToken);
    }
    newData.tokens?.push(...Object.values(toriiData));
    newData.status = status;
    return newData;
  }, [rpcData, toriiData, countervalues, status]);

  return <TokenContext.Provider value={data}>{children}</TokenContext.Provider>;
}
