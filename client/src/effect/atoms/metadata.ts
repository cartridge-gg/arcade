import { Atom } from "@effect-atom/atom-react";
import { Effect, Layer } from "effect";
import {
  aggregateTraitMetadata,
  fetchCollectionTraitMetadata,
  type TraitMetadataRow,
  type TraitSelection,
} from "@cartridge/arcade/marketplace";

export type Metadata = TraitMetadataRow;

export type MetadataOptions = {
  contractAddress: string;
  traits: TraitSelection[];
  projects?: string[];
};

const fetchMetadataEffect = ({
  contractAddress,
  traits,
  projects,
}: MetadataOptions) =>
  Effect.gen(function* () {
    if (!contractAddress) {
      return [] as Metadata[];
    }

    const result = yield* Effect.tryPromise({
      try: () =>
        fetchCollectionTraitMetadata({
          address: contractAddress,
          traits,
          projects,
        }),
      catch: (error) => error as Error,
    });

    if (result.errors.length > 0) {
      yield* Effect.logWarning(
        "Failed to fetch metadata for some projects",
        result.errors.map((error) => ({
          projectId: error.projectId,
          message: error.error.message,
        })),
      );
    }

    return aggregateTraitMetadata(result.pages);
  });

const metadataRuntime = Atom.runtime(Layer.empty);

const createUncachedMetadataAtom = (options: MetadataOptions) =>
  metadataRuntime.atom(fetchMetadataEffect(options)).pipe(Atom.keepAlive);

type MetadataAtom = ReturnType<typeof createUncachedMetadataAtom>;

const metadataAtomCache = new Map<string, MetadataAtom>();

const buildCacheKey = (options: MetadataOptions): string => {
  const traitsKey = JSON.stringify(options.traits);
  const projectsKey = options.projects
    ? JSON.stringify([...options.projects].sort())
    : "";
  return `${options.contractAddress}:${traitsKey}:${projectsKey}`;
};

export const createMetadataAtom = (options: MetadataOptions): MetadataAtom => {
  const key = buildCacheKey(options);

  let atom = metadataAtomCache.get(key);
  if (!atom) {
    atom = createUncachedMetadataAtom(options);
    metadataAtomCache.set(key, atom);
  }

  return atom;
};
