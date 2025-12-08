import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import {
  aggregateTraitMetadata,
  fetchCollectionTraitMetadata,
  type TraitMetadataRow,
  type TraitSelection,
} from "@cartridge/arcade/marketplace";
import { toriiRuntime } from "../layers/arcade";
import { ToriiGrpcClient } from "../runtime";

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
    const { client } = yield* ToriiGrpcClient;

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

const metadataFamily = Atom.family((key: string) => {
  const options: MetadataOptions = JSON.parse(key);
  return toriiRuntime.atom(fetchMetadataEffect(options)).pipe(Atom.keepAlive);
});

export const metadataAtom = (options: MetadataOptions) => {
  const sortedKey = JSON.stringify({
    contractAddress: options.contractAddress,
    traits: options.traits,
    projects: options.projects ? [...options.projects].sort() : undefined,
  });
  return metadataFamily(sortedKey);
};
