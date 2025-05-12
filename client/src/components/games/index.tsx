import {
  CardListContent,
  Input,
  SearchIcon,
  useMediaQuery,
} from "@cartridge/ui-next";
import { useCallback, useMemo, useState } from "react";
import { useArcade } from "@/hooks/arcade";
import { usePlayerGameStats, usePlayerStats } from "@/hooks/achievements";
import { Register } from "./register";
import { GameModel } from "@bal7hazar/arcade-sdk";
import { useLocation, useNavigate } from "react-router-dom";
import arcade from "@/assets/arcade-logo.png";
import banner from "@/assets/banner.png";
import ArcadeGameSelect from "../modules/game-select";
import { useSidebar } from "@/hooks/sidebar";
import { cn } from "@cartridge/ui-next";
import { Update } from "./update";
import { useOwnerships } from "@/hooks/ownerships";
import { useAccount } from "@starknet-react/core";
import { useProject } from "@/hooks/project";
import { joinPaths } from "@/helpers";

export const Games = () => {
  const { address } = useAccount();
  const [search, setSearch] = useState("");
  const { games } = useArcade();
  const { game } = useProject();
  const { ownerships } = useOwnerships();
  const { isOpen, handleTouchStart, handleTouchMove } = useSidebar();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const isPWA = useMediaQuery("(display-mode: standalone)");

  const selected: number = useMemo(() => {
    return game?.id || 0;
  }, [game]);

  const filteredGames = useMemo(() => {
    return games.filter((game) =>
      game.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [games, search]);

  return (
    <div
      className={cn(
        "flex flex-col gap-px bg-background-200 overflow-clip lg:rounded-xl border-r border-spacer-100 lg:border lg:border-background-200",
        "h-full w-[calc(100vw-64px)] max-w-[360px] lg:flex lg:min-w-[360px]",
        isMobile && "fixed z-50 top-0 left-0", // Fixed position for mobile
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0", // Slide in/out animation
        "transition-transform duration-300 ease-in-out", // Smooth transition
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div className="flex flex-col gap-3 bg-background-100 p-4 grow">
        <Search search={search} setSearch={setSearch} />
        <div className="flex flex-col gap-1">
          <Game
            id={0}
            name="Arcade"
            icon={arcade}
            cover={banner}
            active={!selected}
            owner={false}
          />
          <p className="font-semibold text-xs tracking-wider text-foreground-400 px-2 py-3">
            Games
          </p>
          <CardListContent
            className="p-0 overflow-y-auto grow"
            style={{ scrollbarWidth: "none" }}
          >
            {filteredGames.map((game) => (
              <Game
                key={`${game.identifier}`}
                id={game.id}
                name={game.name}
                icon={game.properties.icon ?? ""}
                cover={game.properties.cover}
                active={BigInt(selected || "0x0") === BigInt(game.id)}
                owner={
                  BigInt(
                    ownerships.find(
                      (ownership) => ownership.tokenId === BigInt(game.id),
                    )?.accountAddress || "0x0",
                  ) === BigInt(address || "0x1")
                }
                game={game}
              />
            ))}
          </CardListContent>
        </div>
      </div>
      <div
        className={cn(
          "flex items-center justify-center p-3 lg:pb-3 gap-2.5 bg-background-100",
          isPWA ? "pb-6" : "pb-3",
        )}
      >
        <Register />
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
  id,
  name,
  icon,
  cover,
  active,
  owner,
  game,
}: {
  id: number;
  name: string;
  icon: string;
  cover?: string;
  active: boolean;
  owner: boolean;
  game?: GameModel;
}) => {
  const { editions } = useArcade();
  const projects = useMemo(() => {
    return editions
      .filter((edition) => edition.gameId === game?.id)
      .map((edition) => edition.config.project);
  }, [editions, game]);
  const { earnings: totalEarnings } = usePlayerStats();
  const { earnings: gameEarnings } = usePlayerGameStats(projects);
  const { close } = useSidebar();

  const location = useLocation();
  const navigate = useNavigate();
  const handleClick = useCallback(() => {
    // Update the url params
    let pathname = location.pathname;
    const gameName = `${game?.name.toLowerCase().replace(/ /g, "-") || id}`;
    pathname = pathname.replace(/\/game\/[^/]+/, "");
    pathname = pathname.replace(/\/edition\/[^/]+/, "");
    if (id !== 0) pathname = joinPaths(`/game/${gameName}`, pathname);
    navigate(pathname || "/");
    // Close sidebar on mobile when a game is selected
    close();
  }, [game, location, navigate, close]);

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
          points={game ? gameEarnings : totalEarnings}
          active={active}
          onClick={handleClick}
          variant="darkest"
          className="grow rounded"
        />
      </div>
      {owner && !!game && <Update game={game} />}
    </div>
  );
};
