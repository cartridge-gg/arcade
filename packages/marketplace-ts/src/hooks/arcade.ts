import { useContext } from "react";
import { ArcadeContext, type ArcadeContextType } from "../contexts";

export function useArcade(): ArcadeContextType {
  const context = useContext(ArcadeContext);

  if (!context) {
    throw new Error(
      "The `useArcade` hook must be used within an `ArcadeProvider`",
    );
  }

  return context;
}
