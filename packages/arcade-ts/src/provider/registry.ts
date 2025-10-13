/**
 * Provider class for interacting with the Cartridge World contracts
 *
 * @param manifest - The manifest containing contract addresses and ABIs
 * @param url - Optional RPC URL for the provider
 */
import { NAMESPACE } from "../constants";
import type * as SystemProps from "./types";
import { getContractByName } from "./helpers";
import type { AllowArray, Call } from "starknet";

export class Registry {
  private manifest: any;
  private name: string;

  constructor(manifest: any) {
    this.manifest = manifest;
    this.name = `${NAMESPACE}-Registry`;
  }

  public register_game(
    props: SystemProps.RegistryRegisterGameProps,
  ): AllowArray<Call> {
    const {
      worldAddress,
      namespace,
      project,
      rpc,
      policies,
      color,
      game_image,
      edition_image,
      external_url,
      description,
      game_name,
      edition_name,
      game_attributes,
      edition_attributes,
      animation_url,
      youtube_url,
      properties,
      game_socials,
      edition_socials,
    } = props;
    const entrypoint = "register_game";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [
        worldAddress,
        namespace,
        project,
        rpc,
        policies,
        color,
        game_image,
        edition_image,
        external_url,
        description,
        game_name,
        edition_name,
        game_attributes,
        edition_attributes,
        animation_url,
        youtube_url,
        properties,
        game_socials,
        edition_socials,
      ],
    };
  }

  public update_game(
    props: SystemProps.RegistryUpdateGameProps,
  ): AllowArray<Call> {
    const {
      gameId,
      color,
      image,
      image_data,
      external_url,
      description,
      name,
      attributes,
      animation_url,
      youtube_url,
      properties,
      socials,
    } = props;
    const entrypoint = "update_game";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [
        gameId,
        color,
        image,
        image_data,
        external_url,
        description,
        name,
        attributes,
        animation_url,
        youtube_url,
        properties,
        socials,
      ],
    };
  }

  public publish_game(
    props: SystemProps.RegistryPublishGameProps,
  ): AllowArray<Call> {
    const { gameId } = props;
    const entrypoint = "publish_game";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [gameId],
    };
  }

  public hide_game(props: SystemProps.RegistryHideGameProps): AllowArray<Call> {
    const { gameId } = props;
    const entrypoint = "hide_game";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [gameId],
    };
  }

  public whitelist_game(
    props: SystemProps.RegistryWhitelistGameProps,
  ): AllowArray<Call> {
    const { gameId } = props;
    const entrypoint = "whitelist_game";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [gameId],
    };
  }

  public blacklist_game(
    props: SystemProps.RegistryBlacklistGameProps,
  ): AllowArray<Call> {
    const { gameId } = props;
    const entrypoint = "blacklist_game";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [gameId],
    };
  }

  public remove_game(
    props: SystemProps.RegistryRemoveGameProps,
  ): AllowArray<Call> {
    const { gameId } = props;
    const entrypoint = "remove_game";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [gameId],
    };
  }

  public register_edition(
    props: SystemProps.RegistryRegisterEditionProps,
  ): AllowArray<Call> {
    const {
      worldAddress,
      namespace,
      gameId,
      project,
      rpc,
      policies,
      color,
      image,
      image_data,
      external_url,
      description,
      name,
      attributes,
      animation_url,
      youtube_url,
      properties,
      socials,
    } = props;
    const entrypoint = "register_edition";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [
        worldAddress,
        namespace,
        gameId,
        project,
        rpc,
        policies,
        color,
        image,
        image_data,
        external_url,
        description,
        name,
        attributes,
        animation_url,
        youtube_url,
        properties,
        socials,
      ],
    };
  }

  public update_edition(
    props: SystemProps.RegistryUpdateEditionProps,
  ): AllowArray<Call> {
    const {
      editionId,
      project,
      rpc,
      policies,
      color,
      image,
      image_data,
      external_url,
      description,
      name,
      attributes,
      animation_url,
      youtube_url,
      properties,
      socials,
    } = props;
    const entrypoint = "update_edition";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [
        editionId,
        project,
        rpc,
        policies,
        color,
        image,
        image_data,
        external_url,
        description,
        name,
        attributes,
        animation_url,
        youtube_url,
        properties,
        socials,
      ],
    };
  }

  public prioritize_edition(
    props: SystemProps.RegistryPrioritizeEditionProps,
  ): AllowArray<Call> {
    const { editionId, priority } = props;
    const entrypoint = "prioritize_edition";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [editionId, priority],
    };
  }

  public publish_edition(
    props: SystemProps.RegistryPublishEditionProps,
  ): AllowArray<Call> {
    const { editionId } = props;
    const entrypoint = "publish_edition";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [editionId],
    };
  }

  public hide_edition(
    props: SystemProps.RegistryHideEditionProps,
  ): AllowArray<Call> {
    const { editionId } = props;
    const entrypoint = "hide_edition";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [editionId],
    };
  }

  public whitelist_edition(
    props: SystemProps.RegistryWhitelistEditionProps,
  ): AllowArray<Call> {
    const { editionId } = props;
    const entrypoint = "whitelist_edition";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [editionId],
    };
  }

  public blacklist_edition(
    props: SystemProps.RegistryBlacklistEditionProps,
  ): AllowArray<Call> {
    const { editionId } = props;
    const entrypoint = "blacklist_edition";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [editionId],
    };
  }

  public remove_edition(
    props: SystemProps.RegistryRemoveEditionProps,
  ): AllowArray<Call> {
    const { editionId } = props;
    const entrypoint = "remove_edition";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [editionId],
    };
  }
}
