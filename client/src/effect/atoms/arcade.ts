import { createEntityQueryWithUpdatesAtom } from "@dojoengine/react/effect";
import { ARCADE_MODELS, mainnetConfig, toriiRuntime } from "../layers/arcade";
import { KeysClause, ToriiQueryBuilder } from "@dojoengine/sdk";

const clause = KeysClause([], [], "VariableLen").build();
export const arcadeAtom = createEntityQueryWithUpdatesAtom(
  toriiRuntime,
  new ToriiQueryBuilder()
    .withClause(clause)
    .withEntityModels(ARCADE_MODELS)
    .includeHashedKeys()
    .withLimit(10000) as unknown as Parameters<
    typeof createEntityQueryWithUpdatesAtom
  >[1],
  clause,
  mainnetConfig.manifest.world.address,
);
