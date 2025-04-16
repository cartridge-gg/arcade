import { useTokens } from "@/hooks/tokens";
import { cn, MinusIcon, PlusIcon, TokenCard } from "@cartridge/ui-next";
import { useCallback, useMemo, useState } from "react";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";

import placeholder from "@/assets/placeholder.svg";
import { useAddress } from "@/hooks/address";
import { Token } from "@/context/token";

const DEFAULT_TOKENS_COUNT = 3;

export const Tokens = () => {
  const [unfolded, setUnfolded] = useState(false);
  const { tokens, credits } = useTokens();

  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => token.balance.amount > 0);
  }, [tokens]);

  return (
    <div
      className={cn("rounded overflow-y-scroll w-full flex flex-col gap-y-px")}
      style={{ scrollbarWidth: "none" }}
    >
      <Item key={credits.metadata.address} token={credits} />
      {filteredTokens
        .slice(0, unfolded ? filteredTokens.length : DEFAULT_TOKENS_COUNT)
        .map((token) => (
          <Item key={token.metadata.address} token={token} />
        ))}
      <div
        className={cn(
          "flex justify-center items-center gap-1 p-2 rounded-b cursor-pointer",
          "bg-background-200 hover:bg-background-300 text-foreground-300 hover:text-foreground-200",
          filteredTokens.length <= DEFAULT_TOKENS_COUNT && "hidden",
        )}
        onClick={() => setUnfolded(!unfolded)}
      >
        {unfolded ? (
          <MinusIcon size="xs" />
        ) : (
          <PlusIcon variant="solid" size="xs" />
        )}
        <p className="text-sm font-medium">
          {unfolded ? "Show Less" : "View All"}
        </p>
      </div>
    </div>
  );
};

function Item({ token }: { token: Token }) {
  const { connector } = useAccount();
  const { isSelf } = useAddress();

  const handleClick = useCallback(async () => {
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) {
      console.error("Connector not initialized");
      return;
    }
    const path = `inventory/token/${token.metadata.address}/send`;
    controller.openProfileTo(path);
  }, [token.metadata.address, connector]);

  return (
    <TokenCard
      image={token.metadata.image || placeholder}
      title={token.metadata.name}
      amount={`${token.balance.amount.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${token.metadata.symbol}`}
      value={
        token.balance.value
          ? `$${token.balance.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
          : ""
      }
      change={
        token.balance.change === 0
          ? undefined
          : token.balance.change > 0
            ? `+$${token.balance.change.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
            : `-$${(-token.balance.change).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      }
      onClick={isSelf ? handleClick : undefined}
      className={
        isSelf ? "cursor-pointer" : "cursor-default hover:bg-background-200"
      }
    />
  );
}
