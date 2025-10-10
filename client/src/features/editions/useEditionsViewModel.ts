import { useMemo, useState, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useArcade } from "@/hooks/arcade";
import { useProject } from "@/hooks/project";
import { useOwnerships } from "@/hooks/ownerships";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { joinPaths } from "@/lib/helpers";
import type { EditionModel, GameModel } from "@cartridge/arcade";

export interface EditionListItem {
  id: number;
  name: string;
  certified: boolean;
  whitelisted: boolean;
  published: boolean;
  active: boolean;
  edition: EditionModel;
}

export interface EditionsViewModel {
  game: GameModel | null;
  selectedEdition: EditionModel | null;
  editions: EditionListItem[];
  isEditionOwner: boolean;
  isGameOwner: boolean;
  navigateToEdition: (edition: EditionModel) => void;
  setLocalEdition: (edition: EditionModel | null) => void;
  updateLocalEdition: (
    updater: (edition: EditionModel) => EditionModel,
  ) => void;
}

export function useEditionsViewModel(): EditionsViewModel {
  const { address } = useAccount();
  const { editions: allEditions } = useArcade();
  const { game, edition } = useProject();
  const { ownerships } = useOwnerships();
  const navigate = useNavigate();
  const { location } = useRouterState();

  const [localEdition, setLocalEdition] = useState<EditionModel | null>(
    edition ? cloneEdition(edition) : null,
  );

  const gameEditions = useMemo(() => {
    if (!game) return [];
    return allEditions.filter((item) => item.gameId === game.id);
  }, [allEditions, game]);

  const editionOwner = useMemo(() => {
    if (!localEdition || !address) return false;
    const ownership = ownerships.find(
      (item) =>
        item.tokenId === BigInt(localEdition.id) &&
        BigInt(item.accountAddress) === BigInt(address),
    );
    return Boolean(ownership);
  }, [localEdition, ownerships, address]);

  const gameOwner = useMemo(() => {
    if (!game || !address) return false;
    const ownership = ownerships.find(
      (item) => item.tokenId === BigInt(game.id),
    );
    if (!ownership) return false;
    return BigInt(ownership.accountAddress) === BigInt(address);
  }, [game, ownerships, address]);

  const editionItems = useMemo(() => {
    return gameEditions.map(
      (item) =>
        ({
          id: item.id,
          name: item.name,
          certified: item.certified ?? false,
          whitelisted: item.whitelisted,
          published: item.published,
          active: item.id === localEdition?.id,
          edition: item,
        }) satisfies EditionListItem,
    );
  }, [gameEditions, localEdition?.id]);

  const navigateToEdition = useCallback(
    (targetEdition: EditionModel) => {
      if (!game) return;
      let pathname = location.pathname;
      const gameName = `${game.name.toLowerCase().replace(/ /g, "-")}`;
      const editionName = `${targetEdition.name.toLowerCase().replace(/ /g, "-")}`;
      pathname = pathname.replace(/\/game\/[^/]+/, "");
      pathname = pathname.replace(/\/edition\/[^/]+/, "");
      pathname = joinPaths(`game/${gameName}/edition/${editionName}`, pathname);
      navigate({ to: pathname || "/" });
      setLocalEdition(cloneEdition(targetEdition));
    },
    [game, location.pathname, navigate],
  );

  const updateLocalEdition = useCallback(
    (updater: (edition: EditionModel) => EditionModel) => {
      setLocalEdition((current) =>
        current ? updater(cloneEdition(current)) : current,
      );
    },
    [],
  );

  return {
    game: game ?? null,
    selectedEdition: localEdition,
    editions: editionItems,
    isEditionOwner: editionOwner,
    isGameOwner: gameOwner,
    navigateToEdition,
    setLocalEdition: (value) =>
      setLocalEdition(value ? cloneEdition(value) : null),
    updateLocalEdition,
  } satisfies EditionsViewModel;
}

function cloneEdition(edition: EditionModel): EditionModel {
  if (typeof edition.clone === "function") {
    return edition.clone();
  }
  return { ...edition } as EditionModel;
}
