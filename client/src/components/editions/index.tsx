import { useCallback, useEffect, useMemo, useState } from "react";
import { useArcade } from "@/hooks/arcade";
import { useLocation, useNavigate } from "react-router-dom";
import { Register } from "./register";
import type { EditionModel } from "@cartridge/arcade";
import EditionActions from "../modules/edition-actions";
import EditionAction from "../modules/edition-item";
import { useProject } from "@/hooks/project";
import { useOwnerships } from "@/hooks/ownerships";
import { useAccount } from "@starknet-react/core";
import { joinPaths } from "@/helpers";
import { Publish } from "./publish";
import { Whitelist } from "./whitelist";
import { Prioritize } from "./prioritize";
import { Select, SelectContent, DotsIcon } from "@cartridge/ui";
import ArcadeMenuButton from "../modules/menu-button";

export const Editions = () => {
  const { address } = useAccount();
  const { editions } = useArcade();
  const { game, edition: original } = useProject();
  const { ownerships } = useOwnerships();
  const [edition, setEdition] = useState<EditionModel | null>(null);

  const editionOwner = useMemo(() => {
    if (!edition) return false;
    const ownership = ownerships.find(
      (ownership) =>
        ownership.tokenId === BigInt(edition.id) &&
        BigInt(ownership.accountAddress) === BigInt(address || "0x0"),
    );
    return !!ownership;
  }, [edition, ownerships, address]);

  const gameOwner = useMemo(() => {
    if (!game) return false;
    const ownership = ownerships.find(
      (ownership) => ownership.tokenId === BigInt(game.id),
    );
    if (!ownership) return false;
    return BigInt(ownership.accountAddress) === BigInt(address || "0x0");
  }, [game, ownerships, address]);

  const gameEditions = useMemo(() => {
    if (!game) return [];
    return editions.filter((edition) => edition.gameId === game.id);
  }, [editions, game]);

  const location = useLocation();
  const navigate = useNavigate();
  const onClick = useCallback(
    (edition: EditionModel) => {
      if (!game) return;
      let pathname = location.pathname;
      const gameName = `${game?.name.toLowerCase().replace(/ /g, "-") || game.id}`;
      const editionName = `${edition?.name.toLowerCase().replace(/ /g, "-") || edition.id}`;
      pathname = pathname.replace(/\/game\/[^/]+/, "");
      pathname = pathname.replace(/\/edition\/[^/]+/, "");
      pathname = joinPaths(`game/${gameName}/edition/${editionName}`, pathname);
      navigate(pathname || "/");
    },
    [location, navigate, game],
  );

  const setWhitelisted = useCallback(
    (status: boolean) => {
      if (!edition) return;
      const newEdition = edition.clone();
      newEdition.whitelisted = status;
      setEdition(newEdition);
    },
    [edition],
  );

  const setPublished = useCallback(
    (status: boolean) => {
      if (!edition) return;
      const newEdition = edition.clone();
      newEdition.published = status;
      setEdition(newEdition);
    },
    [edition],
  );

  useEffect(() => {
    if (!original) {
      setEdition(null);
      return;
    }
    setEdition(original.clone());
  }, [original]);

  if (!game || gameEditions.length === 0) return null;

  return (
    <div className="flex items-stretch gap-2 h-8">
      <EditionActions
        disabled={gameEditions.length < 2}
        label={edition?.name || ""}
        certified={edition?.certified}
        whitelisted={edition?.whitelisted}
        published={edition?.published}
      >
        {gameEditions.map((item) => (
          <EditionAction
            key={item?.id}
            active={item.id === edition?.id}
            label={item.name}
            certified={item.certified}
            whitelisted={item.whitelisted}
            published={item.published}
            onClick={() => onClick(item)}
          />
        ))}
      </EditionActions>
      <Register game={game} />
      {edition && (editionOwner || gameOwner) && (
        <Select>
          <div className="grow flex justify-end items-center self-center">
            <ArcadeMenuButton
              active={false}
              className="bg-background-150 border border-background-200 hover:text-foreground-100"
            >
              <DotsIcon size="sm" />
            </ArcadeMenuButton>
          </div>
          <SelectContent className="bg-background-100">
            {edition && editionOwner && (
              <Register key={edition.id} game={game} edition={edition} />
            )}
            {edition && editionOwner && (
              <Publish
                key={edition.published ? "hide" : "publish"}
                edition={edition}
                action={edition.published ? "hide" : "publish"}
                setPublished={setPublished}
              />
            )}
            {edition && gameOwner && (
              <Whitelist
                key={edition.whitelisted ? "blacklist" : "whitelist"}
                edition={edition}
                action={edition.whitelisted ? "blacklist" : "whitelist"}
                setWhitelisted={setWhitelisted}
              />
            )}
            {edition && gameOwner && (
              <Prioritize
                key="up"
                edition={edition}
                editions={gameEditions}
                direction="up"
              />
            )}
            {edition && gameOwner && (
              <Prioritize
                key="down"
                edition={edition}
                editions={gameEditions}
                direction="down"
              />
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
