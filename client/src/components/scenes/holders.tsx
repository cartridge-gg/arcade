import { Holders } from "@/components/holders";
import { useProject } from "@/hooks/project";

export const HoldersScene = () => {
  const { collection, edition } = useProject();
  if (!edition) return;
  if (!collection) return;
  return <Holders edition={edition} collectionAddress={collection} />;
};
