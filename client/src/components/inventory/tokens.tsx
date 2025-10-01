import { MinusIcon, PlusIcon, Skeleton, TokenCard } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";

import placeholder from "@/assets/placeholder.svg";
import { useAddress } from "@/hooks/address";
import type { Token } from "@/context/token";
import type { EditionModel } from "@cartridge/arcade";
import { useArcade } from "@/hooks/arcade";
import { useProject } from "@/hooks/project";
import { DEFAULT_TOKENS_PROJECT } from "@/constants";
import { useAnalytics } from "@/hooks/useAnalytics";

const DEFAULT_TOKENS_COUNT = 3;

interface TokensProps {
  tokens: Token[];
  credits: Token;
  status: "loading" | "error" | "idle" | "success";
}

export const Tokens = ({ tokens, credits }: TokensProps) => {
  const { editions } = useArcade();
  const { edition } = useProject();
  const [unfolded, setUnfolded] = useState(false);
  const { trackEvent, events } = useAnalytics();

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
        clickable={false}
      />
      {filteredTokens
        .slice(0, unfolded ? filteredTokens.length : DEFAULT_TOKENS_COUNT)
        .map((token) => (
          <Item
            key={token.metadata.address}
            token={token}
            editions={editions}
          />
        ))}
      <div
        className={cn(
          "flex justify-center items-center gap-1 p-2 rounded-b cursor-pointer",
          "bg-background-200 hover:bg-background-300 text-foreground-300 hover:text-foreground-200",
          filteredTokens.length <= DEFAULT_TOKENS_COUNT && "hidden",
        )}
        onClick={() => {
          trackEvent(
            unfolded
              ? events.INVENTORY_VIEW_COLLAPSED
              : events.INVENTORY_VIEW_EXPANDED,
            {
              token_count: filteredTokens.length,
              visible_count: unfolded
                ? filteredTokens.length
                : DEFAULT_TOKENS_COUNT,
            },
          );
          setUnfolded(!unfolded);
        }}
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
  clickable = true,
}: {
  token: Token;
  editions: EditionModel[];
  clickable?: boolean;
}) {
  const { isSelf } = useAddress();
  const { connector } = useAccount();
  const { trackEvent, events } = useAnalytics();

  const edition = useMemo(() => {
    return editions.find(
      (edition) => edition.config.project === token.metadata.project,
    );
  }, [editions, token]);

  const handleClick = useCallback(async () => {
    if (!token.metadata.address) return;

    // Track token click
    trackEvent(events.INVENTORY_TOKEN_CLICKED, {
      token_address: token.metadata.address,
      token_symbol: token.metadata.symbol,
      token_amount: token.balance.amount.toString(),
      token_value: token.balance.value,
      token_project: token.metadata.project || null,
    });

    const controller = (connector as ControllerConnector)?.controller;
    const username = await controller?.username();
    if (!controller || !username) {
      console.error("Connector not initialized");
      return;
    }
    const preset = edition?.properties.preset;
    const options = ["closable=true"];
    if (
      token.metadata.project &&
      token.metadata.project !== DEFAULT_TOKENS_PROJECT
    ) {
      options.push(`ps=${token.metadata.project}`);
    }
    if (preset) {
      options.push(`preset=${preset}`);
    } else {
      options.push(`preset=cartridge`);
    }
    const path = `account/${username}/inventory/token/${token.metadata.address}${options.length > 0 ? `?${options.join("&")}` : ""}`;
    controller.openProfileAt(path);
  }, [token, connector, edition]);

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
