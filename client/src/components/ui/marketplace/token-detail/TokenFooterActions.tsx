import { Button, type ButtonProps } from "@cartridge/ui";
import type { OrderModel } from "@cartridge/arcade";
import { Info } from "lucide-react";
import { formatPriceInfo } from "@/lib/shared/marketplace/utils";
import { erc20Metadata } from "@cartridge/presets";

interface TokenFooterActionsProps {
  isOwner: boolean;
  isListed: boolean;
  orders: OrderModel[];
  handleBuy: () => void;
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
  showInfoIcon?: boolean;
}

function PriceDisplay({
  label,
  order,
  showInfoIcon = false,
}: PriceDisplayProps) {
  const priceInfo = formatPriceInfo(order.currency, order.price);
  const currencySymbol =
    erc20Metadata.find(
      (token) => BigInt(token.l2_token_address) === BigInt(order.currency),
    )?.symbol ?? "";

  return (
    <div className="flex-1 bg-background-125 border border-background-200 rounded flex items-center justify-between px-3 py-2.5 h-[40px]">
      <div className="flex items-center gap-1">
        <span className="text-foreground-300 text-sm font-sans">{label}</span>
        {showInfoIcon && <Info className="w-5 h-5 text-foreground-300" />}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-foreground-100 text-sm font-medium">
          {priceInfo.value}
        </span>
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
    <div className="bg-background-100 p-4">
      <div
        className={`max-w-7xl mx-auto flex items-center ${justifyClass} gap-3`}
      >
        {children}
      </div>
    </div>
  );
}

type ButtonConfig = {
  label: string;
  variant: ButtonProps["variant"];
  onClick: () => void;
};

interface ActionButtonsProps {
  buttons: ButtonConfig[];
}

function ActionButtons({ buttons }: ActionButtonsProps) {
  if (buttons.length === 1) {
    const button = buttons[0];
    return (
      <Button
        variant={button.variant}
        size="default"
        onClick={button.onClick}
        className="w-[120px] h-[40px] uppercase tracking-wider"
      >
        {button.label}
      </Button>
    );
  }

  return (
    <div className="flex gap-3">
      {buttons.map((button) => (
        <Button
          key={button.label}
          variant={button.variant}
          size="default"
          onClick={button.onClick}
          className="w-[120px] h-[40px] uppercase tracking-wider"
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
  orders,
  handleBuy,
  handleList,
  handleUnlist,
  handleSend,
}: TokenFooterActionsProps) {
  const lowestOrder = orders.length > 0 ? orders[0] : null;

  if (!isOwner && !isListed) {
    return null;
  }

  if (!isOwner && isListed) {
    const priceInfo = lowestOrder
      ? formatPriceInfo(lowestOrder.currency, lowestOrder.price)
      : null;

    return (
      <FooterContainer>
        {lowestOrder && priceInfo && (
          <div className="flex gap-3 flex-1">
            <PriceDisplay label="Total" order={lowestOrder} showInfoIcon />
            <TokenSelector
              currencyAddress={lowestOrder.currency}
              currencyImage={priceInfo.image}
            />
          </div>
        )}
        <ActionButtons
          buttons={[
            { label: "BUY NOW", variant: "primary", onClick: handleBuy },
          ]}
        />
      </FooterContainer>
    );
  }

  if (isOwner && isListed) {
    const priceInfo = lowestOrder
      ? formatPriceInfo(lowestOrder.currency, lowestOrder.price)
      : null;

    return (
      <FooterContainer>
        {lowestOrder && priceInfo && (
          <div className="flex gap-3 flex-1">
            <PriceDisplay
              label="Listed Price"
              order={lowestOrder}
              showInfoIcon
            />
            <TokenSelector
              currencyAddress={lowestOrder.currency}
              currencyImage={priceInfo.image}
            />
          </div>
        )}
        <ActionButtons
          buttons={[
            { label: "UNLIST", variant: "destructive", onClick: handleUnlist },
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
