import { useTokens } from "@/hooks/token";
import {
  Card,
  CardHeader,
  CardTitle,
  CardListContent,
  CardListItem,
} from "@cartridge/ui-next";
import { Balance, ERC20Metadata, useCountervalue } from "@cartridge/utils";
import { TokenPair } from "@cartridge/utils/api/cartridge";
import { formatEther } from "viem";
import { formatBalance } from "@/helpers";
import { useMemo } from "react";
import { CoinsIcon } from "@cartridge/ui-next";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";

export const Inventory = () => {
  return (
    <div className="w-3/4">
      <Tokens />
    </div>
  );
};

export const Tokens = () => {
  const tokenAddresses = useMemo(
    () => [
      "0x061c54ec0285bc41ca6823c9a6758cb3555cb1d2479f3758dadd0f6f6a94c6bd",
      "0x019c92fa87f4d5e3be25c3dd6a284f30282a07e87cd782f5fd387b82c8142017",
      "0x027ef4670397069d7d5442cb7945b27338692de0d8896bdb15e6400cf5249f94",
      "0x044e6bcc627e6201ce09f781d1aae44ea4c21c2fdef299e34fce55bef2d02210",
    ],
    [],
  );
  const erc20 = useTokens(undefined, tokenAddresses);

  const tokens = useMemo(
    () =>
      erc20.data
        .filter(
          (token) =>
            !tokenAddresses.includes(token.meta.address) ||
            token.balance.value > 0n,
        )
        .map((t) => ({
          balance: t.balance,
          meta: t.meta,
        })),
    [erc20.data],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokens</CardTitle>
      </CardHeader>

      <CardListContent>
        {tokens.map((token) => (
          <TokenCardContent token={token} key={token.meta.address} />
        ))}
      </CardListContent>
    </Card>
  );
};

function TokenCardContent({
  token,
}: {
  token: { balance: Balance; meta: ERC20Metadata };
}) {
  const { connector } = useAccount();

  const { countervalue } = useCountervalue({
    balance: formatEther(token.balance.value || 0n),
    pair: `${token.meta.symbol}_USDC` as TokenPair,
  });

  const handleClick = async () => {
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) {
      console.error("Connector not initialized");
      return;
    }
    controller.openProfile("inventory");
  };

  return (
    <CardListItem
      icon={token.meta.logoUrl ?? <CoinsIcon variant="line" />}
      className="hover:opacity-80"
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        {formatBalance(token.balance.formatted, ["~"])}
        <span className="text-muted-foreground">{token.meta.symbol}</span>
      </div>

      {countervalue && (
        <div className="text-muted-foreground">
          {formatBalance(countervalue.formatted, ["~"])}
        </div>
      )}
    </CardListItem>
  );
}
