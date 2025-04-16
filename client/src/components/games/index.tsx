import {
  CardListContent,
  Input,
  SearchIcon,
  useMediaQuery,
} from "@cartridge/ui-next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@/hooks/context";
import {
  ControllerTheme,
  controllerConfigs as configs,
} from "@cartridge/controller";
import { useArcade } from "@/hooks/arcade";
import { useProject } from "@/hooks/project";
import { usePlayerGameStats, usePlayerStats } from "@/hooks/achievements";
import { Register } from "./register";
import { GameModel } from "@bal7hazar/arcade-sdk";
import { useAccount } from "@starknet-react/core";
import { useNavigate, useSearchParams } from "react-router-dom";
import cartridge from "@/assets/cartridge-logo.png";
import banner from "@/assets/banner.png";
import ArcadeGameSelect from "../modules/game-select";
import { useSidebar } from "@/hooks/sidebar";
import { cn } from "@cartridge/ui-next";

export const Games = () => {
  const [search, setSearch] = useState("");
  const { address } = useAccount();
  const { games } = useArcade();
  const { isOpen } = useSidebar();
  const isMobile = useMediaQuery("(max-width: 1024px)");

  const [searchParams] = useSearchParams();
  const selected = useMemo(() => {
    return searchParams.get("game") || "All Games";
  }, [searchParams]);

  const filteredGames = useMemo(() => {
    return games.filter((game) =>
      game.metadata.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [games, search]);

  return (
    <div
      className={cn(
        "self-start flex-col gap-px bg-background-200 overflow-clip lg:rounded-xl border border-background-200",
        "w-[calc(100vw-64px)] max-w-[360px] lg:flex lg:min-w-[360px]",
        isMobile && "fixed z-50 top-0 left-0 h-full", // Fixed position for mobile
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0", // Slide in/out animation
        "transition-transform duration-300 ease-in-out", // Smooth transition
      )}
    >
      <div className="flex flex-col gap-3 bg-spacer-100 lg:bg-background-100 p-4 h-full">
        <Search search={search} setSearch={setSearch} />
        <div className="flex flex-col gap-1 flex-grow overflow-hidden">
          <Game
            project=""
            namespace=""
            preset="default"
            name="All Games"
            icon={cartridge}
            cover={banner}
            active={selected === "All Games"}
          />
          <p className="font-semibold text-xs tracking-wider text-foreground-400 px-2 py-3">
            Games
          </p>
          <CardListContent
            className="p-0 overflow-y-auto flex-grow"
            style={{ scrollbarWidth: "none" }}
          >
            {filteredGames.map((game) => (
              <Game
                key={`${game.worldAddress}-${game.namespace}`}
                project={game.config.project}
                namespace={game.namespace}
                preset={game.metadata.preset ?? "default"}
                name={game.metadata.name}
                icon={game.metadata.image}
                cover={game.metadata.banner}
                active={selected === game.metadata.name}
                game={game}
                address={address}
              />
            ))}
          </CardListContent>
        </div>
        <div className="flex items-center justify-center p-3 gap-2.5 bg-background-100">
          <Register />
        </div>
      </div>
    </div>
  );
};

export const Search = ({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (search: string) => void;
}) => {
  const [focus, setFocus] = useState(false);

  return (
    <div className="relative">
      <Input
        className="pr-9 bg-spacer-100 hover:bg-spacer-100 focus-visible:bg-spacer-100"
        type="text"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      />
      <SearchIcon
        data-focused={focus}
        data-content={search.length > 0 && !focus}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-400 transition-colors duration-100 data-[content=true]:text-foreground-300 data-[focused=true]:text-foreground-100 "
      />
    </div>
  );
};

export const Game = ({
  project,
  namespace,
  preset,
  name,
  icon,
  cover,
  active,
  game,
  address,
}: {
  project: string;
  namespace: string;
  preset: string;
  name: string;
  icon: string;
  cover?: string;
  active: boolean;
  game?: GameModel;
  address?: string;
}) => {
  const { earnings: totalEarnings } = usePlayerStats();
  const { earnings: gameEarnings } = usePlayerGameStats(project);
  const { theme, setTheme, resetTheme, setCover, resetCover } = useTheme();
  const {
    project: currentProject,
    namespace: currentNamespace,
    setProject,
    setNamespace,
  } = useProject();
  const { close } = useSidebar();

  const isOwner = useMemo(() => {
    return BigInt(game?.owner || "0x0") === BigInt(address || "0x0");
  }, [game, address]);

  const navigate = useNavigate();
  const handleClick = useCallback(() => {
    // Update the url params
    const url = new URL(window.location.href);
    url.searchParams.set("game", name);
    navigate(url.toString().replace(window.location.origin, ""));

    // Close sidebar on mobile when a game is selected
    close();
  }, [name, navigate, close]);

  useEffect(() => {
    if (
      !active ||
      (currentProject === project && currentNamespace === namespace)
    )
      return;
    // Update the selected project and namespace
    if (currentProject !== project || currentNamespace !== namespace) {
      setProject(project);
      setNamespace(namespace);
    }
    // Update the theme and cover
    const config = configs[preset.toLowerCase()]?.theme;
    if (!config || !config.colors) {
      resetTheme();
      resetCover();
      return;
    }
    const newTheme: ControllerTheme = {
      ...theme,
      colors: {
        ...theme.colors,
        primary: config.colors.primary,
      },
    };
    setTheme(newTheme);
    setCover(cover);
  }, [
    active,
    project,
    namespace,
    cover,
    currentProject,
    currentNamespace,
    theme,
    setTheme,
    setProject,
    setNamespace,
    setCover,
    resetTheme,
    resetCover,
  ]);

  return (
    <div className="flex items-center gap-2">
      <div
        data-active={active}
        className="grow rounded border border-transparent data-[active=true]:border-primary transition-colors duration-300 ease-in-out"
      >
        <ArcadeGameSelect
          name={name}
          logo={icon}
          cover={cover}
          points={project ? gameEarnings : totalEarnings}
          active={active}
          onClick={handleClick}
          variant="darkest"
          className="grow rounded"
        />
      </div>
      {isOwner && !!game && <Register game={game} />}
    </div>
  );
};
