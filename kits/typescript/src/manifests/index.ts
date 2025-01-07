import slot from "../../../../contracts/manifest_slot.json";
import dev from "../../../../contracts/manifest_slot.json";

export enum Network {
  Slot = "slot",
  Dev = "dev",
}

export const manifests = {
  [Network.Slot]: slot,
  [Network.Dev]: dev,
};
