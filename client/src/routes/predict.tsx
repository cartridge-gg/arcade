import { createFileRoute } from "@tanstack/react-router";
import { PredictScene } from "@/components/scenes/predict";

export const Route = createFileRoute("/predict")({
  component: PredictScene,
});
