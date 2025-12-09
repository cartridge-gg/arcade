import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import {
  aggregateTraitNamesSummary,
  fetchTraitNamesSummary,
  type TraitNameSummary,
} from "@cartridge/arcade/marketplace";
import { toriiRuntime } from "../layers/arcade";
import { ToriiGrpcClient } from "../runtime";

export type TraitNamesSummaryOptions = {
  contractAddress: string;
  projects?: string[];
};

const fetchTraitNamesEffect = ({
  contractAddress,
  projects,
}: TraitNamesSummaryOptions) =>
  Effect.gen(function* () {
    if (!contractAddress) {
      return [] as TraitNameSummary[];
    }
    yield* ToriiGrpcClient;

    const result = yield* Effect.tryPromise({
      try: () =>
        fetchTraitNamesSummary({
          address: contractAddress,
          projects,
        }),
      catch: (error) => error as Error,
    });

    if (result.errors.length > 0) {
      yield* Effect.logWarning(
        "Failed to fetch trait names for some projects",
        result.errors.map((error) => ({
          projectId: error.projectId,
          message: error.error.message,
        })),
      );
    }

    return aggregateTraitNamesSummary(result.pages);
  });

const traitNamesFamily = Atom.family((key: string) => {
  const options: TraitNamesSummaryOptions = JSON.parse(key);
  return toriiRuntime.atom(fetchTraitNamesEffect(options)).pipe(Atom.keepAlive);
});

export const traitNamesAtom = (options: TraitNamesSummaryOptions) => {
  const sortedKey = JSON.stringify({
    contractAddress: options.contractAddress,
    projects: options.projects ? [...options.projects].sort() : undefined,
  });
  return traitNamesFamily(sortedKey);
};
