import { useMemo } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import { collectionEditionsAtom, editionsAtom } from "@/effect/atoms";
import { unwrapOr } from "@/effect/utils/result";
import { useProject } from "./project";
import { useAddress } from "./address";
import { useCollectibles, type Collection } from "@/hooks/token-fetcher";
import { DEFAULT_PROJECT } from "@/constants";

export const useInventoryCollections = () => {
  const { edition } = useProject();
  const { address } = useAddress();

  const editionsResult = useAtomValue(editionsAtom);
  const editions = unwrapOr(editionsResult, []);
  const collectionEditionsResult = useAtomValue(collectionEditionsAtom);
  const collectionEditions = unwrapOr(collectionEditionsResult, []);

  const editionsWithCollections = useMemo(
    () =>
      editions
        .filter((ed) =>
          collectionEditions.some(
            (ce) => ce.active && BigInt(ce.edition) === BigInt(ed.id),
          ),
        )
        .filter((ed) => !edition || ed.id === edition.id),
    [editions, collectionEditions, edition],
  );

  const projects = useMemo(
    () =>
      editionsWithCollections
        .map((ed) => ed.config.project)
        .concat(!edition ? [DEFAULT_PROJECT] : []),
    [editionsWithCollections, edition],
  );

  const { collections: allCollections, status } = useCollectibles(
    projects,
    address,
  );

  const collections = useMemo(() => {
    const collections = [...allCollections];
    collections.forEach((collection: Collection) => {
      collection.iconUrl =
        editions.find((ed) => ed.config.project === collection.projects[0])
          ?.properties.icon ?? undefined;
    });
    return collections;
  }, [allCollections]);

  return { collections, status };
};
