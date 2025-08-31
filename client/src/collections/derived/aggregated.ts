import { createLiveQueryCollection } from "@tanstack/react-db";
import {
  collectiblesCollection,
  collectionsCollection,
} from "../inventory";
import {
  balancesCollection,
} from "../tokens";
import {
  accountsCollection,
} from "../users";
import {
  progressionsCollection,
  trophiesCollection,
} from "../achievements";

export const collectiblesWithAccountsCollection = () =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ 
          collectible: collectiblesCollection,
          account: accountsCollection 
        })
        .select(({ collectible, account }) => ({
          ...collectible,
          ownerUsername: account?.username,
        })),
  });

export const balancesWithDetailsCollection = () =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ balance: balancesCollection })
        .where(({ balance }) => Number(balance.balance) > 0)
        .select(({ balance }) => ({
          ...balance,
          hasBalance: true,
          displayBalance: `${balance.formattedBalance} ${balance.symbol}`,
        })),
  });

export const completedAchievementsCollection = () =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ 
          progression: progressionsCollection,
          trophy: trophiesCollection 
        })
        .where(({ progression, trophy }) => 
          progression?.completedAt !== undefined || 
          trophy?.unlocked === true
        )
        .select(({ progression, trophy }) => ({
          progression: progression?.completedAt ? progression : null,
          trophy: trophy?.unlocked ? trophy : null,
          isCompleted: true,
        })),
  });

export const userPortfolioCollection = (userAddress: string) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ 
          collectible: collectiblesCollection,
          collection: collectionsCollection,
          balance: balancesCollection 
        })
        .select(({ collectible, collection, balance }) => ({
          nfts: {
            collectibles: collectible ? [collectible] : [],
            collections: collection ? [collection] : [],
          },
          tokens: balance ? [balance] : [],
          totalValue: 0,
        })),
  });

export const topCollectionsCollection = (limit: number = 10) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ collection: collectionsCollection })
        .select(({ collection }) => collection)
        .sort((a, b) => b.totalCount - a.totalCount)
        .limit(limit),
  });

export const recentActivitiesWithUsernamesCollection = () =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ 
          account: accountsCollection 
        })
        .select(({ account }) => ({
          username: account?.username || 'Unknown',
          address: account?.address,
        })),
  });

export const projectStatsCollection = (project: string) =>
  createLiveQueryCollection({
    query: (q) =>
      q
        .from({ 
          collectible: collectiblesCollection,
          balance: balancesCollection,
          progression: progressionsCollection
        })
        .where(({ collectible, balance, progression }) => 
          collectible?.project === project ||
          balance?.project === project ||
          progression?.project === project
        )
        .select(() => ({
          project,
          totalCollectibles: 0,
          totalBalances: 0,
          totalProgressions: 0,
        }))
        .reduce((acc, curr) => {
          if (curr) {
            return {
              ...acc,
              totalCollectibles: acc.totalCollectibles + 1,
            };
          }
          return acc;
        }, {
          project,
          totalCollectibles: 0,
          totalBalances: 0,
          totalProgressions: 0,
        }),
  });