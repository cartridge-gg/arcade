import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import {
  aggregateTraitValues,
  fetchTraitValues,
  type TraitSelection,
  type TraitValueRow,
} from "@cartridge/arcade/marketplace";
import { toriiRuntime } from "../layers/arcade";
import { ToriiGrpcClient } from "../runtime";

export type TraitValuesOptions = {
  contractAddress: string;
  traitName: string;
  otherTraitFilters?: TraitSelection[];
  projects?: string[];
};

const fetchTraitValuesEffect = ({
  contractAddress,
  traitName,
  otherTraitFilters = [],
  projects,
}: TraitValuesOptions) =>
  Effect.gen(function* () {
    if (!contractAddress || !traitName) {
      return [] as TraitValueRow[];
    }
    yield* ToriiGrpcClient;

    const result = yield* Effect.tryPromise({
      try: () =>
        fetchTraitValues({
          address: contractAddress,
          traitName,
          otherTraitFilters,
          projects,
        }),
      catch: (error) => error as Error,
    });

    if (result.errors.length > 0) {
      yield* Effect.logWarning(
        "Failed to fetch trait values for some projects",
        result.errors.map((error) => ({
          projectId: error.projectId,
          message: error.error.message,
        })),
      );
    }

    return aggregateTraitValues(result.pages);
  });

const traitValuesFamily = Atom.family((key: string) => {
  const options: TraitValuesOptions = JSON.parse(key);
  return toriiRuntime
    .atom(fetchTraitValuesEffect(options))
    .pipe(Atom.keepAlive);
});

export const traitValuesAtom = (options: TraitValuesOptions) => {
  const sortedKey = JSON.stringify({
    contractAddress: options.contractAddress,
    traitName: options.traitName,
    otherTraitFilters: options.otherTraitFilters
      ? [...options.otherTraitFilters].sort(
          (a, b) =>
            a.name.localeCompare(b.name) || a.value.localeCompare(b.value),
        )
      : undefined,
    projects: options.projects ? [...options.projects].sort() : undefined,
  });
  return traitValuesFamily(sortedKey);
};
