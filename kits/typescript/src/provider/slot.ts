/**
 * Provider class for interacting with the Cartridge World contracts
 *
 * @param manifest - The manifest containing contract addresses and ABIs
 */
import { NAMESPACE } from "../constants";
import * as SystemProps from "./types";
import { getContractByName } from "./helpers";
import { AllowArray, Call } from "starknet";

export class Slot {
  private manifest: any;

  constructor(manifest: any) {
    this.manifest = manifest;
  }

  public deploy(props: SystemProps.SlotDeployProps): AllowArray<Call> {
    const { service, project, tier } = props;
    const entrypoint = "deploy";

    return {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-slot`),
      entrypoint,
      calldata: [service, project, tier],
    };
  }

  public remove(props: SystemProps.SlotRemoveProps): AllowArray<Call> {
    const { service, project } = props;
    const entrypoint = "remove";

    return {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-slot`),
      entrypoint,
      calldata: [service, project],
    };
  }

  public hire(props: SystemProps.SlotHireProps): AllowArray<Call> {
    const { project, accountId, role } = props;
    const entrypoint = "hire";

    return {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-slot`),
      entrypoint,
      calldata: [project, accountId, role],
    };
  }

  public fire(props: SystemProps.SlotFireProps): AllowArray<Call> {
    const { project, accountId } = props;
    const entrypoint = "fire";

    return {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-slot`),
      entrypoint,
      calldata: [project, accountId],
    };
  }
}
