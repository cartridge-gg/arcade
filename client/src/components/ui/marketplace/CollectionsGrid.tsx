import { Empty, Skeleton } from "@cartridge/ui";
import CollectibleCard from "./collectible-card";
import { Link } from "@tanstack/react-router";
import { FloatingLoadingSpinner } from "@/components/ui/floating-loading-spinner";
import arcade from "@/assets/arcade-logo.png";

export interface CollectionsGridItem {
  key: string;
  title: string;
  image: string;
  gameIcon?: string;
  totalCount: number;
  listingCount: number;
  lastSale: { value: string; image: string } | null;
  price: { value: string; image: string } | null;
  href: string;
}

interface CollectionsGridProps {
  items: CollectionsGridItem[];
}

export const CollectionsGrid = ({ items }: CollectionsGridProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4 place-items-center select-none overflow-y-scroll"
      style={{ scrollbarWidth: "none" }}
    >
      {items.map((item) => (
        <Link
          key={item.key}
          to={item.href}
          className="w-full group select-none"
        >
          <CollectibleCard
            icon={item.gameIcon || arcade}
            title={item.title}
            images={[item.image]}
            totalCount={item.totalCount}
            selectable={false}
            lastSale={item.lastSale}
            price={item.price}
            className="cursor-pointer"
          />
        </Link>
      ))}
    </div>
  );
};

export const CollectionsGridLoadingState = () => {
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4 place-items-center select-none">
        <Skeleton className="w-full h-[164px] rounded" />
        <Skeleton className="w-full h-[164px] rounded" />
        <Skeleton className="hidden lg:block w-full h-[164px] rounded" />
        <Skeleton className="hidden 2xl:block w-full h-[164px] rounded" />
      </div>
      <FloatingLoadingSpinner
        isLoading={true}
        loadingMessage="Loading collections."
      />
    </div>
  );
};

export const CollectionsGridEmptyState = () => {
  return (
    <Empty title="No related collections" icon="inventory" className="h-full" />
  );
};
