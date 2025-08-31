import { createLiveQueryCollection } from "@tanstack/react-db";
import {
  collectiblesCollection,
  collectionsCollection,
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
import {
  metricsCollection,
  playthroughsCollection,
} from "../discovery";

export const projectCollectiblesCollection = (project: string) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ collectible: collectiblesCollection })
        .where(({ collectible }) => collectible.project === project)
        .select(({ collectible }) => collectible),
  });

export const projectCollectionsCollection = (project: string) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ collection: collectionsCollection })
        .where(({ collection }) => collection.project === project)
        .select(({ collection }) => collection),
  });

export const projectBalancesCollection = (project: string) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ balance: balancesCollection })
        .where(({ balance }) => balance.project === project)
        .select(({ balance }) => balance),
  });

export const projectActivitiesCollection = (project: string) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ 
          transaction: transactionsCollection,
          transfer: transfersCollection 
        })
        .where(({ transaction, transfer }) => 
          (transaction?.project === project) || 
          (transfer?.project === project)
        )
        .select(({ transaction, transfer }) => ({
          transactions: transaction ? [transaction] : [],
          transfers: transfer ? [transfer] : [],
        })),
  });

export const projectAchievementsCollection = (project: string) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ 
          progression: progressionsCollection,
          trophy: trophiesCollection 
        })
        .where(({ progression, trophy }) => 
          (progression?.project === project) || 
          (trophy?.project === project)
        )
        .select(({ progression, trophy }) => ({
          progressions: progression ? [progression] : [],
          trophies: trophy ? [trophy] : [],
        })),
  });

export const projectMetricsCollection = (project: string, category?: string) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ metric: metricsCollection })
        .where(({ metric }) => {
          const projectMatch = metric.project === project;
          if (category) {
            return projectMatch && metric.category === category;
          }
          return projectMatch;
        })
        .select(({ metric }) => metric),
  });

export const projectPlaythroughsCollection = (project: string, userId?: string) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ playthrough: playthroughsCollection })
        .where(({ playthrough }) => {
          const projectMatch = playthrough.project === project;
          if (userId) {
            return projectMatch && playthrough.userId === userId;
          }
          return projectMatch;
        })
        .select(({ playthrough }) => playthrough),
  });