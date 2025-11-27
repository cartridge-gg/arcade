import { useMemo, useCallback } from "react";
import { VoyagerUrl } from "@cartridge/ui/utils";
import type { constants } from "starknet";
import { useActivities, type CardProps } from "@/hooks/activities";

export type ActivityEventVariant =
  | "token"
  | "collectible"
  | "game"
  | "achievement";

export interface ActivityEventView {
  key: string;
  variant: ActivityEventVariant;
  href?: string;
  amount?: string;
  address?: string;
  value?: string;
  image?: string;
  action?: "send" | "receive" | "mint";
  name?: string;
  collection?: string;
  title?: string;
  website?: string;
  certified?: boolean;
  points?: number;
  color?: string;
}

export interface ActivityDateGroup {
  date: string;
  events: ActivityEventView[];
}

export interface ActivityViewModel {
  status: "loading" | "error" | "idle" | "success" | "empty";
  groups: ActivityDateGroup[];
  canLoadMore: boolean;
}

interface UseActivityViewModelArgs {
  cap: number;
}

export function useActivityViewModel({
  cap,
}: UseActivityViewModelArgs): ActivityViewModel {
  const { activities, status } = useActivities();

  const limit = cap < 0 ? activities.length : cap;

  const toExplorer = useCallback(
    (transactionHash: string, chainId: constants.StarknetChainId) => {
      return VoyagerUrl(chainId).transaction(transactionHash);
    },
    [],
  );

  const limitedActivities = useMemo(() => {
    return activities.slice(0, limit);
  }, [activities, limit]);

  const groups = useMemo(() => {
    const orderedDates: string[] = [];
    const grouped = new Map<string, ActivityEventView[]>();

    const convert = (card: CardProps): ActivityEventView => {
      const href = card.transactionHash
        ? toExplorer(card.transactionHash, card.chainId)
        : undefined;

      switch (card.variant) {
        case "token":
          return {
            key: card.key,
            variant: "token",
            href,
            amount: card.amount,
            address: card.address,
            value: card.value,
            image: card.image,
            action: card.action,
          };
        case "collectible":
          return {
            key: card.key,
            variant: "collectible",
            href,
            name: card.name,
            collection: card.collection,
            address: card.address,
            image: card.image,
            action: card.action,
          };
        case "game":
          return {
            key: card.key,
            variant: "game",
            href,
            title: card.title,
            website: card.website,
            image: card.image,
            certified: card.certified,
          };
        case "achievement":
          return {
            key: card.key,
            variant: "achievement",
            title: card.title,
            image: card.image,
            certified: card.certified,
            points: card.points,
            website: card.website,
            color: card.color,
          };
      }
    };

    limitedActivities.forEach((card) => {
      if (!orderedDates.includes(card.date)) {
        orderedDates.push(card.date);
      }
      const event = convert(card);
      const existing = grouped.get(card.date) || [];
      existing.push(event);
      grouped.set(card.date, existing);
    });

    return orderedDates.map((date) => ({
      date,
      events: grouped.get(date) ?? [],
    }));
  }, [limitedActivities, toExplorer]);

  const canLoadMore = useMemo(() => {
    return limit < activities.length;
  }, [limit, activities.length]);

  const derivedStatus: ActivityViewModel["status"] =
    status === "loading" && limitedActivities.length === 0
      ? "loading"
      : status === "error"
        ? "error"
        : limitedActivities.length === 0
          ? "empty"
          : "success";

  return {
    status: derivedStatus,
    groups,
    canLoadMore,
  };
}
