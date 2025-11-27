import { createEntityQueryWithUpdatesAtom } from "@dojoengine/react/effect";
import { mainnetConfig, toriiRuntime } from "../layers/arcade";
import { KeysClause, ToriiQueryBuilder } from "@dojoengine/sdk";

const clause = KeysClause([], [], "VariableLen").build();
export const arcadeAtom = createEntityQueryWithUpdatesAtom(
  toriiRuntime,
  new ToriiQueryBuilder()
    .withClause(clause)
    .includeHashedKeys()
    .withLimit(1000),
  clause,
  mainnetConfig.manifest.world.address,
);
