import { Button, cn, type ButtonProps } from "@cartridge/ui";
import type { OrderModel } from "@cartridge/arcade";
import { useAtomValue } from "@effect-atom/atom-react";
import { orderWithUsdAtom } from "@/effect/atoms/marketplace";
import { PriceFooter } from "../../modules/price-footer";
import { useControllerCloseAfterToast } from "@/hooks/controller";

interface TokenFooterActionsProps {
  isOwner: boolean;
  isListed: boolean;
  order: OrderModel | null;
  handlePurchase: () => void;
  handleList: () => void;
  handleUnlist: () => void;
  handleSend: () => void;
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
  useControllerCloseAfterToast();

  if (!isOwner && !isListed) {
    return null;
  }

  if (!isOwner && isListed) {
    return (
      <FooterContainer>
        {orderWithUsd && (
          <PriceFooter
            label="Total"
            orders={orderWithUsd ? [orderWithUsd] : []}
            className="flex gap-3 flex-1 w-full"
          />
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
    return (
      <FooterContainer>
        {orderWithUsd && (
          <PriceFooter
            label="Listed Price"
            orders={orderWithUsd ? [orderWithUsd] : []}
            className="flex gap-3 flex-1 w-full"
          />
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
