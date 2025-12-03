import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { CartridgeInternalGqlClient, graphqlLayer } from "../layers/graphql";

export type Price = {
  amount: string;
  base: string;
  decimals: number;
  quote: string;
};

const PRICES_BY_ADDRESS_QUERY = `query PriceByAddresses($addresses: [String!]!) {
  priceByAddresses(addresses: $addresses) {
    amount
    base
    decimals
    quote
  }
}`;

type PriceByAddressesResponse = {
  priceByAddresses: Price[];
};

const PRICES_BY_PERIOD_AND_ADDRESS_QUERY = `query PricePeriodByAddresses($addresses: [String!]!, $start: Int!, $end: Int!) {
  pricePeriodByAddresses(addresses: $addresses, start: $start, end: $end) {
    amount
    base
    decimals
    quote
  }
}`;

type PriceByPeriodAndAddressResponse = {
  pricePeriodByAddresses: Price[];
};

const fetchPricesByAddressesEffect = (addresses: string[]) =>
  Effect.gen(function* () {
    if (addresses.length === 0) {
      return [] as Price[];
    }
    const client = yield* CartridgeInternalGqlClient;
    const data = yield* client.query<PriceByAddressesResponse>(
      PRICES_BY_ADDRESS_QUERY,
      { addresses },
    );
    return data.priceByAddresses;
  });

const fetchPricesByPeriodAndAddressEffect = (
  addresses: string[],
  start: number,
  end: number,
) =>
  Effect.gen(function* () {
    if (addresses.length === 0) {
      return [] as Price[];
    }
    const client = yield* CartridgeInternalGqlClient;
    const data = yield* client.query<PriceByPeriodAndAddressResponse>(
      PRICES_BY_PERIOD_AND_ADDRESS_QUERY,
      { addresses, start, end },
    );
    return data.pricePeriodByAddresses;
  });

const pricesRuntime = Atom.runtime(graphqlLayer);

const pricesFamily = Atom.family((key: string) => {
  const addresses: string[] = JSON.parse(key);
  return pricesRuntime
    .atom(fetchPricesByAddressesEffect(addresses))
    .pipe(Atom.keepAlive);
});

export const pricesAtom = (addresses: string[]) => {
  const sortedKey = JSON.stringify([...addresses].sort());
  return pricesFamily(sortedKey);
};

const pricesByPeriodFamily = Atom.family((key: string) => {
  const {
    addresses,
    start,
    end,
  }: { addresses: string[]; start: number; end: number } = JSON.parse(key);
  return pricesRuntime
    .atom(fetchPricesByPeriodAndAddressEffect(addresses, start, end))
    .pipe(Atom.keepAlive);
});

export const pricesByPeriodAtom = (
  addresses: string[],
  start: number,
  end: number,
) => {
  const sortedKey = JSON.stringify({
    addresses: [...addresses].sort(),
    start,
    end,
  });
  return pricesByPeriodFamily(sortedKey);
};
