import { About } from "@/components/about";
import { useProject } from "@/hooks/project";

export const AboutScene = () => {
  const { edition } = useProject();

  if (!edition) return null;

  return <About edition={edition} />;
};
