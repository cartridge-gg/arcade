import { Outlet } from "@tanstack/react-router";
import { InventoryItemsTemplate } from "@/components/inventory-items-template";

export const InventoryItemsPage = () => {
  return (
    <InventoryItemsTemplate>
      <Outlet />
    </InventoryItemsTemplate>
  );
};
