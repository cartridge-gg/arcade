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

const creditsRuntime = Atom.runtime(graphqlLayer);

const fetchCreditsEffect = (username: string | undefined) =>
  Effect.gen(function* () {
    if (!username) return null;
    const client = yield* CartridgeInternalGqlClient;
    const data = yield* client.query<CreditsResponse>(CREDITS_BALANCE_QUERY, {
      username,
    });
    return data.account.credits;
  });

const creditsFamily = Atom.family((key: string) => {
  const username = key === "" ? undefined : key;
  return creditsRuntime.atom(fetchCreditsEffect(username)).pipe(Atom.keepAlive);
});

export const creditsAtom = (username: string | undefined) => {
  return creditsFamily(username ?? "");
};
