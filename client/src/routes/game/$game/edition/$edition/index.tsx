import { createFileRoute } from "@tanstack/react-router"
import { createRedirectRoute } from "@/lib/router";

export const Route = createRedirectRoute("/game/$game/edition/$edition/")({
  to: "/game/$game/edition/$edition/activity",
});
