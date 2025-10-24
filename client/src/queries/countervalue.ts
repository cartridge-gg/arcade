import { usePriceByAddresses, usePricesByPeriodAndAddress } from "./prices";
import { useMemo } from "react";

type CounterValueProps = {
  tokens: {
    balance: string;
    address: string;
  }[];
};

function formatValue(balance: string, amount: string, decimals: number) {
  const amountValue = Number.parseFloat(amount) / 10 ** decimals;
  const value = Number.parseFloat(balance) * amountValue;
  // Round and remove insignificant trailing zeros
  const rounded = Number.parseFloat(value.toFixed(2));
  const formatted = value === rounded ? `$${value}` : `~$${rounded}`;
  return {
    value,
    formatted,
  };
}

export function useCountervalue({ tokens }: CounterValueProps) {
  const addresses = useMemo(
    () => tokens.map((token) => token.address),
    [tokens],
  );
  const { data: priceData, ...restPriceData } = usePriceByAddresses(addresses);

  const { start, end } = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const yesterday = now - 24 * 60 * 60;
    return {
      start: yesterday,
      end: yesterday + 3600,
    };
  }, []);

  const { data: pricePeriodData, ...restPricePeriodData } =
    usePricesByPeriodAndAddress({ addresses, start, end });

  const countervalues = useMemo(() => {
    return tokens.map(({ balance, address }) => {
      const currentPrice = priceData?.find(
        (price) => BigInt(price.base) === BigInt(address),
      );
      const periodPrice = pricePeriodData?.find(
        (price) => BigInt(price.base) === BigInt(address),
      );
      if (!currentPrice || !periodPrice) {
        return;
      }
      const { value: currentValue, formatted: currentFormatted } = formatValue(
        balance,
        currentPrice.amount,
        currentPrice.decimals,
      );
      const { value: periodValue, formatted: periodFormatted } = formatValue(
        balance,
        periodPrice.amount,
        periodPrice.decimals,
      );

      return {
        address,
        balance,
        current: {
          value: currentValue,
          formatted: currentFormatted,
        },
        period: {
          value: periodValue,
          formatted: periodFormatted,
        },
      };
    });
  }, [priceData, pricePeriodData, tokens]);

  return { countervalues, ...restPriceData, ...restPricePeriodData };
}
