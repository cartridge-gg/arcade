import { createLiveQueryCollection } from "@tanstack/react-db";
import {
  collectiblesCollection,
  collectionsCollection,
  ownershipsCollection,
} from "../inventory";
import {
  balancesCollection,
} from "../tokens";
import {
  transactionsCollection,
  transfersCollection,
} from "../activities";
import {
  progressionsCollection,
  trophiesCollection,
} from "../achievements";

export const userCollectiblesCollection = (userAddress: string, project?: string) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ collectible: collectiblesCollection })
        .where(({ collectible }) => {
          if (project) {
            return collectible.project === project;
          }
          return true;
        })
        .select(({ collectible }) => collectible),
  });

export const userCollectionsCollection = (userAddress: string, project?: string) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ collection: collectionsCollection })
        .where(({ collection }) => {
          if (project) {
            return collection.project === project;
          }
          return true;
        })
        .select(({ collection }) => collection),
  });

export const userBalancesCollection = (userAddress: string, project?: string) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ balance: balancesCollection })
        .where(({ balance }) => {
          if (project) {
            return balance.project === project;
          }
          return true;
        })
        .select(({ balance }) => balance),
  });

export const userActivitiesCollection = (userAddress: string, project?: string) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({
          transaction: transactionsCollection,
          transfer: transfersCollection
        })
        .where(({ transaction, transfer }) => {
          if (project) {
            return (transaction?.project === project) ||
              (transfer?.project === project);
          }
          return true;
        })
        .select(({ transaction, transfer }) => ({
          transactions: transaction ? [transaction] : [],
          transfers: transfer ? [transfer] : [],
        })),
  });

export const userProgressCollection = (userAddress: string, project?: string) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({
          progression: progressionsCollection,
          trophy: trophiesCollection
        })
        .where(({ progression, trophy }) => {
          if (project) {
            return (progression?.project === project) ||
              (trophy?.project === project);
          }
          return true;
        })
        .select(({ progression, trophy }) => ({
          progressions: progression ? [progression] : [],
          trophies: trophy ? [trophy] : [],
        })),
  });

export const userOwnershipsCollection = (
  userAddress: string,
  contractAddress: string
) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ ownership: ownershipsCollection })
        .where(({ ownership }) =>
          ownership.owner === userAddress &&
          ownership.contractAddress === contractAddress
        )
        .select(({ ownership }) => ownership),
  });
