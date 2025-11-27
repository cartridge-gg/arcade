import { useCallback, useEffect } from "react";
import { useAtom } from "@effect-atom/atom-react";
import { useProject } from "@/hooks/project";
import { useThemeEffect, type ControllerTheme } from "@cartridge/ui";
import { defaultTheme } from "@cartridge/presets";
import {
  themeAtom,
  THEME_STORAGE_KEY,
  type ColorScheme,
} from "@/effect/atoms/ui/theme";

export function useTheme() {
  const { game } = useProject();
  const [state, setState] = useAtom(themeAtom);

  const setColorScheme = useCallback(
    (colorScheme: ColorScheme) => {
      localStorage.setItem(THEME_STORAGE_KEY, colorScheme);
      setState((prev) => ({ ...prev, colorScheme }));
    },
    [setState],
  );

  const setTheme = useCallback(
    (theme: ControllerTheme) => {
      setState((prev) => ({ ...prev, theme }));
    },
    [setState],
  );

  const resetTheme = useCallback(() => {
    setState((prev) => ({ ...prev, theme: defaultTheme }));
  }, [setState]);

  const setCover = useCallback(
    (cover: string | undefined) => {
      setState((prev) => ({ ...prev, cover }));
    },
    [setState],
  );

  const resetCover = useCallback(() => {
    setState((prev) => ({ ...prev, cover: undefined }));
  }, [setState]);

  useThemeEffect({
    theme: state.theme.colors
      ? state.theme
      : {
          ...defaultTheme,
          colors: { primary: "#fbcb4a" },
        },
    assetUrl: import.meta.env.VITE_KEYCHAIN_URL,
  });

  useEffect(() => {
    if (!game) {
      resetTheme();
      resetCover();
      return;
    }
    if (game.color) {
      setTheme({
        ...defaultTheme,
        colors: { primary: game.color || "#fbcb4a" },
      });
    }
    if (game.properties.cover) {
      setCover(game.properties.cover);
    }
  }, [game, resetTheme, resetCover, setTheme, setCover]);

  return {
    colorScheme: state.colorScheme,
    setColorScheme,
    theme: state.theme,
    setTheme,
    resetTheme,
    cover: state.cover,
    setCover,
    resetCover,
  };
}
