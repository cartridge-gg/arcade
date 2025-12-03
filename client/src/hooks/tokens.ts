import { useMemo } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import { useProject } from "./project";
import { useAddress } from "./address";
import { useAccountByAddress } from "@/effect";
import {
  editionsAtom,
  balancesAtom,
  countervaluesAtom,
  creditsAtom,
  type Token as EffectToken,
} from "@/effect/atoms";
import { unwrap, unwrapOr } from "@/effect/utils/result";
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
import { pinsAtom } from "@/effect/atoms";

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

const provider = new RpcProvider({ nodeUrl: import.meta.env.VITE_RPC_URL });

export const useTokens = () => {
  const { address } = useAddress();
  const { edition } = useProject();

  const editionsResult = useAtomValue(editionsAtom);
  const { value: editions } = unwrap(editionsResult, []);

  const pinsResult = useAtomValue(pinsAtom);
  const pins = unwrapOr(pinsResult, []);
  const playerPin = pins.find(
    (pin) =>
      address &&
      getChecksumAddress(pin.playerId) === getChecksumAddress(address),
  );
  const player = playerPin?.playerId;

  const projects = useMemo(
    () => editions.map((edition) => edition.config.project),
    [editions],
  );

  const balancesResult = useAtomValue(balancesAtom(address ?? "", projects));
  const { value: toriiData, status } = unwrap(
    balancesResult,
    {} as { [key: string]: EffectToken },
  );

  const contractAddresses = [...EXTRA_ERC20_ADDRESSES].filter(
    (addr) => !toriiData[addr],
  );

  const { data: rpcData }: UseERC20BalanceResponse = useERC20Balance({
    address: player ? getChecksumAddress(player) : player,
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

  const countervaluesResult = useAtomValue(countervaluesAtom(tokenData));
  const countervalues = unwrapOr(countervaluesResult, []);

  const allTokens = useMemo(() => {
    const tokens: Token[] = [];
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
      tokens.push(newToken);
    }
    tokens.push(...Object.values(toriiData));
    return tokens;
  }, [rpcData, toriiData, countervalues]);

  const tokens = useMemo(() => {
    if (!edition) return allTokens;
    return allTokens.filter(
      (token) =>
        token.metadata.project === edition.config.project ||
        !token.metadata.project,
    );
  }, [allTokens, edition]);

  const { data: account } = useAccountByAddress(address);

  const creditsResult = useAtomValue(creditsAtom(account?.username));
  const creditBalance = unwrapOr(creditsResult, null) ?? {
    amount: 0,
    decimals: 6,
  };

  const credits: Token = useMemo(() => {
    return {
      balance: {
        amount: Number(creditBalance.amount) / 10 ** creditBalance.decimals,
        value: 0,
        change: 0,
      },
      metadata: {
        name: "Credits",
        symbol: "Credits",
        decimals: creditBalance.decimals,
        address: "credit",
        image: "https://static.cartridge.gg/presets/credit/icon.svg",
      },
    };
  }, [creditBalance]);

  return { tokens, status, credits };
};
