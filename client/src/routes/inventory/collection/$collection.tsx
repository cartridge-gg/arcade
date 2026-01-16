import { createFileRoute } from "@tanstack/react-router";
import { InventoryItemsPage } from "@/components/scenes/inventory-items-page";

export const Route = createFileRoute("/inventory/collection/$collection")({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: search.filter as string | undefined,
  }),
  component: InventoryItemsPage,
  staticData: {
    hasOwnTemplate: true,
  },
});
