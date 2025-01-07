/**
 * Provider class for interacting with the Cartridge World contracts
 *
 * @param manifest - The manifest containing contract addresses and ABIs
 * @param url - Optional RPC URL for the provider
 */
import { NAMESPACE } from "../constants";
import * as SystemProps from "./types";
import { ArcadeProvider } from "./index";
import { getContractByName } from "./helpers";

export class Slot {
  private manifest: any;
  private provider: ArcadeProvider;

  constructor(manifest: any, provider: ArcadeProvider) {
    this.manifest = manifest;
    this.provider = provider;
  }

  public async deploy(props: SystemProps.SlotDeployProps) {
    const { service, project, tier, signer } = props;
    const entrypoint = "deploy";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-slot`),
      entrypoint,
      calldata: [service, project, tier],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async remove(props: SystemProps.SlotRemoveProps) {
    const { service, project, signer } = props;
    const entrypoint = "remove";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-slot`),
      entrypoint,
      calldata: [service, project],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async hire(props: SystemProps.SlotHireProps) {
    const { project, accountId, role, signer } = props;
    const entrypoint = "hire";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-slot`),
      entrypoint,
      calldata: [project, accountId, role],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async fire(props: SystemProps.SlotFireProps) {
    const { project, accountId, signer } = props;
    const entrypoint = "fire";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-slot`),
      entrypoint,
      calldata: [project, accountId],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }
}
