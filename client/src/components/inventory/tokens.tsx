import {
  cn,
  MinusIcon,
  PlusIcon,
  Skeleton,
  TokenCard,
} from "@cartridge/ui-next";
import { useCallback, useEffect, useMemo, useState } from "react";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";

import placeholder from "@/assets/placeholder.svg";
import { useAddress } from "@/hooks/address";
import { Token } from "@/context/token";
import { Chain, mainnet } from "@starknet-react/chains";
import { EditionModel } from "@bal7hazar/arcade-sdk";
import { useArcade } from "@/hooks/arcade";
import { useProject } from "@/hooks/project";

const DEFAULT_TOKENS_COUNT = 3;

interface TokensProps {
  tokens: Token[];
  credits: Token;
  status: "loading" | "error" | "idle" | "success";
}

export const Tokens = ({ tokens, credits }: TokensProps) => {
  const { editions, chains } = useArcade();
  const { edition } = useProject();
  const [unfolded, setUnfolded] = useState(false);

  useEffect(() => {
    setUnfolded(false);
  }, [edition]);

  const filteredTokens = useMemo(() => {
    return tokens
      .filter((token) => token.balance.amount > 0)
      .sort((a, b) => b.balance.value - a.balance.value);
  }, [tokens]);

  return (
    <div
      className={cn("rounded overflow-y-scroll w-full flex flex-col gap-y-px")}
      style={{ scrollbarWidth: "none" }}
    >
      <Item
        key={credits.metadata.address}
        token={credits}
        editions={editions}
        chains={chains}
        clickable={false}
      />
      {filteredTokens
        .slice(0, unfolded ? filteredTokens.length : DEFAULT_TOKENS_COUNT)
        .map((token) => (
          <Item
            key={token.metadata.address}
            token={token}
            editions={editions}
            chains={chains}
          />
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

function Item({
  token,
  editions,
  chains,
  clickable = true,
}: {
  token: Token;
  editions: EditionModel[];
  chains: Chain[];
  clickable?: boolean;
}) {
  const { isSelf } = useAddress();
  const { connector } = useAccount();
  const [username, setUsername] = useState<string>("");

  const edition = useMemo(() => {
    return editions.find(
      (edition) => edition.config.project === token.metadata.project,
    );
  }, [editions, token]);

  const chain: Chain = useMemo(() => {
    return (
      chains.find(
        (chain) => chain.rpcUrls.default.http[0] === edition?.config.rpc,
      ) || mainnet
    );
  }, [chains, edition]);

  useEffect(() => {
    async function fetch() {
      try {
        const name = await (connector as ControllerConnector)?.username();
        if (!name) return;
        setUsername(name);
      } catch (error) {
        console.error(error);
      }
    }
    fetch();
  }, [connector]);

  const handleClick = useCallback(async () => {
    if (!username || !token.metadata.address) return;
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) {
      console.error("Connector not initialized");
      return;
    }
    const preset = edition?.properties.preset;
    let options = [];
    if (token.metadata.project && token.metadata.project !== "extra") {
      options.push(`ps=${token.metadata.project}`, "closable=true");
    }
    if (preset) {
      options.push(`preset=${preset}`);
    } else {
      options.push(`preset=cartridge`);
    }
    const path = `inventory/token/${token.metadata.address}${options.length > 0 ? `?${options.join("&")}` : ""}`;
    controller.switchStarknetChain(`0x${chain.id.toString(16)}`);
    controller.openProfileTo(path);
  }, [token, username, connector, edition]);

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
      onClick={isSelf && clickable ? handleClick : undefined}
      className={
        isSelf && clickable
          ? "cursor-pointer"
          : "cursor-default hover:bg-background-200"
      }
    />
  );
}

export const LoadingState = () => {
  return (
    <div className="flex flex-col gap-y-px overflow-hidden h-full">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="min-h-16 w-full" />
      ))}
      <Skeleton className="min-h-9 w-full" />
    </div>
  );
};
