/**
 * Provider class for interacting with the Cartridge World contracts
 *
 * @param manifest - The manifest containing contract addresses and ABIs
 * @param url - Optional RPC URL for the provider
 */
import { NAMESPACE } from "../constants";
import * as SystemProps from "./types";
import { getContractByName } from "./helpers";
import { AllowArray, Call } from "starknet";

export class Registry {
  private manifest: any;
  private name: string;

  constructor(manifest: any) {
    this.manifest = manifest;
    this.name = `${NAMESPACE}-Registry`;
  }

  public register_game(props: SystemProps.RegistryRegisterGameProps): AllowArray<Call> {
    const {
      worldAddress,
      namespace,
      project,
      color,
      name,
      description,
      image,
      banner,
      discord,
      telegram,
      twitter,
      youtube,
      website,
    } = props;
    const entrypoint = "register_game";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [
        worldAddress,
        namespace,
        project,
        color,
        name,
        description,
        image,
        banner,
        discord,
        telegram,
        twitter,
        youtube,
        website,
      ],
    };
  }

  public update_game(props: SystemProps.RegistryUpdateGameProps): AllowArray<Call> {
    const {
      worldAddress,
      namespace,
      color,
      name,
      description,
      image,
      banner,
      discord,
      telegram,
      twitter,
      youtube,
      website,
    } = props;
    const entrypoint = "update_game";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [
        worldAddress,
        namespace,
        color,
        name,
        description,
        image,
        banner,
        discord,
        telegram,
        twitter,
        youtube,
        website,
      ],
    };
  }

  public publish_game(props: SystemProps.RegistryPublishGameProps): AllowArray<Call> {
    const { worldAddress, namespace } = props;
    const entrypoint = "publish_game";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [worldAddress, namespace],
    };
  }

  public hide_game(props: SystemProps.RegistryHideGameProps): AllowArray<Call> {
    const { worldAddress, namespace } = props;
    const entrypoint = "hide_game";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [worldAddress, namespace],
    };
  }

  public whitelist_game(props: SystemProps.RegistryWhitelistGameProps): AllowArray<Call> {
    const { worldAddress, namespace } = props;
    const entrypoint = "whitelist_game";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [worldAddress, namespace],
    };
  }

  public blacklist_game(props: SystemProps.RegistryBlacklistGameProps): AllowArray<Call> {
    const { worldAddress, namespace } = props;
    const entrypoint = "blacklist_game";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [worldAddress, namespace],
    };
  }

  public remove_game(props: SystemProps.RegistryRemoveGameProps): AllowArray<Call> {
    const { worldAddress, namespace } = props;
    const entrypoint = "remove_game";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [worldAddress, namespace],
    };
  }

  public register_achievement(props: SystemProps.RegistryRegisterAchievementProps): AllowArray<Call> {
    const { worldAddress, namespace, identifier, karma } = props;
    const entrypoint = "register_achievement";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [worldAddress, namespace, identifier, karma],
    };
  }

  public update_achievement(props: SystemProps.RegistryUpdateAchievementProps): AllowArray<Call> {
    const { worldAddress, namespace, identifier, karma } = props;
    const entrypoint = "update_achievement";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [worldAddress, namespace, identifier, karma],
    };
  }

  public remove_achievement(props: SystemProps.RegistryRemoveAchievementProps): AllowArray<Call> {
    const { worldAddress, namespace, identifier } = props;
    const entrypoint = "remove_achievement";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [worldAddress, namespace, identifier],
    };
  }
}
