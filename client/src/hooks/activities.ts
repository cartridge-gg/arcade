import { useMemo } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import { useProject } from "./project";
import { useAddress } from "./address";
import { useAchievements } from "./achievements";
import {
  editionsAtom,
  gamesAtom,
  pinsAtom,
  transfersAtom,
  activitiesAtom,
  type TransferProject,
  type ActivityProject,
} from "@/effect/atoms";
import { unwrapOr, toStatus } from "@/effect/utils/result";
import {
  addAddressPadding,
  type constants,
  getChecksumAddress,
} from "starknet";
import { erc20Metadata } from "@cartridge/presets";
import { getDate } from "@cartridge/ui/utils";
import { getChainId } from "@/lib/helpers";
import { getToriiAssetUrl } from "@cartridge/arcade";

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

export const useActivities = () => {
  const { edition } = useProject();
  const { address } = useAddress();
  const { achievements } = useAchievements();

  const editionsResult = useAtomValue(editionsAtom);
  const editions = unwrapOr(editionsResult, []);

  const gamesResult = useAtomValue(gamesAtom);
  const games = unwrapOr(gamesResult, []);

  const pinsResult = useAtomValue(pinsAtom);
  const pins = unwrapOr(pinsResult, []);
  const playerPin = pins.find(
    (pin) =>
      address &&
      getChecksumAddress(pin.playerId) === getChecksumAddress(address),
  );
  const player = playerPin?.playerId;

  const transferProjects: TransferProject[] = useMemo(() => {
    return editions.map((edition) => ({
      project: edition.config.project,
      address: `0x${BigInt(player ?? "0x0").toString(16)}`,
      limit: 0,
      date: "",
    }));
  }, [editions, player]);

  const activityProjects: ActivityProject[] = useMemo(() => {
    return editions.map((edition) => ({
      project: edition.config.project,
      address: `0x${BigInt(player ?? "0x0").toString(16)}`,
      limit: 0,
    }));
  }, [editions, player]);

  const transfersResult = useAtomValue(transfersAtom(transferProjects));
  const activitiesResult = useAtomValue(activitiesAtom(activityProjects));

  const transfers = unwrapOr(transfersResult, []);
  const transactions = unwrapOr(activitiesResult, []);

  const status = useMemo(() => {
    const transfersStatus = toStatus(transfersResult);
    const transactionsStatus = toStatus(activitiesResult);
    return transfersStatus === "pending" || transactionsStatus === "pending"
      ? "loading"
      : transfersStatus === "error" || transactionsStatus === "error"
        ? "error"
        : "success";
  }, [transfersResult, activitiesResult]);

  const erc20s: { [project: string]: CardProps[] } = useMemo(() => {
    const results: { [project: string]: CardProps[] } = {};
    transfers.forEach((item) => {
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
          const ed = editions.find(
            (ed) => ed.config.project === item.meta.project,
          );
          const chainId = getChainId(ed?.config.rpc);
          const card: CardProps = {
            variant: "token",
            key: `${transfer.transactionHash}-${transfer.eventId}`,
            project: item.meta.project,
            contractAddress: getChecksumAddress(transfer.contractAddress),
            transactionHash: getChecksumAddress(transfer.transactionHash),
            amount: value,
            address:
              BigInt(transfer.fromAddress) === BigInt(player || "0x0")
                ? getChecksumAddress(transfer.toAddress)
                : getChecksumAddress(transfer.fromAddress),
            value: "$-",
            image: image || "",
            action:
              BigInt(transfer.fromAddress) === 0n
                ? "mint"
                : BigInt(transfer.fromAddress) === BigInt(player || "0x0")
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
  }, [transfers, player, editions]);

  const erc721s: { [project: string]: CardProps[] } = useMemo(() => {
    const results: { [project: string]: CardProps[] } = {};
    transfers.forEach((item) => {
      item.transfers
        .filter((transfer) => BigInt(transfer.tokenId) > 0n)
        .forEach((transfer) => {
          const timestamp = new Date(transfer.executedAt).getTime();
          const date = getDate(timestamp);
          let metadata;
          try {
            const metadataStr = transfer.metadata as string | null | undefined;
            metadata = JSON.parse(!metadataStr ? "{}" : metadataStr);
          } catch (error) {
            console.warn(error);
          }
          const name =
            metadata.attributes?.find(
              (attribute: { trait: string; value: string }) =>
                attribute?.trait?.toLowerCase() === "name",
            )?.value || metadata.name;
          const ed = editions.find(
            (ed) => ed.config.project === item.meta.project,
          );
          const chainId = getChainId(ed?.config.rpc);
          const image = getToriiAssetUrl(
            item.meta.project,
            addAddressPadding(transfer.contractAddress),
            addAddressPadding(transfer.tokenId),
          );
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
              BigInt(transfer.fromAddress) === BigInt(player || "0x0")
                ? getChecksumAddress(transfer.toAddress)
                : getChecksumAddress(transfer.fromAddress),
            value: "",
            image: image,
            action:
              BigInt(transfer.fromAddress) === 0n
                ? "mint"
                : BigInt(transfer.fromAddress) === BigInt(player || "0x0")
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
  }, [transfers, player, editions]);

  const actions: { [project: string]: CardProps[] } = useMemo(() => {
    const results: { [project: string]: CardProps[] } = {};
    transactions.forEach((item) => {
      item.activities?.forEach(
        ({ transactionHash, contractAddress, entrypoint, executedAt }) => {
          const timestamp = new Date(executedAt).getTime();
          const date = getDate(timestamp);
          const project = item.meta.project;
          const ed = editions.find((ed) => ed.config.project === project);
          const game = games.find((game) => game.id === ed?.gameId);
          const chainId = getChainId(ed?.config.rpc);
          const card: CardProps = {
            variant: "game",
            key: `${transactionHash}-${entrypoint}`,
            project: item.meta.project,
            contractAddress: getChecksumAddress(contractAddress),
            transactionHash: getChecksumAddress(transactionHash),
            title: entrypoint.replace(/_/g, " "),
            image: game?.properties.icon || "",
            website: ed?.socials.website || "",
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
      const ed = editions.find((ed) => ed.config.project === project);
      const game = games.find((game) => game.id === ed?.gameId);
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
            website: ed?.socials.website || "",
            certified: !!game,
            points: item.earning,
            amount: "",
            address: "",
            value: "",
            name: "",
            collection: "",
            action: "mint",
            color: ed?.color,
            chainId: getChainId(ed?.config.rpc),
          } as CardProps;
          if (!results[project]) {
            results[project] = [];
          }
          results[project].push(card);
        });
    });
    return results;
  }, [achievements, games, editions]);

  const filteredActivities = useMemo(() => {
    if (!edition) {
      return [
        ...Object.values(erc20s).flat(),
        ...Object.values(erc721s).flat(),
        ...Object.values(actions).flat(),
        ...Object.values(trophies).flat(),
      ];
    }
    return [
      ...(erc20s[edition.config.project] || []),
      ...(erc721s[edition.config.project] || []),
      ...(actions[edition.config.project] || []),
      ...(trophies[edition.config.project] || []),
    ];
  }, [edition, erc20s, erc721s, actions, trophies]);

  const sortedActivities = useMemo(() => {
    return filteredActivities.sort((a, b) => b.timestamp - a.timestamp);
  }, [filteredActivities]);

  return {
    activities: sortedActivities,
    status,
  };
};
