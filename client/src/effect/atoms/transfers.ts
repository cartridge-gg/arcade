import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { CartridgeInternalGqlClient, graphqlLayer } from "../layers/graphql";

const TRANSFER_QUERY = `query Transfers($projects: [TransferProject!]!) {
  transfers(projects: $projects) {
    items {
      meta {
        project
        address
        date
        limit
        count
      }
      transfers {
        amount
        decimals
        metadata
        name
        symbol
        contractAddress
        executedAt
        fromAddress
        toAddress
        tokenId
        eventId
        transactionHash
      }
    }
  }
}`;

export type TransferMeta = {
  project: string;
  address: string;
  date: string;
  limit: number;
  count: number;
};

export type Transfer = {
  amount: string;
  decimals: string;
  name: string;
  symbol: string;
  contractAddress: string;
  metadata: unknown;
  executedAt: string;
  fromAddress: string;
  toAddress: string;
  tokenId: string;
  eventId: string;
  transactionHash: string;
};

export type TransferItem = {
  meta: TransferMeta;
  transfers: Transfer[];
};

export type TransferProject = {
  project: string;
  address: string;
  limit: number;
  date: string;
};

type TransfersResponse = {
  transfers: {
    items: TransferItem[];
  };
};

const fetchTransfersEffect = (projects: TransferProject[]) =>
  Effect.gen(function* () {
    const client = yield* CartridgeInternalGqlClient;
    const data = yield* client.query<TransfersResponse>(TRANSFER_QUERY, {
      projects,
    });
    return data.transfers.items;
  });

const transfersRuntime = Atom.runtime(graphqlLayer);

export const createTransfersAtom = (projects: TransferProject[]) =>
  transfersRuntime.atom(fetchTransfersEffect(projects)).pipe(Atom.keepAlive);
