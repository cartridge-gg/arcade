import { Atom } from "@effect-atom/atom-react";
import { defaultTheme } from "@cartridge/presets";
import type { ControllerTheme } from "@cartridge/ui";

export type ColorScheme = "dark" | "light" | "system";

const STORAGE_KEY = "vite-ui-colorScheme";

const getInitialColorScheme = (): ColorScheme => {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(STORAGE_KEY) as ColorScheme) || "dark";
};

export type ThemeState = {
  colorScheme: ColorScheme;
  theme: ControllerTheme;
  cover: string | undefined;
};

export const themeAtom = Atom.make<ThemeState>({
  colorScheme: getInitialColorScheme(),
  theme: defaultTheme,
  cover: undefined,
});

export { STORAGE_KEY as THEME_STORAGE_KEY };
