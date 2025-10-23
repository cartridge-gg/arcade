import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "@starknet-react/core";
import type ControllerConnector from "@cartridge/connector/controller";
import placeholder from "@/assets/placeholder.svg";
import { useArcade } from "@/hooks/arcade";
import { useProject } from "@/hooks/project";
import { DEFAULT_TOKENS_PROJECT } from "@/constants";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAddress } from "@/hooks/address";
import type { Token } from "@/context/token";

const DEFAULT_TOKENS_COUNT = 3;

export interface InventoryTokenCardView {
  id: string;
  image: string;
  title: string;
  amount: string;
  value?: string;
  change?: string;
  isClickable: boolean;
  onClick?: () => void;
}

export interface InventoryTokensViewModel {
  isLoading: boolean;
  creditsCard: InventoryTokenCardView;
  tokenCards: InventoryTokenCardView[];
  canToggle: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

interface UseInventoryTokensViewModelArgs {
  tokens: Token[];
  credits: Token;
  status: "success" | "error" | "pending";
}

const formatAmount = (amount: number, symbol: string) => {
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${symbol}`;
};

const formatValue = (value?: number) => {
  if (value === undefined || value === null) return "";
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatChange = (change: number) => {
  if (change === 0) return undefined;
  const formatted = Math.abs(change).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return change > 0 ? `+$${formatted}` : `-$${formatted}`;
};

export function useInventoryTokensViewModel({
  tokens,
  credits,
  status,
}: UseInventoryTokensViewModelArgs): InventoryTokensViewModel {
  const { editions } = useArcade();
  const { edition } = useProject();
  const { isSelf } = useAddress();
  const { connector } = useAccount();
  const { trackEvent, events } = useAnalytics();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
  }, [edition]);

  const filteredTokens = useMemo(() => {
    return tokens
      .filter((token) => token.balance.amount > 0)
      .sort((a, b) => b.balance.value - a.balance.value);
  }, [tokens]);

  const visibleTokens = useMemo(() => {
    return filteredTokens.slice(
      0,
      isExpanded ? filteredTokens.length : DEFAULT_TOKENS_COUNT,
    );
  }, [filteredTokens, isExpanded]);

  const canToggle = filteredTokens.length > DEFAULT_TOKENS_COUNT;

  const handleTokenClick = useCallback(
    async (token: Token, preset?: string) => {
      if (!token.metadata.address) return;

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
        options.push("preset=cartridge");
      }

      const path = `account/${username}/inventory/token/${token.metadata.address}${options.length > 0 ? `?${options.join("&")}` : ""}`;
      controller.openProfileAt(path);
    },
    [connector, trackEvent, events],
  );

  const creditsCard: InventoryTokenCardView = useMemo(
    () => ({
      id: credits.metadata.address ?? "credits",
      image: credits.metadata.image || placeholder,
      title: credits.metadata.name,
      amount: formatAmount(credits.balance.amount, credits.metadata.symbol),
      value: formatValue(credits.balance.value),
      change: formatChange(credits.balance.change),
      isClickable: false,
    }),
    [credits],
  );

  const tokenCards: InventoryTokenCardView[] = useMemo(() => {
    return visibleTokens.map((token) => {
      const editionForToken = editions.find(
        (item) => item.config.project === token.metadata.project,
      );
      return {
        id:
          token.metadata.address ??
          `${token.metadata.name}-${token.balance.amount}`,
        image: token.metadata.image || placeholder,
        title: token.metadata.name,
        amount: formatAmount(token.balance.amount, token.metadata.symbol),
        value: formatValue(token.balance.value),
        change: formatChange(token.balance.change),
        isClickable: Boolean(isSelf),
        onClick: isSelf
          ? () => handleTokenClick(token, editionForToken?.properties.preset)
          : undefined,
      };
    });
  }, [visibleTokens, editions, isSelf, handleTokenClick]);

  const onToggle = useCallback(() => {
    trackEvent(
      isExpanded
        ? events.INVENTORY_VIEW_COLLAPSED
        : events.INVENTORY_VIEW_EXPANDED,
      {
        token_count: filteredTokens.length,
        visible_count: isExpanded
          ? filteredTokens.length
          : DEFAULT_TOKENS_COUNT,
      },
    );
    setIsExpanded((prev) => !prev);
  }, [filteredTokens.length, isExpanded, trackEvent, events]);

  return {
    isLoading: status === "pending",
    creditsCard,
    tokenCards,
    canToggle,
    isExpanded,
    onToggle,
  };
}
