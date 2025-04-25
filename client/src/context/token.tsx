import { createContext, useState, ReactNode, useMemo } from "react";
import { useBalancesQuery } from "@cartridge/utils/api/cartridge";
import { useAddress } from "@/hooks/address";
import { useArcade } from "@/hooks/arcade";
import { erc20Metadata } from "@cartridge/presets";
import { getChecksumAddress, RpcProvider } from "starknet";
import {
  DAI_CONTRACT_ADDRESS,
  ETH_CONTRACT_ADDRESS,
  STRK_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  useCountervalue,
  useERC20Balance,
  UseERC20BalanceResponse,
} from "@cartridge/utils";
import { formatEther } from "viem";

const LIMIT = 1000;

const DEFAULT_ERC20_ADDRESSES = [ETH_CONTRACT_ADDRESS, STRK_CONTRACT_ADDRESS];

const EXTRA_ERC20_ADDRESSES = [
  USDC_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  DAI_CONTRACT_ADDRESS,
  "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49", // LORDS
  "0x01bfe97d729138fc7c2d93c77d6d1d8a24708d5060608017d9b384adf38f04c7", // FLIP
  "0x00e5f10eddc01699dc899a30dbc3c9858148fa4aa0a47c0ffd85f887ffc4653e", // NUMS
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
  status: "success" | "error" | "idle" | "loading";
};

export const TokenContext = createContext<TokenContextType | null>(null);

export function TokenProvider({ children }: { children: ReactNode }) {
  const { address } = useAddress();
  const { projects: slots } = useArcade();

  const [offset, setOffset] = useState(0);
  const [toriiData, setToriiData] = useState<{ [key: string]: Token }>({});

  const provider = useMemo(
    () => new RpcProvider({ nodeUrl: import.meta.env.VITE_RPC_URL }),
    [],
  );
  const projects = useMemo(() => slots.map((slot) => slot.project), [slots]);

  // Query ERC20 balances from torii projects
  const { status } = useBalancesQuery(
    {
      accountAddress: address,
      projects: projects,
      limit: LIMIT,
      offset: offset,
    },
    {
      queryKey: ["balances", offset, address],
      enabled: projects.length > 0 && !!address,
      onSuccess: ({ balances }) => {
        const newTokens: { [key: string]: Token } = {};
        balances?.edges.forEach((e) => {
          const { amount, value, meta } = e.node;
          const {
            project,
            decimals,
            contractAddress,
            name,
            symbol,
            price,
            periodPrice,
          } = meta;
          const previous = price !== 0 ? (value * periodPrice) / price : 0;
          const change = value - previous;
          const image = erc20Metadata.find(
            (m) =>
              getChecksumAddress(m.l2_token_address) ===
              getChecksumAddress(contractAddress),
          )?.logo_url;
          const token: Token = {
            balance: {
              amount: amount,
              value: value,
              change,
            },
            metadata: {
              project,
              name,
              symbol,
              decimals,
              address: contractAddress,
              image,
            },
          };
          newTokens[`${contractAddress}`] = token;
        });
        if (balances?.edges.length === LIMIT) {
          setOffset(offset + LIMIT);
        }
        setToriiData(newTokens);
      },
    },
  );

  // Query default ERC20 balances
  const contractAddresses = [
    ...DEFAULT_ERC20_ADDRESSES,
    ...EXTRA_ERC20_ADDRESSES,
  ].filter((address) => !toriiData[address]);
  const { data: rpcData }: UseERC20BalanceResponse = useERC20Balance({
    address: address,
    contractAddress: contractAddresses,
    provider,
    interval: 3000,
  });

  const tokenData = useMemo(
    () =>
      rpcData.map((token) => ({
        balance: formatEther(token.balance.value || 0n),
        address: token.meta.address,
      })),
    [rpcData],
  );

  // Get prices for filtered tokens
  const { countervalues } = useCountervalue({ tokens: tokenData });

  // Merge data
  const data = useMemo(() => {
    const newData: TokenContextType = { tokens: [], status: "success" };
    rpcData.forEach((token) => {
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
          project: EXTRA_ERC20_ADDRESSES.includes(contractAddress)
            ? "extra"
            : undefined,
          name: token.meta.name,
          symbol: token.meta.symbol,
          decimals: token.meta.decimals,
          address: contractAddress,
          image: image,
        },
      };
      newData.tokens?.push(newToken);
    });
    newData.tokens?.push(...Object.values(toriiData));
    newData.status = status;
    return newData;
  }, [rpcData, toriiData, countervalues, status]);

  return <TokenContext.Provider value={data}>{children}</TokenContext.Provider>;
}
