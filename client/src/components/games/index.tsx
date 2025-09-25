import {
  CardListContent,
  DotsIcon,
  Input,
  SearchIcon,
  Select,
  SelectContent,
  useMediaQuery,
} from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useArcade } from "@/hooks/arcade";
import { usePlayerGameStats, usePlayerStats } from "@/hooks/achievements";
import { Register } from "./register";
import { type GameModel, RoleType } from "@cartridge/arcade";
import { useLocation, useNavigate } from "react-router-dom";
import arcade from "@/assets/arcade-logo.png";
import banner from "@/assets/banner.png";
import ArcadeGameSelect from "../modules/game-select";
import { useSidebar } from "@/hooks/sidebar";
import { cn } from "@cartridge/ui/utils";
import { Update } from "./update";
import { useOwnerships } from "@/hooks/ownerships";
import { useAccount } from "@starknet-react/core";
import { useProject } from "@/hooks/project";
import { joinPaths } from "@/helpers";
import ArcadeMenuButton from "../modules/menu-button";
import { Publish } from "./publish";
import { Whitelist } from "./whitelist";
import { UserCard } from "../user/user-card";

export const Games = () => {
  const { address } = useAccount();
  const { games } = useArcade();
  const { game } = useProject();
  const { ownerships } = useOwnerships();
  const { isOpen, handleTouchStart, handleTouchMove } = useSidebar();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const isPWA = useMediaQuery("(display-mode: standalone)");

  const selected: number = useMemo(() => {
    return game?.id || 0;
  }, [game]);

  return (
    <div
      className={cn(
        "flex flex-col gap-px bg-background-200 overflow-clip lg:rounded-xl border-r border-spacer-100 lg:border lg:border-background-200",
        "h-full w-[calc(100vw-64px)] max-w-[360px] lg:flex lg:min-w-[360px]",
        isMobile && "fixed z-50 top-0 left-0", // Fixed position for mobile
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0", // Slide in/out animation
        "transition-transform duration-300 ease-in-out" // Smooth transition
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {isMobile && <UserCard className="bg-background-100 -mb-px" />}
      <div className="flex flex-col gap-3 bg-background-100 p-4 pb-0 grow overflow-hidden">
        <div className="flex flex-col gap-1 grow overflow-hidden">
          <CardListContent
            className="p-0 pb-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <Game
              id={0}
              name="All Games"
              icon={arcade}
              cover={banner}
              active={!selected}
              owner={false}
              whitelisted={true}
              published={true}
            />
            {games.map((game) => (
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
                      (ownership) => ownership.tokenId === BigInt(game.id)
                    )?.accountAddress || "0x0"
                  ) === BigInt(address || "0x1")
                }
                original={game}
                whitelisted={game.whitelisted}
                published={game.published}
              />
            ))}
          </CardListContent>
        </div>
      </div>
      <div
        className={cn(
          "flex items-center justify-center p-3 lg:pb-3 gap-2.5 bg-background-100",
          isPWA ? "pb-6" : "pb-3"
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
  whitelisted,
  published,
  original,
}: {
  id: number;
  name: string;
  icon: string;
  cover?: string;
  active: boolean;
  owner: boolean;
  whitelisted: boolean;
  published: boolean;
  original?: GameModel;
}) => {
  const { address } = useAccount();
  const { accesses, editions } = useArcade();
  const [game, setGame] = useState<GameModel | null>(null);

  const access = useMemo(() => {
    return accesses.find(
      (access) => BigInt(access.address) === BigInt(address || "0x1")
    );
  }, [accesses, address]);

  const admin = useMemo(() => {
    return (
      access?.role?.value === RoleType.Owner ||
      access?.role.value === RoleType.Admin
    );
  }, [access]);

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

  const setWhitelisted = useCallback(
    (status: boolean) => {
      if (!game) return;
      const newEdition = game.clone();
      newEdition.whitelisted = status;
      setGame(newEdition);
    },
    [game]
  );

  const setPublished = useCallback(
    (status: boolean) => {
      if (!game) return;
      const newEdition = game.clone();
      newEdition.published = status;
      setGame(newEdition);
    },
    [game]
  );

  useEffect(() => {
    if (!original) {
      setGame(null);
      return;
    }
    setGame(original.clone());
  }, [original]);

  if (!!game && !whitelisted && !owner && !admin) return null;

  return (
    <div className="flex items-center gap-2">
      <div
        data-active={active}
        className="grow rounded border border-transparent transition-colors duration-300 ease-in-out"
      >
        <ArcadeGameSelect
          name={name}
          logo={icon}
          cover={cover}
          points={game ? gameEarnings : totalEarnings}
          active={active}
          onClick={handleClick}
          downlighted={!whitelisted}
          icon={
            whitelisted ? undefined : published ? "fa-rocket" : "fa-eye-slash"
          }
          gameColor={game?.color}
          className="grow rounded"
        />
      </div>
      {game && (admin || owner) && (
        <Select>
          <div className="flex justify-end items-center self-center">
            <ArcadeMenuButton
              active={false}
              className="bg-background-150 border border-background-200 hover:text-foreground-100"
            >
              <DotsIcon size="sm" />
            </ArcadeMenuButton>
          </div>
          <SelectContent className="bg-background-100">
            {game && owner && <Update key={game.id} game={game} />}
            {game && owner && (
              <Publish
                key={game.published ? "hide" : "publish"}
                game={game}
                action={game.published ? "hide" : "publish"}
                setPublished={setPublished}
              />
            )}
            {game && admin && (
              <Whitelist
                key={game.whitelisted ? "blacklist" : "whitelist"}
                game={game}
                action={game.whitelisted ? "blacklist" : "whitelist"}
                setWhitelisted={setWhitelisted}
              />
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
