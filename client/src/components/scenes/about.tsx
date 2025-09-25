import { About } from "@/components/about";
import { useProject } from "@/hooks/project";
import { Socials } from "@cartridge/arcade";
import { useMemo } from "react";

export const AboutScene = () => {
  const { edition, game } = useProject();

  const socials = useMemo(() => {
    return Socials.merge(edition?.socials, game?.socials);
  }, [edition, game]);

  if (!edition) return null;

  return <About edition={edition} socials={socials} />;
};
