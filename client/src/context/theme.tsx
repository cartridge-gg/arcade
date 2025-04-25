import { useArcade } from "@/hooks/arcade";
import { useProject } from "@/hooks/project";
import { defaultTheme, ControllerTheme } from "@cartridge/presets";
import { useThemeEffect } from "@cartridge/ui-next";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";

type ColorScheme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultScheme?: ColorScheme;
  storageKey?: string;
};

export type ThemeProviderContextType = {
  colorScheme: ColorScheme;
  setColorScheme: (colorMode: ColorScheme) => void;
  theme: ControllerTheme;
  setTheme: (theme: ControllerTheme) => void;
  resetTheme: () => void;
  cover: string | undefined;
  setCover: (cover: string | undefined) => void;
  resetCover: () => void;
};

export const initialState: ThemeProviderContextType = {
  colorScheme: "dark",
  setColorScheme: () => null,
  theme: defaultTheme,
  setTheme: () => null,
  resetTheme: () => null,
  cover: undefined,
  setCover: () => null,
  resetCover: () => null,
};

export const ThemeContext =
  createContext<ThemeProviderContextType>(initialState);

export function ThemeProvider({
  children,
  defaultScheme = "dark",
  storageKey = "vite-ui-colorScheme",
  ...props
}: ThemeProviderProps) {
  const { gameId } = useProject();
  const { games } = useArcade();

  const [searchParams] = useSearchParams();
  const colorSchemeParam =
    (searchParams.get("colorMode") as ColorScheme) || null;
  if (
    colorSchemeParam &&
    !["light", "dark", "system"].includes(colorSchemeParam)
  ) {
    throw new Error(
      `Unknown colorScheme query param is provided: ${colorSchemeParam}`,
    );
  }

  const [colorScheme, setColorSchemeRaw] = useState<ColorScheme>(
    () =>
      colorSchemeParam ||
      (localStorage.getItem(storageKey) as ColorScheme) ||
      defaultScheme,
  );

  const game = useMemo(() => {
    return games.find((game) => game.id === gameId);
  }, [gameId, games]);

  const setColorScheme = useCallback(
    (colorScheme: ColorScheme) => {
      localStorage.setItem(storageKey, colorScheme);
      setColorSchemeRaw(colorScheme);
    },
    [storageKey],
  );
  const [theme, setTheme] = useState<ControllerTheme>(initialState.theme);
  const resetTheme = () => setTheme(initialState.theme);
  const [cover, setCover] = useState<string | undefined>(undefined);
  const resetCover = () => setCover(undefined);

  useThemeEffect({
    theme: theme.colors
      ? theme
      : {
          ...defaultTheme,
          colors: { ...defaultTheme.colors, primary: "#fbcb4a" },
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
        colors: { ...defaultTheme.colors, primary: game.color },
      });
    }
    if (game.properties.cover) {
      setCover(game.properties.cover);
    }
  }, [defaultTheme, game]);

  const value = {
    colorScheme,
    setColorScheme,
    theme,
    setTheme,
    resetTheme,
    cover,
    setCover,
    resetCover,
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
