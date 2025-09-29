import { Items } from "@/components/items";
import { useProject } from "@/hooks/project";

export const ItemsScene = () => {
  const { collection } = useProject();

  if (!collection) return null;
  return <Items collectionAddress={collection} />;
};
