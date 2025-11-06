import { Outlet } from "@tanstack/react-router";
import { MarketplaceItemsTemplate } from "@/components/marketplace-items-template";

export const MarketplaceItemsPage = () => {
  return (
    <MarketplaceItemsTemplate>
      <Outlet />
    </MarketplaceItemsTemplate>
  );
};
