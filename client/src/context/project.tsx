import { createContext, useState, ReactNode, useEffect, useMemo } from "react";
import { useArcade } from "@/hooks/arcade";
import { EditionModel, GameModel } from "@bal7hazar/arcade-sdk";
import { useSearchParams } from "react-router-dom";

type ProjectContextType = {
  gameId: number;
  project: string;
  namespace: string;
  setGameId: (gameId: number) => void;
  setProject: (project: string) => void;
  setNamespace: (namespace: string) => void;
};

const initialState: ProjectContextType = {
  gameId: 0,
  project: "",
  namespace: "",
  setGameId: () => {},
  setProject: () => {},
  setNamespace: () => {},
};

export const ProjectContext = createContext<ProjectContextType>(initialState);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [gameId, setGameId] = useState<number>(initialState.gameId);
  const [project, setProject] = useState<string>(initialState.project);
  const [namespace, setNamespace] = useState<string>(initialState.namespace);

  const [searchParams] = useSearchParams();
  const { games, editions } = useArcade();

  const {
    game,
    edition,
  }: { game: GameModel | undefined; edition: EditionModel | undefined } =
    useMemo(() => {
      const newGame = games.find(
        (game) => game.id.toString() === searchParams.get("game"),
      );
      if (!newGame) return { game: undefined, edition: undefined };
      const newEdition = editions.find(
        (edition) => edition.id.toString() === searchParams.get("edition"),
      );
      if (newEdition) return { game: newGame, edition: newEdition };
      const gameEditions = editions.filter(
        (edition) => edition.gameId === newGame.id,
      );
      if (gameEditions.length === 0)
        return { game: newGame, edition: undefined };
      const defaultEdition = gameEditions
        .sort((a, b) => a.id - b.id)
        .sort((a, b) => b.priority - a.priority)[0];
      return { game: newGame, edition: defaultEdition };
    }, [games, editions, searchParams]);

  useEffect(() => {
    if (game && edition) {
      setGameId(game.id);
      setProject(edition.config.project);
      setNamespace(edition.namespace);
      return;
    }
    if (game && !edition) {
      setGameId(game.id);
      setProject(initialState.project);
      setNamespace(initialState.namespace);
      return;
    }
    setGameId(initialState.gameId);
    setProject(initialState.project);
    setNamespace(initialState.namespace);
    return;
  }, [game, edition, setGameId, setProject, setNamespace]);

  return (
    <ProjectContext.Provider
      value={{
        gameId,
        project,
        namespace,
        setGameId,
        setProject,
        setNamespace,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
