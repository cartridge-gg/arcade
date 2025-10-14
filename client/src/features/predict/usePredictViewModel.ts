import { useMemo } from "react";
import type { PredictCardProps } from "@/components/ui/predict/PredictCard";

export interface PredictViewModel {
  predictions: PredictCardProps[];
}

export function usePredictViewModel(): PredictViewModel {
  const predictions = useMemo<PredictCardProps[]>(
    () =>
      [1, 2, 3, 4].map(
        () =>
          ({
            image: "https://static.cartridge.gg/presets/loot-survivor/icon.png",
            title: "Loot Survivor",
            subtitle: "Season 4 winner",
            user1Name: "aloothero",
            user1Score: 8,
            user2Name: "else",
            user2Score: 92,
            price: "8,800 TVL",
            time: "2 Days",
          }) satisfies PredictCardProps,
      ),
    [],
  );

  return { predictions } satisfies PredictViewModel;
}
