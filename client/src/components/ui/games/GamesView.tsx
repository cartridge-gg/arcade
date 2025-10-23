import { useState } from "react";
import {
  CardListContent,
  DotsIcon,
  Select,
  SelectContent,
  useMediaQuery,
} from "@cartridge/ui";
import { Link } from "@tanstack/react-router";
import { cn } from "@cartridge/ui/utils";
import ArcadeGameSelect from "@/components/ui/modules/game-select";
import ArcadeMenuButton from "@/components/ui/modules/menu-button";
import { SearchInput } from "@/components/ui/modules/search-input";
import { Register } from "./register";
import { Update } from "./update";
import { Publish } from "./publish";
import { Whitelist } from "./whitelist";
import { UserCard } from "@/components/user/user-card";
import { useGameItemViewModel } from "@/features/games/useGameItemViewModel";
import type {
  GamesViewModel,
  GameListItem as GameListItemComponent,
} from "@/features/games/useGamesViewModel";
import arcade from "@/assets/arcade-logo.png";
import banner from "@/assets/banner.png";

interface GamesViewProps extends GamesViewModel {}

export const GamesView = ({
  games,
  selectedGameId,
  isMobile,
  isPWA,
  sidebar,
}: GamesViewProps) => {
  const isViewMobile = useMediaQuery("(max-width: 1024px)");
  const showUserCard = isMobile || isViewMobile;
  const [search, setSearch] = useState("");

  const filteredGames = games.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-px bg-background-200 overflow-clip lg:rounded-xl border-r border-spacer-100 lg:border lg:border-background-200",
        "h-full w-[calc(100vw-64px)] max-w-[360px] lg:flex lg:min-w-[360px]",
        (isMobile || isViewMobile) && "fixed z-50 top-0 left-0",
        sidebar.isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "transition-all duration-300 ease-in-out",
      )}
      onTouchStart={sidebar.handleTouchStart}
      onTouchMove={sidebar.handleTouchMove}
    >
      {showUserCard && <UserCard className="bg-background-100 -mb-px" />}
      <div className="flex flex-col gap-3 bg-background-100 p-4 pb-0 grow overflow-hidden">
        <SearchInput value={search} onChange={setSearch} placeholder="Search" />
        <div className="flex flex-col gap-1 grow overflow-hidden">
          <CardListContent
            className="p-0 pb-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {filteredGames.map((item) => (
              <GameListItem
                key={item.id}
                item={item}
                selectedGameId={selectedGameId}
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

interface GameListItemProps {
  item: GameListItemComponent;
  selectedGameId: number;
}

const GameListItem = ({ item, selectedGameId }: GameListItemProps) => {
  const viewModel = useGameItemViewModel(item.game ?? null, { selectedGameId });

  const onSelect = () => {
    viewModel.onSelect();
  };

  if (
    item.game &&
    !viewModel.whitelisted &&
    !viewModel.owner &&
    !viewModel.admin
  ) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to={viewModel.target}
        onClick={onSelect}
        data-active={viewModel.active}
        className="grow rounded border border-transparent transition-colors duration-300 ease-in-out"
      >
        <ArcadeGameSelect
          name={item.id === 0 ? "All Games" : viewModel.name}
          logo={item.id === 0 ? arcade : viewModel.icon}
          cover={item.id === 0 ? banner : viewModel.cover}
          points={viewModel.points}
          active={viewModel.active}
          downlighted={!viewModel.whitelisted}
          icon={
            item.id === 0
              ? undefined
              : viewModel.whitelisted
                ? undefined
                : viewModel.published
                  ? "fa-rocket"
                  : "fa-eye-slash"
          }
          gameColor={viewModel.color}
          className="grow rounded"
        />
      </Link>
      {item.game && (viewModel.owner || viewModel.admin) && (
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
            {viewModel.actions.map((action) => {
              if (action.type === "update") {
                return (
                  <Update key={`update-${action.game.id}`} game={action.game} />
                );
              }
              if (action.type === "publish") {
                return (
                  <Publish
                    key={`publish-${action.game.id}`}
                    game={action.game}
                    action={action.status ? "hide" : "publish"}
                    setPublished={action.setPublished}
                  />
                );
              }
              if (action.type === "whitelist") {
                return (
                  <Whitelist
                    key={`whitelist-${action.game.id}`}
                    game={action.game}
                    action={action.status ? "blacklist" : "whitelist"}
                    setWhitelisted={action.setWhitelisted}
                  />
                );
              }
              return null;
            })}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
