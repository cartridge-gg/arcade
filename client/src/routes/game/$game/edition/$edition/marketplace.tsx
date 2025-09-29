import { createFileRoute } from "@tanstack/react-router";
import { GamePage } from "@/components/pages/game";

export const Route = createFileRoute(
  "/game/$game/edition/$edition/marketplace",
)({
  component: GamePage,
});
