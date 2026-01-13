import { createFileRoute } from "@tanstack/react-router";
import { InventoryScene } from "@/components/scenes/inventory";

export const Route = createFileRoute("/player/$player/")({
  // TODO: redirect to player's inventory, BUT search for username freezes page
  // loader: () => {
  //   throw redirect({
  //     href: '/player/$player/inventory',
  //   })
  // },
  component: InventoryScene,
});
