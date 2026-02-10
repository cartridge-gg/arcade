import { useMemo } from "react";
import { Info } from "lucide-react";
import type { ListingWithUsd } from "@/effect/atoms/marketplace";
import { erc20Metadata } from "@cartridge/presets";
import { formatPriceInfo } from "@/lib/shared/marketplace/utils";

interface PriceFooterProps {
  label: string;
  orders: ListingWithUsd[];
  className?: string;
}

export function PriceFooter({ label, orders, className }: PriceFooterProps) {
  const currencyAddress = useMemo(
    () => orders[0]?.order.currency ?? "",
    [orders.length],
  );
  const totalPrice = useMemo(
    () => orders.reduce((total, order) => total + order.order.price, 0),
    [orders.length],
  );
  const totalUsdPrice = useMemo(
    () => orders.reduce((total, order) => total + (order.usdPrice ?? 0), 0),
    [orders.length],
  );

  return (
    <div className={className ?? "flex gap-3 flex-1 w-full"}>
      {orders.length > 0 && (
        <>
          <PriceDisplay
            label={label}
            currencyAddress={currencyAddress}
            price={totalPrice}
            usdPrice={totalUsdPrice}
            showInfoIcon
          />
          <TokenSelector currencyAddress={currencyAddress} />
        </>
      )}
    </div>
  );
}

interface PriceDisplayProps {
  label: string;
  currencyAddress: string;
  price: number;
  usdPrice: number | null;
  showInfoIcon?: boolean;
  showCurrencySymbol?: boolean;
}

function PriceDisplay({
  label,
  currencyAddress,
  price,
  usdPrice = null,
  showInfoIcon = false,
  showCurrencySymbol = false,
}: PriceDisplayProps) {
  const { value } = useMemo(
    () => formatPriceInfo(currencyAddress, price, 0, 4, true),
    [currencyAddress, price],
  );

  const usdValue = useMemo(
    () =>
      usdPrice == null
        ? null
        : usdPrice < 0.01
          ? "<$0.01"
          : `$${usdPrice.toFixed(2)}`,
    [usdPrice],
  );

  const currencySymbol = useMemo(
    () =>
      showCurrencySymbol
        ? (erc20Metadata.find(
            (token) =>
              BigInt(token.l2_token_address) === BigInt(currencyAddress),
          )?.symbol ?? "")
        : "",
    [currencyAddress, showCurrencySymbol],
  );

  return (
    <div className="flex-1 bg-background-125 border border-background-200 rounded flex items-center justify-between px-3 py-2.5 h-[40px]">
      <div className="flex items-center gap-1">
        <span className="text-foreground-300 text-sm font-sans">{label}</span>
        {showInfoIcon && <Info className="w-5 h-5 text-foreground-300" />}
      </div>
      <div className="flex items-center gap-1.5">
        {usdValue && (
          <span className="text-foreground-300 text-sm">({usdValue})</span>
        )}
        <span className="text-foreground-100 text-sm font-medium">{value}</span>
        {currencySymbol && (
          <span className="text-foreground-300 text-sm">{currencySymbol}</span>
        )}
      </div>
    </div>
  );
}

function TokenSelector({
  currencyAddress,
}: {
  currencyAddress: string;
}) {
  const currencySymbol =
    erc20Metadata.find(
      (token) => BigInt(token.l2_token_address) === BigInt(currencyAddress),
    )?.symbol ?? currencyAddress.slice(0, 6);

  const priceInfo = formatPriceInfo(currencyAddress, 0);

  return (
    <div className="bg-background-125 border border-background-200 rounded flex items-center justify-between p-2 h-[40px]">
      <div className="flex items-center gap-1">
        <img
          src={priceInfo.image}
          alt={currencySymbol}
          className="w-6 h-6 rounded-full"
        />
        <span className="text-foreground-100 text-sm font-medium">
          {currencySymbol}
        </span>
      </div>
    </div>
  );
}
