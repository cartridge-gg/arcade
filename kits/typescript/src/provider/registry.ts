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

export class Registry {
  private manifest: any;
  private provider: ArcadeProvider;

  constructor(manifest: any, provider: ArcadeProvider) {
    this.manifest = manifest;
    this.provider = provider;
  }

  public async pin(props: SystemProps.RegistryPinProps) {
    const { achievementId, signer } = props;
    const entrypoint = "pin";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-registry`),
      entrypoint,
      calldata: [achievementId],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async unpin(props: SystemProps.RegistryUnpinProps) {
    const { achievementId, signer } = props;
    const entrypoint = "unpin";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-registry`),
      entrypoint,
      calldata: [achievementId],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async register_game(props: SystemProps.RegistryRegisterGameProps) {
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
      signer,
    } = props;
    const entrypoint = "register_game";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-registry`),
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
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async update_game(props: SystemProps.RegistryUpdateGameProps) {
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
      signer,
    } = props;
    const entrypoint = "update_game";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-registry`),
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
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async publish_game(props: SystemProps.RegistryPublishGameProps) {
    const { worldAddress, namespace, signer } = props;
    const entrypoint = "publish_game";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-registry`),
      entrypoint,
      calldata: [worldAddress, namespace],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async hide_game(props: SystemProps.RegistryHideGameProps) {
    const { worldAddress, namespace, signer } = props;
    const entrypoint = "hide_game";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-registry`),
      entrypoint,
      calldata: [worldAddress, namespace],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async whitelist_game(props: SystemProps.RegistryWhitelistGameProps) {
    const { worldAddress, namespace, signer } = props;
    const entrypoint = "whitelist_game";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-registry`),
      entrypoint,
      calldata: [worldAddress, namespace],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async blacklist_game(props: SystemProps.RegistryBlacklistGameProps) {
    const { worldAddress, namespace, signer } = props;
    const entrypoint = "blacklist_game";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-registry`),
      entrypoint,
      calldata: [worldAddress, namespace],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async remove_game(props: SystemProps.RegistryRemoveGameProps) {
    const { worldAddress, namespace, signer } = props;
    const entrypoint = "remove_game";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-registry`),
      entrypoint,
      calldata: [worldAddress, namespace],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async register_achievement(props: SystemProps.RegistryRegisterAchievementProps) {
    const { worldAddress, namespace, identifier, karma, signer } = props;
    const entrypoint = "register_achievement";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-registry`),
      entrypoint,
      calldata: [worldAddress, namespace, identifier, karma],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async update_achievement(props: SystemProps.RegistryUpdateAchievementProps) {
    const { worldAddress, namespace, identifier, karma, signer } = props;
    const entrypoint = "update_achievement";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-registry`),
      entrypoint,
      calldata: [worldAddress, namespace, identifier, karma],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async remove_achievement(props: SystemProps.RegistryRemoveAchievementProps) {
    const { worldAddress, namespace, identifier, signer } = props;
    const entrypoint = "remove_achievement";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-registry`),
      entrypoint,
      calldata: [worldAddress, namespace, identifier],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }
}
