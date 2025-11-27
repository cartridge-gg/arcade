import { useMemo } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import { editionsAtom } from "@/effect/atoms";
import { unwrapOr } from "@/effect/utils/result";
import { useProject } from "./project";
import { useAddress } from "./address";
import { useCollectibles, type Collection } from "@/hooks/token-fetcher";
import { DEFAULT_PROJECT } from "@/constants";

export { CollectionType, type Collection } from "@/hooks/token-fetcher";

export const useCollections = () => {
  const { edition } = useProject();
  const { address } = useAddress();

  const editionsResult = useAtomValue(editionsAtom);
  const editions = unwrapOr(editionsResult, []);

  const projects = useMemo(
    () => [DEFAULT_PROJECT, ...editions.map((ed) => ed.config.project)],
    [editions],
  );

  const { collections: allCollections, status } = useCollectibles(
    projects,
    address,
  );

  const collections = useMemo(() => {
    if (!edition) return allCollections;
    return allCollections.filter(
      (collection: Collection) => collection.project === edition.config.project,
    );
  }, [edition, allCollections]);

  return { collections, status };
};
