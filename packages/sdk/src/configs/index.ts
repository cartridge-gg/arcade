import { createDojoConfig } from "@dojoengine/core";

import manifest from "../../../../contracts/manifest_slot.json";

export const config = createDojoConfig({
  manifest,
});
