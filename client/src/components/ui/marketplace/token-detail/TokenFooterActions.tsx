import { Button } from "@cartridge/ui";
import type { OrderModel } from "@cartridge/arcade";

interface TokenFooterActionsProps {
  isOwner: boolean;
  isListed: boolean;
  orders: OrderModel[];
  handleBuy: () => void;
  handleList: () => void;
  handleUnlist: () => void;
  handleSend: () => void;
}

interface PriceDisplayProps {
  label: string;
  order: OrderModel;
}

function PriceDisplay({ label, order }: PriceDisplayProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-foreground-300 text-xs font-sans">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-foreground-100 text-sm font-medium">
          ${order.price}
        </span>
        <span className="text-foreground-300 text-sm">
          {order.price} {order.currency}
        </span>
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
    <div className="bg-background-100">
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
  variant: "primary" | "secondary" | "destructive";
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
        className="flex-1 max-w-xs uppercase tracking-wider"
      >
        {button.label}
      </Button>
    );
  }

  return (
    <div className="flex gap-3 flex-1 max-w-md">
      {buttons.map((button) => (
        <Button
          key={button.label}
          variant={button.variant}
          size="default"
          onClick={button.onClick}
          className="flex-1 uppercase tracking-wider"
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
    return (
      <FooterContainer>
        {lowestOrder && <PriceDisplay label="Total Cost" order={lowestOrder} />}
        <ActionButtons
          buttons={[
            { label: "BUY NOW", variant: "primary", onClick: handleBuy },
          ]}
        />
      </FooterContainer>
    );
  }

  if (isOwner && isListed) {
    return (
      <FooterContainer>
        {lowestOrder && (
          <PriceDisplay label="Listed Price" order={lowestOrder} />
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
