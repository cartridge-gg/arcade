import { createContext, useState, ReactNode, useMemo } from "react";

type ProjectContextType = {
  isReady: boolean;
  project: string;
  namespace: string;
  indexerUrl: string;
  setProject: (project: string) => void;
  setNamespace: (namespace: string) => void;
};

const initialState: ProjectContextType = {
  isReady: false,
  project: "arcade",
  namespace: "",
  indexerUrl: "",
  setProject: () => {},
  setNamespace: () => {},
};

export const ProjectContext = createContext<ProjectContextType>(initialState);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<string>(initialState.project);
  const [namespace, setNamespace] = useState<string>(initialState.namespace);

  const indexerUrl = useMemo(() => {
    if (!project) return "";
    return `https://api.cartridge.gg/x/${project}/torii`;
  }, [project]);

  const isReady = useMemo(() => {
    return !!indexerUrl;
  }, [indexerUrl]);

  return (
    <ProjectContext.Provider
      value={{
        isReady,
        project,
        namespace,
        indexerUrl,
        setProject,
        setNamespace,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
