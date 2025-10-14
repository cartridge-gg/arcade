/**
 * Provider class for interacting with the Cartridge World contracts
 *
 * @param manifest - The manifest containing contract addresses and ABIs
 */
import { NAMESPACE } from "../constants";
import type * as SystemProps from "./types";
import { getContractByName } from "./helpers";
import type { AllowArray, Call } from "starknet";

export class Social {
  private manifest: unknown;
  private name: string;

  constructor(manifest: any) {
    this.manifest = manifest;
    this.name = `${NAMESPACE}-Social`;
  }

  public pin(props: SystemProps.RegistryPinProps): AllowArray<Call> {
    const { achievementId } = props;
    const entrypoint = "pin";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [achievementId],
    };
  }

  public unpin(props: SystemProps.RegistryUnpinProps): AllowArray<Call> {
    const { achievementId } = props;
    const entrypoint = "unpin";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [achievementId],
    };
  }

  public follow(props: SystemProps.SocialFollowProps): AllowArray<Call> {
    const { target } = props;
    const entrypoint = "follow";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [target],
    };
  }

  public unfollow(props: SystemProps.SocialUnfollowProps): AllowArray<Call> {
    const { target } = props;
    const entrypoint = "unfollow";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [target],
    };
  }

  public create_alliance(
    props: SystemProps.SocialCreateAllianceProps,
  ): AllowArray<Call> {
    const { metadata, socials } = props;
    const entrypoint = "create_alliance";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [metadata, socials],
    };
  }

  public open_alliance(
    props: SystemProps.SocialOpenAllianceProps,
  ): AllowArray<Call> {
    const { free } = props;
    const entrypoint = "open_alliance";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [free],
    };
  }

  public close_alliance(): AllowArray<Call> {
    const entrypoint = "close_alliance";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [],
    };
  }

  public crown_guild(
    props: SystemProps.SocialCrownGuildProps,
  ): AllowArray<Call> {
    const { guildId } = props;
    const entrypoint = "crown_guild";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [guildId],
    };
  }

  public hire_guild(props: SystemProps.SocialHireGuildProps): AllowArray<Call> {
    const { guildId } = props;
    const entrypoint = "hire_guild";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [guildId],
    };
  }

  public fire_guild(props: SystemProps.SocialFireGuildProps): AllowArray<Call> {
    const { guildId } = props;
    const entrypoint = "fire_guild";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [guildId],
    };
  }

  public request_alliance(
    props: SystemProps.SocialRequestAllianceProps,
  ): AllowArray<Call> {
    const { allianceId } = props;
    const entrypoint = "request_alliance";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [allianceId],
    };
  }

  public cancel_alliance(): AllowArray<Call> {
    const entrypoint = "cancel_alliance";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [],
    };
  }

  public leave_alliance(): AllowArray<Call> {
    const entrypoint = "leave_alliance";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [],
    };
  }

  public create_guild(
    props: SystemProps.SocialCreateGuildProps,
  ): AllowArray<Call> {
    const { metadata, socials } = props;
    const entrypoint = "create_guild";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [metadata, socials],
    };
  }

  public open_guild(props: SystemProps.SocialOpenGuildProps): AllowArray<Call> {
    const { free } = props;
    const entrypoint = "open_guild";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [free],
    };
  }

  public close_guild(): AllowArray<Call> {
    const entrypoint = "close_guild";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [],
    };
  }

  public crown_member(
    props: SystemProps.SocialCrownMemberProps,
  ): AllowArray<Call> {
    const { memberId } = props;
    const entrypoint = "crown_member";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [memberId],
    };
  }

  public promote_member(
    props: SystemProps.SocialPromoteMemberProps,
  ): AllowArray<Call> {
    const { memberId } = props;
    const entrypoint = "promote_member";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [memberId],
    };
  }

  public demote_member(
    props: SystemProps.SocialDemoteMemberProps,
  ): AllowArray<Call> {
    const { memberId } = props;
    const entrypoint = "demote_member";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [memberId],
    };
  }

  public hire_member(
    props: SystemProps.SocialHireMemberProps,
  ): AllowArray<Call> {
    const { memberId } = props;
    const entrypoint = "hire_member";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [memberId],
    };
  }

  public fire_member(
    props: SystemProps.SocialFireMemberProps,
  ): AllowArray<Call> {
    const { memberId } = props;
    const entrypoint = "fire_member";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [memberId],
    };
  }

  public request_guild(
    props: SystemProps.SocialRequestGuildProps,
  ): AllowArray<Call> {
    const { guildId } = props;
    const entrypoint = "request_guild";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [guildId],
    };
  }

  public cancel_guild(): AllowArray<Call> {
    const entrypoint = "cancel_guild";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [],
    };
  }

  public leave_guild(): AllowArray<Call> {
    const entrypoint = "leave_guild";

    return {
      contractAddress: getContractByName(this.manifest, this.name),
      entrypoint,
      calldata: [],
    };
  }
}
