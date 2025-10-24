import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { graphqlClient } from "./graphql-client";

type Price = {
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

export function usePriceByAddresses(addresses: string[]) {
  return useQuery({
    queryKey: queryKeys.prices.addresses(addresses),
    enabled: addresses.length > 0,
    queryFn: async () => {
      const data: PriceByAddressesResponse = await graphqlClient(
        PRICES_BY_ADDRESS_QUERY,
        {
          addresses: addresses,
        },
      );
      return data.priceByAddresses;
    },
  });
}

type PriceByPeriodAndAddressProps = {
  addresses: string[];
  start: number;
  end: number;
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

export function usePricesByPeriodAndAddress({
  addresses,
  start,
  end,
}: PriceByPeriodAndAddressProps) {
  return useQuery({
    queryKey: queryKeys.prices.periodAndAddresses(
      addresses,
      start.toString(),
      end.toString(),
    ),
    enabled: addresses.length > 0,
    queryFn: async () => {
      const data: PriceByPeriodAndAddressResponse = await graphqlClient(
        PRICES_BY_PERIOD_AND_ADDRESS_QUERY,
        {
          addresses: addresses,
          start,
          end,
        },
      );
      return data.pricePeriodByAddresses;
    },
  });
}
