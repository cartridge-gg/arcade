import { DojoProvider } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish, ByteArray } from "starknet";

export function setupWorld(provider: DojoProvider) {
  const Registry_registerGame = async (
    snAccount: Account | AccountInterface,
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    project: BigNumberish,
    color: BigNumberish,
    name: ByteArray,
    description: ByteArray,
    image: ByteArray,
    banner: ByteArray,
    discord: ByteArray,
    telegram: ByteArray,
    twitter: ByteArray,
    youtube: ByteArray,
    website: ByteArray,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Registry",
          entrypoint: "register_game",
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
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_updateGame = async (
    snAccount: Account | AccountInterface,
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    color: BigNumberish,
    name: ByteArray,
    description: ByteArray,
    image: ByteArray,
    banner: ByteArray,
    discord: ByteArray,
    telegram: ByteArray,
    twitter: ByteArray,
    youtube: ByteArray,
    website: ByteArray,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Registry",
          entrypoint: "update_game",
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
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_publishGame = async (
    snAccount: Account | AccountInterface,
    worldAddress: BigNumberish,
    namespace: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Registry",
          entrypoint: "publish_game",
          calldata: [worldAddress, namespace],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_hideGame = async (
    snAccount: Account | AccountInterface,
    worldAddress: BigNumberish,
    namespace: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Registry",
          entrypoint: "hide_game",
          calldata: [worldAddress, namespace],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_whitelistGame = async (
    snAccount: Account | AccountInterface,
    worldAddress: BigNumberish,
    namespace: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Registry",
          entrypoint: "whitelist_game",
          calldata: [worldAddress, namespace],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_blacklistGame = async (
    snAccount: Account | AccountInterface,
    worldAddress: BigNumberish,
    namespace: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Registry",
          entrypoint: "blacklist_game",
          calldata: [worldAddress, namespace],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_removeGame = async (
    snAccount: Account | AccountInterface,
    worldAddress: BigNumberish,
    namespace: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Registry",
          entrypoint: "remove_game",
          calldata: [worldAddress, namespace],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_registerAchievement = async (
    snAccount: Account | AccountInterface,
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    identifier: BigNumberish,
    karma: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Registry",
          entrypoint: "register_achievement",
          calldata: [worldAddress, namespace, identifier, karma],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_updateAchievement = async (
    snAccount: Account | AccountInterface,
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    identifier: BigNumberish,
    karma: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Registry",
          entrypoint: "update_achievement",
          calldata: [worldAddress, namespace, identifier, karma],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_publishAchievement = async (
    snAccount: Account | AccountInterface,
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    identifier: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Registry",
          entrypoint: "publish_achievement",
          calldata: [worldAddress, namespace, identifier],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_hideAchievement = async (
    snAccount: Account | AccountInterface,
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    identifier: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Registry",
          entrypoint: "hide_achievement",
          calldata: [worldAddress, namespace, identifier],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_whitelistAchievement = async (
    snAccount: Account | AccountInterface,
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    identifier: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Registry",
          entrypoint: "whitelist_achievement",
          calldata: [worldAddress, namespace, identifier],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_blacklistAchievement = async (
    snAccount: Account | AccountInterface,
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    identifier: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Registry",
          entrypoint: "blacklist_achievement",
          calldata: [worldAddress, namespace, identifier],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_removeAchievement = async (
    snAccount: Account | AccountInterface,
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    identifier: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Registry",
          entrypoint: "remove_achievement",
          calldata: [worldAddress, namespace, identifier],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };
  const Social_pin = async (snAccount: Account | AccountInterface, achievementId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "pin",
          calldata: [achievementId],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_unpin = async (snAccount: Account | AccountInterface, achievementId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "unpin",
          calldata: [achievementId],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_follow = async (snAccount: Account | AccountInterface, target: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "follow",
          calldata: [target],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_unfollow = async (snAccount: Account | AccountInterface, target: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "unfollow",
          calldata: [target],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_createAlliance = async (
    snAccount: Account | AccountInterface,
    color: BigNumberish,
    name: ByteArray,
    description: ByteArray,
    image: ByteArray,
    banner: ByteArray,
    discord: ByteArray,
    telegram: ByteArray,
    twitter: ByteArray,
    youtube: ByteArray,
    website: ByteArray,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "create_alliance",
          calldata: [color, name, description, image, banner, discord, telegram, twitter, youtube, website],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_openAlliance = async (snAccount: Account | AccountInterface, free: boolean) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "open_alliance",
          calldata: [free],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_closeAlliance = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "close_alliance",
          calldata: [],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_crownGuild = async (snAccount: Account | AccountInterface, guildId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "crown_guild",
          calldata: [guildId],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_hireGuild = async (snAccount: Account | AccountInterface, guildId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "hire_guild",
          calldata: [guildId],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_fireGuild = async (snAccount: Account | AccountInterface, guildId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "fire_guild",
          calldata: [guildId],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_requestAlliance = async (snAccount: Account | AccountInterface, allianceId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "request_alliance",
          calldata: [allianceId],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_cancelAlliance = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "cancel_alliance",
          calldata: [],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_leaveAlliance = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "leave_alliance",
          calldata: [],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_createGuild = async (
    snAccount: Account | AccountInterface,
    color: BigNumberish,
    name: ByteArray,
    description: ByteArray,
    image: ByteArray,
    banner: ByteArray,
    discord: ByteArray,
    telegram: ByteArray,
    twitter: ByteArray,
    youtube: ByteArray,
    website: ByteArray,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "create_guild",
          calldata: [color, name, description, image, banner, discord, telegram, twitter, youtube, website],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_openGuild = async (snAccount: Account | AccountInterface, free: boolean) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "open_guild",
          calldata: [free],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_closeGuild = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "close_guild",
          calldata: [],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_crownMember = async (snAccount: Account | AccountInterface, memberId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "crown_member",
          calldata: [memberId],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_promoteMember = async (snAccount: Account | AccountInterface, memberId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "promote_member",
          calldata: [memberId],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_demoteMember = async (snAccount: Account | AccountInterface, memberId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "demote_member",
          calldata: [memberId],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_hireMember = async (snAccount: Account | AccountInterface, memberId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "hire_member",
          calldata: [memberId],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_fireMember = async (snAccount: Account | AccountInterface, memberId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "fire_member",
          calldata: [memberId],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_requestGuild = async (snAccount: Account | AccountInterface, guildId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "request_guild",
          calldata: [guildId],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_cancelGuild = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "cancel_guild",
          calldata: [],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Social_leaveGuild = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Social",
          entrypoint: "leave_guild",
          calldata: [],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Slot_deploy = async (
    snAccount: Account | AccountInterface,
    service: BigNumberish,
    project: BigNumberish,
    tier: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Slot",
          entrypoint: "deploy",
          calldata: [service, project, tier],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Slot_remove = async (snAccount: Account | AccountInterface, service: BigNumberish, project: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Slot",
          entrypoint: "remove",
          calldata: [service, project],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Slot_hire = async (
    snAccount: Account | AccountInterface,
    project: BigNumberish,
    accountId: BigNumberish,
    role: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Slot",
          entrypoint: "hire",
          calldata: [project, accountId, role],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Slot_fire = async (snAccount: Account | AccountInterface, project: BigNumberish, accountId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        {
          contractName: "Slot",
          entrypoint: "fire",
          calldata: [project, accountId],
        },
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
    }
  };

  return {
    Registry: {
      registerGame: Registry_registerGame,
      updateGame: Registry_updateGame,
      publishGame: Registry_publishGame,
      hideGame: Registry_hideGame,
      whitelistGame: Registry_whitelistGame,
      blacklistGame: Registry_blacklistGame,
      removeGame: Registry_removeGame,
      registerAchievement: Registry_registerAchievement,
      updateAchievement: Registry_updateAchievement,
      publishAchievement: Registry_publishAchievement,
      hideAchievement: Registry_hideAchievement,
      whitelistAchievement: Registry_whitelistAchievement,
      blacklistAchievement: Registry_blacklistAchievement,
      removeAchievement: Registry_removeAchievement,
    },
    Social: {
      pin: Social_pin,
      unpin: Social_unpin,
      follow: Social_follow,
      unfollow: Social_unfollow,
      createAlliance: Social_createAlliance,
      openAlliance: Social_openAlliance,
      closeAlliance: Social_closeAlliance,
      crownGuild: Social_crownGuild,
      hireGuild: Social_hireGuild,
      fireGuild: Social_fireGuild,
      requestAlliance: Social_requestAlliance,
      cancelAlliance: Social_cancelAlliance,
      leaveAlliance: Social_leaveAlliance,
      createGuild: Social_createGuild,
      openGuild: Social_openGuild,
      closeGuild: Social_closeGuild,
      crownMember: Social_crownMember,
      promoteMember: Social_promoteMember,
      demoteMember: Social_demoteMember,
      hireMember: Social_hireMember,
      fireMember: Social_fireMember,
      requestGuild: Social_requestGuild,
      cancelGuild: Social_cancelGuild,
      leaveGuild: Social_leaveGuild,
    },
    Slot: {
      deploy: Slot_deploy,
      remove: Slot_remove,
      hire: Slot_hire,
      fire: Slot_fire,
    },
  };
}
