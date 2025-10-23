import { createContext, type ReactNode, useMemo } from "react";
import { useArcade } from "@/hooks/arcade";
import { useTransfersQuery, useActivitiesQuery } from "@/queries";
import {
  addAddressPadding,
  type constants,
  getChecksumAddress,
} from "starknet";
import { useAchievements } from "@/hooks/achievements";
import { erc20Metadata } from "@cartridge/presets";
import { getDate } from "@cartridge/ui/utils";
import { getChainId } from "@/lib/helpers";

export interface CardProps {
  variant: "token" | "collectible" | "game" | "achievement";
  key: string;
  project: string;
  chainId: constants.StarknetChainId;
  contractAddress: string;
  transactionHash: string;
  amount: string;
  address: string;
  value: string;
  name: string;
  collection: string;
  image: string;
  title: string;
  website: string;
  certified: boolean;
  action: "send" | "receive" | "mint";
  timestamp: number;
  date: string;
  points?: number;
  color?: string;
}

export type ActivitiesContextType = {
  erc20s: { [project: string]: CardProps[] };
  erc721s: { [project: string]: CardProps[] };
  actions: { [project: string]: CardProps[] };
  trophies: { [project: string]: CardProps[] };
  status: "success" | "error" | "idle" | "loading";
};

export const ActivitiesContext = createContext<ActivitiesContextType | null>(
  null,
);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const { games, editions, player: address } = useArcade();

  const { achievements } = useAchievements();

  const { data: transfers, status: transfersStatus } = useTransfersQuery();

  const { data: transactions, status: transactionsStatus } =
    useActivitiesQuery();

  const status = useMemo(() => {
    return transfersStatus === "pending" || transactionsStatus === "pending"
      ? "loading"
      : transfersStatus === "error" || transactionsStatus === "error"
        ? "error"
        : "success";
  }, [transfersStatus, transactionsStatus]);

  const erc20s: { [project: string]: CardProps[] } = useMemo(() => {
    const results: { [project: string]: CardProps[] } = {};
    transfers?.transfers?.items.forEach((item) => {
      item.transfers
        .filter((transfer) => BigInt(transfer.tokenId) === 0n)
        .forEach((transfer) => {
          const value = `${(BigInt(transfer.amount) / BigInt(10 ** Number(transfer.decimals))).toString()} ${transfer.symbol}`;
          const timestamp = new Date(transfer.executedAt).getTime();
          const date = getDate(timestamp);
          const image = erc20Metadata.find(
            (m) =>
              getChecksumAddress(m.l2_token_address) ===
              getChecksumAddress(transfer.contractAddress),
          )?.logo_url;
          const edition = editions.find(
            (edition) => edition.config.project === item.meta.project,
          );
          const chainId = getChainId(edition?.config.rpc);
          const card: CardProps = {
            variant: "token",
            key: `${transfer.transactionHash}-${transfer.eventId}`,
            project: item.meta.project,
            contractAddress: getChecksumAddress(transfer.contractAddress),
            transactionHash: getChecksumAddress(transfer.transactionHash),
            amount: value,
            address:
              BigInt(transfer.fromAddress) === BigInt(address || "0x0")
                ? getChecksumAddress(transfer.toAddress)
                : getChecksumAddress(transfer.fromAddress),
            value: "$-",
            image: image || "",
            action:
              BigInt(transfer.fromAddress) === 0n
                ? "mint"
                : BigInt(transfer.fromAddress) === BigInt(address || "0x0")
                  ? "send"
                  : "receive",
            timestamp: timestamp / 1000,
            date: date,
            chainId,
          } as CardProps;
          if (!results[item.meta.project]) {
            results[item.meta.project] = [];
          }
          results[item.meta.project].push(card);
        });
    });
    return results;
  }, [transfers, address]);

  const erc721s: { [project: string]: CardProps[] } = useMemo(() => {
    const results: { [project: string]: CardProps[] } = {};
    transfers?.transfers?.items.forEach((item) => {
      item.transfers
        .filter((transfer) => BigInt(transfer.tokenId) > 0n)
        .forEach((transfer) => {
          const timestamp = new Date(transfer.executedAt).getTime();
          const date = getDate(timestamp);
          let metadata;
          try {
            metadata = JSON.parse(
              !transfer.metadata ? "{}" : transfer.metadata,
            );
          } catch (error) {
            console.warn(error);
          }
          const name =
            metadata.attributes?.find(
              (attribute: { trait: string; value: string }) =>
                attribute?.trait?.toLowerCase() === "name",
            )?.value || metadata.name;
          const edition = editions.find(
            (edition) => edition.config.project === item.meta.project,
          );
          const chainId = getChainId(edition?.config.rpc);
          const image = `https://api.cartridge.gg/x/${item.meta.project}/torii/static/${addAddressPadding(transfer.contractAddress)}/${addAddressPadding(transfer.tokenId)}/image`;
          const card: CardProps = {
            variant: "collectible",
            key: `${transfer.transactionHash}-${transfer.eventId}`,
            project: item.meta.project,
            contractAddress: getChecksumAddress(transfer.contractAddress),
            transactionHash: getChecksumAddress(transfer.transactionHash),
            name: name || "",
            collection: transfer.name,
            amount: "",
            address:
              BigInt(transfer.fromAddress) === BigInt(address || "0x0")
                ? getChecksumAddress(transfer.toAddress)
                : getChecksumAddress(transfer.fromAddress),
            value: "",
            image: image,
            action:
              BigInt(transfer.fromAddress) === 0n
                ? "mint"
                : BigInt(transfer.fromAddress) === BigInt(address || "0x0")
                  ? "send"
                  : "receive",
            timestamp: timestamp / 1000,
            date: date,
            chainId,
          } as CardProps;
          if (!results[item.meta.project]) {
            results[item.meta.project] = [];
          }
          results[item.meta.project].push(card);
        });
    });
    return results;
  }, [transfers, address]);

  const actions: { [project: string]: CardProps[] } = useMemo(() => {
    const results: { [project: string]: CardProps[] } = {};
    transactions?.activities?.items.forEach((item) => {
      item.activities?.forEach(
        ({ transactionHash, contractAddress, entrypoint, executedAt }) => {
          const timestamp = new Date(executedAt).getTime();
          const date = getDate(timestamp);
          const project = item.meta.project;
          const edition = editions.find(
            (edition) => edition.config.project === project,
          );
          const game = games.find((game) => game.id === edition?.gameId);
          const chainId = getChainId(edition?.config.rpc);
          const card: CardProps = {
            variant: "game",
            key: `${transactionHash}-${entrypoint}`,
            project: item.meta.project,
            contractAddress: getChecksumAddress(contractAddress),
            transactionHash: getChecksumAddress(transactionHash),
            title: entrypoint.replace(/_/g, " "),
            image: game?.properties.icon || "",
            website: edition?.socials.website || "",
            certified: !!game,
            timestamp: timestamp / 1000,
            date: date,
            chainId,
          } as CardProps;
          if (!results[project]) {
            results[project] = [];
          }
          results[project].push(card);
        },
      );
    });
    return results;
  }, [transactions, games, editions]);

  const trophies: { [project: string]: CardProps[] } = useMemo(() => {
    const results: { [project: string]: CardProps[] } = {};
    Object.entries(achievements).forEach(([project, gameAchievements]) => {
      const edition = editions.find(
        (edition) => edition.config.project === project,
      );
      const game = games.find((game) => game.id === edition?.gameId);
      gameAchievements
        .filter((item) => item.completed)
        .forEach((item) => {
          const date = getDate(item.timestamp * 1000);
          const card = {
            variant: "achievement",
            key: item.id,
            transactionHash: "",
            contractAddress: "",
            title: item.title,
            image: item.icon,
            timestamp: item.timestamp,
            date: date,
            website: edition?.socials.website || "",
            certified: !!game,
            points: item.earning,
            amount: "",
            address: "",
            value: "",
            name: "",
            collection: "",
            action: "mint",
            color: edition?.color,
            chainId: getChainId(edition?.config.rpc),
          } as CardProps;
          if (!results[project]) {
            results[project] = [];
          }
          results[project].push(card);
        });
    });
    return results;
  }, [achievements, games, editions]);

  return (
    <ActivitiesContext.Provider
      value={{
        erc20s,
        erc721s,
        actions,
        trophies,
        status,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}
