import { useMemo } from "react";
import { Button, cn, type ButtonProps } from "@cartridge/ui";
import type { OrderModel } from "@cartridge/arcade";
import { Info } from "lucide-react";
import { formatPriceInfo } from "@/lib/shared/marketplace/utils";
import { erc20Metadata } from "@cartridge/presets";
import { useAtomValue } from "@effect-atom/atom-react";
import { orderWithUsdAtom } from "@/effect/atoms/marketplace";

interface TokenFooterActionsProps {
  isOwner: boolean;
  isListed: boolean;
  order: OrderModel | null;
  handlePurchase: () => void;
  handleList: () => void;
  handleUnlist: () => void;
  handleSend: () => void;
}

interface TokenSelectorProps {
  currencyAddress: string;
  currencyImage: string;
}

function TokenSelector({ currencyAddress, currencyImage }: TokenSelectorProps) {
  const currencySymbol =
    erc20Metadata.find(
      (token) => BigInt(token.l2_token_address) === BigInt(currencyAddress),
    )?.symbol ?? currencyAddress.slice(0, 6);

  return (
    <div className="bg-background-125 border border-background-200 rounded flex items-center justify-between p-2 h-[40px]">
      <div className="flex items-center gap-1">
        <img
          src={currencyImage}
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

interface PriceDisplayProps {
  label: string;
  order: OrderModel;
  usdPrice: number | null;
  showInfoIcon?: boolean;
  showCurrencySymbol?: boolean;
}

function PriceDisplay({
  label,
  order,
  usdPrice = null,
  showInfoIcon = false,
  showCurrencySymbol = false,
}: PriceDisplayProps) {
  const { value } = useMemo(
    () => formatPriceInfo(order.currency, order.price, 0, 4, true),
    [order],
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
              BigInt(token.l2_token_address) === BigInt(order.currency),
          )?.symbol ?? "")
        : "",
    [order, showCurrencySymbol],
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

interface FooterContainerProps {
  children: React.ReactNode;
  justify?: "between" | "end";
}

function FooterContainer({
  children,
  justify = "between",
}: FooterContainerProps) {
  const justifyClass =
    justify === "between" ? "justify-between" : "justify-end";
  return (
    <div
      className={`sticky bottom-[-24px] z-50 bg-background-100 py-4 w-full mx-auto flex flex-col md:flex-row items-center ${justifyClass} gap-3`}
    >
      {children}
    </div>
  );
}

type ButtonConfig = {
  label: string;
  variant: ButtonProps["variant"];
  className?: string;
  onClick: () => void;
};

interface ActionButtonsProps {
  buttons: ButtonConfig[];
}

function ActionButtons({ buttons }: ActionButtonsProps) {
  return (
    <div className="flex gap-3 w-full md:w-auto">
      {buttons.map((button) => (
        <Button
          key={button.label}
          variant={button.variant}
          size="default"
          onClick={button.onClick}
          className={cn(
            "w-full md:w-[120px] h-[40px] uppercase tracking-wider",
            button.className,
          )}
        >
          {button.label}
        </Button>
      ))}
    </div>
  );
}

export function TokenFooterActions({
  isOwner,
  isListed,
  order,
  handlePurchase,
  handleList,
  handleUnlist,
  handleSend,
}: TokenFooterActionsProps) {
  const orderWithUsd = useAtomValue(orderWithUsdAtom(order));

  if (!isOwner && !isListed) {
    return null;
  }

  if (!isOwner && isListed) {
    const priceInfo = order
      ? formatPriceInfo(order.currency, order.price)
      : null;

    return (
      <FooterContainer>
        {order && priceInfo && (
          <div className="flex gap-3 flex-1 w-full">
            <PriceDisplay
              label="Total"
              order={order}
              usdPrice={orderWithUsd?.usdPrice ?? null}
              showInfoIcon
            />
            <TokenSelector
              currencyAddress={order.currency}
              currencyImage={priceInfo.image}
            />
          </div>
        )}
        <ActionButtons
          buttons={[
            { label: "BUY NOW", variant: "primary", onClick: handlePurchase },
          ]}
        />
      </FooterContainer>
    );
  }

  if (isOwner && isListed) {
    const priceInfo = order
      ? formatPriceInfo(order.currency, order.price)
      : null;

    return (
      <FooterContainer>
        {order && priceInfo && (
          <div className="flex gap-3 flex-1 w-full">
            <PriceDisplay
              label="Listed Price"
              order={order}
              usdPrice={orderWithUsd?.usdPrice ?? null}
              showInfoIcon
            />
            <TokenSelector
              currencyAddress={order.currency}
              currencyImage={priceInfo.image}
            />
          </div>
        )}
        <ActionButtons
          buttons={[
            {
              label: "UNLIST",
              variant: "secondary",
              className: "text-destructive-100",
              onClick: handleUnlist,
            },
            { label: "SEND", variant: "secondary", onClick: handleSend },
          ]}
        />
      </FooterContainer>
    );
  }

  return (
    <FooterContainer justify="end">
      <ActionButtons
        buttons={[
          { label: "LIST", variant: "secondary", onClick: handleList },
          { label: "SEND", variant: "secondary", onClick: handleSend },
        ]}
      />
    </FooterContainer>
  );
}
