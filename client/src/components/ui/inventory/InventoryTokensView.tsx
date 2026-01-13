import { MinusIcon, PlusIcon, Skeleton, TokenCard } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import type { InventoryTokenCardView } from "@/features/inventory/collections/useInventoryTokensViewModel";

interface InventoryTokensViewProps {
  isLoading: boolean;
  creditsCard: InventoryTokenCardView;
  tokenCards: InventoryTokenCardView[];
  canToggle: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export const InventoryTokensView = ({
  isLoading,
  creditsCard,
  tokenCards,
  canToggle,
  isExpanded,
  onToggle,
}: InventoryTokensViewProps) => {
  if (isLoading) {
    return <InventoryTokensLoading />;
  }

  const ToggleIcon = isExpanded ? MinusIcon : PlusIcon;
  const toggleLabel = isExpanded ? "Show Less" : "View All";

  return (
    <div
      className={cn("rounded w-full flex flex-col gap-y-px ")}
      style={{ scrollbarWidth: "none" }}
    >
      <InventoryTokenCard card={creditsCard} />
      {tokenCards.map((card) => (
        <InventoryTokenCard key={card.id} card={card} />
      ))}
      {canToggle && (
        <div
          className={cn(
            "flex justify-center items-center gap-1 p-2 rounded-b cursor-pointer",
            "bg-background-200 hover:bg-background-300 text-foreground-300 hover:text-foreground-200",
          )}
          onClick={onToggle}
        >
          <ToggleIcon size="xs" variant="line" />
          <p className="text-sm font-medium">{toggleLabel}</p>
        </div>
      )}
    </div>
  );
};

const InventoryTokenCard = ({ card }: { card: InventoryTokenCardView }) => {
  return (
    <TokenCard
      image={card.image}
      title={card.title}
      amount={card.amount}
      value={card.value}
      change={card.change}
      onClick={card.isClickable ? card.onClick : undefined}
      className={
        card.isClickable
          ? "cursor-pointer"
          : "cursor-default hover:bg-background-200"
      }
    />
  );
};

export const InventoryTokensLoading = () => {
  return (
    <div className="flex flex-col gap-y-px overflow-hidden h-full">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="min-h-16 w-full" />
      ))}
      <Skeleton className="min-h-9 w-full" />
    </div>
  );
};
