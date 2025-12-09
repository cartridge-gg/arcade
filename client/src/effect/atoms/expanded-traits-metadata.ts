import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import {
  aggregateTraitMetadata,
  fetchExpandedTraitsMetadata,
  type TraitMetadataRow,
  type TraitSelection,
} from "@cartridge/arcade/marketplace";
import { toriiRuntime } from "../layers/arcade";
import { ToriiGrpcClient } from "../runtime";

export type ExpandedTraitsMetadata = TraitMetadataRow;

export type ExpandedTraitsMetadataOptions = {
  contractAddress: string;
  traitNames: string[];
  otherTraitFilters?: TraitSelection[];
  projects?: string[];
};

const fetchExpandedTraitsMetadataEffect = ({
  contractAddress,
  traitNames,
  otherTraitFilters,
  projects,
}: ExpandedTraitsMetadataOptions) =>
  Effect.gen(function* () {
    if (!contractAddress || traitNames.length === 0) {
      return [] as ExpandedTraitsMetadata[];
    }
    yield* ToriiGrpcClient;

    const result = yield* Effect.tryPromise({
      try: () =>
        fetchExpandedTraitsMetadata({
          address: contractAddress,
          traitNames,
          otherTraitFilters,
          projects,
        }),
      catch: (error) => error as Error,
    });

    if (result.errors.length > 0) {
      yield* Effect.logWarning(
        "Failed to fetch expanded traits metadata for some projects",
        result.errors.map((error) => ({
          projectId: error.projectId,
          message: error.error.message,
        })),
      );
    }

    return aggregateTraitMetadata(result.pages);
  });

const expandedTraitsMetadataFamily = Atom.family((key: string) => {
  const options: ExpandedTraitsMetadataOptions = JSON.parse(key);
  return toriiRuntime
    .atom(fetchExpandedTraitsMetadataEffect(options))
    .pipe(Atom.keepAlive);
});

export const expandedTraitsMetadataAtom = (
  options: ExpandedTraitsMetadataOptions,
) => {
  const sortedKey = JSON.stringify({
    contractAddress: options.contractAddress,
    traitNames: [...options.traitNames].sort(),
    otherTraitFilters: options.otherTraitFilters
      ? [...options.otherTraitFilters].sort(
          (a, b) =>
            a.name.localeCompare(b.name) || a.value.localeCompare(b.value),
        )
      : undefined,
    projects: options.projects ? [...options.projects].sort() : undefined,
  });
  return expandedTraitsMetadataFamily(sortedKey);
};
