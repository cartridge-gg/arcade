import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { CartridgeInternalGqlClient, graphqlLayer } from "../layers/graphql";

const CREDITS_BALANCE_QUERY = `query Credit($username: String!) {
  account(username: $username) {
    credits {
      amount
      decimals
    }
  }
}`;

export type Credits = {
  amount: number;
  decimals: number;
};

type CreditsResponse = {
  account: {
    credits: Credits;
  };
};

const fetchCreditsEffect = (username: string) =>
  Effect.gen(function* () {
    const client = yield* CartridgeInternalGqlClient;
    const data = yield* client.query<CreditsResponse>(CREDITS_BALANCE_QUERY, {
      username,
    });
    return data.account.credits;
  });

const creditsRuntime = Atom.runtime(graphqlLayer);

export const createCreditsAtom = (username: string) =>
  creditsRuntime.atom(fetchCreditsEffect(username)).pipe(Atom.keepAlive);
