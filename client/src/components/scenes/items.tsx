import { Items } from "@/components/items";
import { useProject } from "@/hooks/project";

export const ItemsScene = () => {

  const { game, edition, collection } = useProject();

  if (!edition) return null;
  if (!game) return <Items collectionAddress={collection ?? "0x0"} edition={edition} />;

  return <Items edition={edition} collectionAddress={collection ?? "0x0"} />;
};
