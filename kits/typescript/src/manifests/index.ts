import slot from "../../../../contracts/manifest_slot.json";
import sepolia from "../../../../contracts/manifest_sepolia.json";

export { slot, sepolia };

export enum Network {
  Slot = "slot",
  Sepolia = "sepolia",
  Default = "default",
}

export const manifests = {
  [Network.Slot]: slot,
  [Network.Sepolia]: sepolia,
  [Network.Default]: sepolia,
};
