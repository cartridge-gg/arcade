import { CollectibleCard, Skeleton } from "@cartridge/ui";
import { Link } from "@tanstack/react-router";
import type { InventoryCollectionCardView } from "@/features/inventory/collections/useInventoryCollectionsViewModel";

interface InventoryCollectionsViewProps {
  isLoading: boolean;
  collectionCards: InventoryCollectionCardView[];
}

export const InventoryCollectionsView = ({
  isLoading,
  collectionCards,
}: InventoryCollectionsViewProps) => {
  if (isLoading) {
    return <InventoryCollectionsLoading />;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4 place-items-center select-none">
      {collectionCards.map((card) => (
        <InventoryCollectionCard key={card.id} card={card} />
      ))}
    </div>
  );
};

const InventoryCollectionCard = ({
  card,
}: {
  card: InventoryCollectionCardView;
}) => {
  const content = (
    <CollectibleCard
      title={card.title}
      image={card.image}
      totalCount={card.totalCount}
      listingCount={card.listingCount}
      onClick={card.onClick}
    />
  );

  if (card.href) {
    return (
      <Link
        to={card.href}
        search={card.search}
        className="w-full group select-none"
      >
        {content}
      </Link>
    );
  }

  return <div className="w-full group select-none">{content}</div>;
};

export const InventoryCollectionsLoading = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 place-items-center select-none">
      <Skeleton className="w-full h-[164px] rounded" />
      <Skeleton className="w-full h-[164px] rounded" />
      <Skeleton className="hidden lg:block w-full h-[164px] rounded" />
    </div>
  );
};
