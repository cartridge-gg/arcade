import { createFileRoute } from "@tanstack/react-router"
import { createLayoutRoute } from "@/lib/router";

export const Route = createLayoutRoute("/game/$game/edition/$edition")();
