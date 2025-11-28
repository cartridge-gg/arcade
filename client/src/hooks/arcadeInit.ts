import { useEffect, useMemo, useState } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import { ArcadeProvider as ExternalProvider } from "@cartridge/arcade";
import { constants, RpcProvider, shortString } from "starknet";
import type { Chain } from "@starknet-react/chains";
import { editionsAtom } from "@/effect/atoms";
import { unwrapOr } from "@/effect/utils/result";

const CHAIN_ID = constants.StarknetChainId.SN_MAIN;

export const useArcadeInit = () => {
  const [chains, setChains] = useState<Chain[]>([]);

  const editionsResult = useAtomValue(editionsAtom);
  const editions = unwrapOr(editionsResult, []);

  const provider = useMemo(() => new ExternalProvider(CHAIN_ID), []);

  useEffect(() => {
    async function getChains() {
      const chainList: Chain[] = await Promise.all(
        editions.map(async (edition) => {
          const rpcProvider = new RpcProvider({ nodeUrl: edition.config.rpc });
          let id = "0x0";
          try {
            id = await rpcProvider.getChainId();
          } catch {
            // Skip
          }
          return {
            id: BigInt(id),
            name: shortString.decodeShortString(id),
            network: id,
            rpcUrls: {
              default: { http: [edition.config.rpc] },
              public: { http: [edition.config.rpc] },
            },
            nativeCurrency: {
              address: "0x0",
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            paymasterRpcUrls: {
              avnu: {
                http: ["http://localhost:5050"],
              },
            },
          };
        }),
      );
      const uniques = chainList.filter(
        (chain, index) =>
          chain.id !== 0n &&
          index === chainList.findIndex((t) => t.id === chain.id),
      );
      setChains(uniques);
    }
    if (editions.length > 0) {
      getChains();
    }
  }, [editions]);

  return {
    chainId: CHAIN_ID,
    provider,
    chains,
  };
};
