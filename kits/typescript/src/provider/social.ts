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

export class Social {
  private manifest: any;
  private provider: ArcadeProvider;

  constructor(manifest: any, provider: ArcadeProvider) {
    this.manifest = manifest;
    this.provider = provider;
  }

  public async follow(props: SystemProps.SocialFollowProps) {
    const { target, signer } = props;
    const entrypoint = "follow";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [target],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async unfollow(props: SystemProps.SocialUnfollowProps) {
    const { target, signer } = props;
    const entrypoint = "unfollow";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [target],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async create_alliance(props: SystemProps.SocialCreateAllianceProps) {
    const { color, name, description, image, banner, discord, telegram, twitter, youtube, signer } = props;
    const entrypoint = "create_alliance";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [color, name, description, image, banner, discord, telegram, twitter, youtube],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async open_alliance(props: SystemProps.SocialOpenAllianceProps) {
    const { free, signer } = props;
    const entrypoint = "open_alliance";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [free],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async close_alliance(props: SystemProps.SocialCloseAllianceProps) {
    const { signer } = props;
    const entrypoint = "close_alliance";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async crown_guild(props: SystemProps.SocialCrownGuildProps) {
    const { guildId, signer } = props;
    const entrypoint = "crown_guild";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [guildId],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async hire_guild(props: SystemProps.SocialHireGuildProps) {
    const { guildId, signer } = props;
    const entrypoint = "hire_guild";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [guildId],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async fire_guild(props: SystemProps.SocialFireGuildProps) {
    const { guildId, signer } = props;
    const entrypoint = "fire_guild";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [guildId],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async request_alliance(props: SystemProps.SocialRequestAllianceProps) {
    const { allianceId, signer } = props;
    const entrypoint = "request_alliance";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [allianceId],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async cancel_alliance(props: SystemProps.SocialCancelAllianceProps) {
    const { signer } = props;
    const entrypoint = "cancel_alliance";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async leave_alliance(props: SystemProps.SocialLeaveAllianceProps) {
    const { signer } = props;
    const entrypoint = "leave_alliance";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async create_guild(props: SystemProps.SocialCreateGuildProps) {
    const { color, name, description, image, banner, discord, telegram, twitter, youtube, signer } = props;
    const entrypoint = "create_guild";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [color, name, description, image, banner, discord, telegram, twitter, youtube],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async open_guild(props: SystemProps.SocialOpenGuildProps) {
    const { free, signer } = props;
    const entrypoint = "open_guild";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [free],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async close_guild(props: SystemProps.SocialCloseGuildProps) {
    const { signer } = props;
    const entrypoint = "close_guild";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async crown_member(props: SystemProps.SocialCrownMemberProps) {
    const { memberId, signer } = props;
    const entrypoint = "crown_member";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [memberId],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async promote_member(props: SystemProps.SocialPromoteMemberProps) {
    const { memberId, signer } = props;
    const entrypoint = "promote_member";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [memberId],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async demote_member(props: SystemProps.SocialDemoteMemberProps) {
    const { memberId, signer } = props;
    const entrypoint = "demote_member";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [memberId],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async hire_member(props: SystemProps.SocialHireMemberProps) {
    const { memberId, signer } = props;
    const entrypoint = "hire_member";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [memberId],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async fire_member(props: SystemProps.SocialFireMemberProps) {
    const { memberId, signer } = props;
    const entrypoint = "fire_member";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [memberId],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async request_guild(props: SystemProps.SocialRequestGuildProps) {
    const { guildId, signer } = props;
    const entrypoint = "request_guild";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [guildId],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async cancel_guild(props: SystemProps.SocialCancelGuildProps) {
    const { signer } = props;
    const entrypoint = "cancel_guild";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }

  public async leave_guild(props: SystemProps.SocialLeaveGuildProps) {
    const { signer } = props;
    const entrypoint = "leave_guild";

    const calls = {
      contractAddress: getContractByName(this.manifest, `${NAMESPACE}-social`),
      entrypoint,
      calldata: [],
    };
    return await this.provider.invoke(signer, calls, entrypoint);
  }
}
