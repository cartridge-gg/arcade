import { createFileRoute } from "@tanstack/react-router"
import { createRedirectRoute } from "@/lib/router";

export const Route = createRedirectRoute("/game/$game/")({
  to: "/game/$game/activity",
});
