import { About } from "@/components/about";
import { useArcade } from "@/hooks/arcade";
import { useProject } from "@/hooks/project";
import { EditionModel } from "@bal7hazar/arcade-sdk";
import { useMemo } from "react";

export const AboutScene = () => {
  const { editions } = useArcade();

  const { project, namespace } = useProject();

  const edition: EditionModel | undefined = useMemo(() => {
    return Object.values(editions).find(
      (edition) =>
        edition.namespace === namespace && edition.config.project === project,
    );
  }, [editions, project, namespace]);

  if (!edition) return null;

  return <About edition={edition} />;
};
