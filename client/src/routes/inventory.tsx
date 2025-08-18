import { createFileRoute } from "@tanstack/react-router";
import { InventoryScene } from "@/components/scenes/inventory";

export const Route = createFileRoute("/inventory")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: InventoryScene,
});
