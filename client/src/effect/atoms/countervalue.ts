import { Atom } from "@effect-atom/atom-react";
import { Effect, pipe, Array as A, Option } from "effect";
import { CartridgeInternalGqlClient, graphqlLayer } from "../layers/graphql";

const PRICES_QUERY = `query Prices($addresses: [String!]!) {
  prices(addresses: $addresses) {
    base
    quote
    amount
    decimals
  }
}`;

const PRICES_BY_PERIOD_QUERY = `query PricesByPeriod($addresses: [String!]!, $start: Int!, $end: Int!) {
  pricesByPeriod(addresses: $addresses, start: $start, end: $end) {
    base
    quote
    amount
    decimals
  }
}`;

export type CountervaluePrice = {
  base: string;
  quote: string;
  amount: string;
  decimals: number;
};

export type TokenBalance = {
  balance: string;
  address: string;
};

export type CountervalueResult = {
  address: string;
  balance: string;
  current: {
    value: number;
    formatted: string;
  };
  period: {
    value: number;
    formatted: string;
  };
};

type PricesResponse = {
  prices: CountervaluePrice[];
};

type PricesByPeriodResponse = {
  pricesByPeriod: CountervaluePrice[];
};

const formatValue = (balance: string, amount: string, decimals: number) => {
  const amountValue = Number.parseFloat(amount) / 10 ** decimals;
  const value = Number.parseFloat(balance) * amountValue;
  const rounded = Number.parseFloat(value.toFixed(2));
  const formatted = value === rounded ? `$${value}` : `~$${rounded}`;
  return { value, formatted };
};

const fetchCountervaluesEffect = (tokens: TokenBalance[]) =>
  Effect.gen(function* () {
    if (tokens.length === 0) {
      return [] as CountervalueResult[];
    }

    const addresses = pipe(
      tokens,
      A.map((t) => t.address),
    );

    const now = Math.floor(Date.now() / 1000);
    const yesterday = now - 24 * 60 * 60;
    const start = yesterday;
    const end = yesterday + 3600;

    const client = yield* CartridgeInternalGqlClient;

    const [pricesData, periodData] = yield* Effect.all([
      client.query<PricesResponse>(PRICES_QUERY, { addresses }),
      client.query<PricesByPeriodResponse>(PRICES_BY_PERIOD_QUERY, {
        addresses,
        start,
        end,
      }),
    ]);

    return pipe(
      tokens,
      A.filterMap(({ balance, address }) => {
        const currentPrice = pricesData.prices.find(
          (price) => BigInt(price.base) === BigInt(address),
        );
        const periodPrice = periodData.pricesByPeriod.find(
          (price) => BigInt(price.base) === BigInt(address),
        );

        if (!currentPrice || !periodPrice) {
          return Option.none();
        }

        const { value: currentValue, formatted: currentFormatted } =
          formatValue(balance, currentPrice.amount, currentPrice.decimals);
        const { value: periodValue, formatted: periodFormatted } = formatValue(
          balance,
          periodPrice.amount,
          periodPrice.decimals,
        );

        return Option.some({
          address,
          balance,
          current: { value: currentValue, formatted: currentFormatted },
          period: { value: periodValue, formatted: periodFormatted },
        });
      }),
    );
  });

const countervalueRuntime = Atom.runtime(graphqlLayer);

const countervaluesFamily = Atom.family((key: string) => {
  const tokens: TokenBalance[] = JSON.parse(key);
  return countervalueRuntime
    .atom(fetchCountervaluesEffect(tokens))
    .pipe(Atom.keepAlive);
});

export const countervaluesAtom = (tokens: TokenBalance[]) => {
  const sortedKey = JSON.stringify(
    [...tokens].sort((a, b) => a.address.localeCompare(b.address)),
  );
  return countervaluesFamily(sortedKey);
};
