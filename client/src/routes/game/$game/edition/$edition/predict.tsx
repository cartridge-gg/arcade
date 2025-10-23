import { createFileRoute } from "@tanstack/react-router";
import { PredictScene } from "@/components/scenes/predict";

export const Route = createFileRoute("/game/$game/edition/$edition/predict")({
  component: PredictScene,
});
