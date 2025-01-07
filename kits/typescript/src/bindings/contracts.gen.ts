import { DojoProvider } from "@dojoengine/core";
import { BigNumberish, ByteArray } from "starknet";

export function setupWorld(provider: DojoProvider) {
  const Social_follow = async (target: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "follow",
        calldata: [target],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_unfollow = async (target: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "unfollow",
        calldata: [target],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_createAlliance = async (
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
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "create_alliance",
        calldata: [color, name, description, image, banner, discord, telegram, twitter, youtube, website],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_openAlliance = async (free: boolean) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "open_alliance",
        calldata: [free],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_closeAlliance = async () => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "close_alliance",
        calldata: [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_crownGuild = async (guildId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "crown_guild",
        calldata: [guildId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_hireGuild = async (guildId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "hire_guild",
        calldata: [guildId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_fireGuild = async (guildId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "fire_guild",
        calldata: [guildId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_requestAlliance = async (allianceId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "request_alliance",
        calldata: [allianceId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_cancelAlliance = async () => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "cancel_alliance",
        calldata: [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_leaveAlliance = async () => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "leave_alliance",
        calldata: [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_createGuild = async (
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
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "create_guild",
        calldata: [color, name, description, image, banner, discord, telegram, twitter, youtube, website],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_openGuild = async (free: boolean) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "open_guild",
        calldata: [free],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_closeGuild = async () => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "close_guild",
        calldata: [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_crownMember = async (memberId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "crown_member",
        calldata: [memberId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_promoteMember = async (memberId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "promote_member",
        calldata: [memberId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_demoteMember = async (memberId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "demote_member",
        calldata: [memberId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_hireMember = async (memberId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "hire_member",
        calldata: [memberId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_fireMember = async (memberId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "fire_member",
        calldata: [memberId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_requestGuild = async (guildId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "request_guild",
        calldata: [guildId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_cancelGuild = async () => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "cancel_guild",
        calldata: [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Social_leaveGuild = async () => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Social",
        entrypoint: "leave_guild",
        calldata: [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_pin = async (achievementId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Registry",
        entrypoint: "pin",
        calldata: [achievementId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_unpin = async (achievementId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Registry",
        entrypoint: "unpin",
        calldata: [achievementId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_registerGame = async (
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
      return await provider.call("ARCADE", {
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
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_updateGame = async (
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
      return await provider.call("ARCADE", {
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
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_publishGame = async (worldAddress: BigNumberish, namespace: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Registry",
        entrypoint: "publish_game",
        calldata: [worldAddress, namespace],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_hideGame = async (worldAddress: BigNumberish, namespace: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Registry",
        entrypoint: "hide_game",
        calldata: [worldAddress, namespace],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_whitelistGame = async (worldAddress: BigNumberish, namespace: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Registry",
        entrypoint: "whitelist_game",
        calldata: [worldAddress, namespace],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_blacklistGame = async (worldAddress: BigNumberish, namespace: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Registry",
        entrypoint: "blacklist_game",
        calldata: [worldAddress, namespace],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_removeGame = async (worldAddress: BigNumberish, namespace: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Registry",
        entrypoint: "remove_game",
        calldata: [worldAddress, namespace],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_registerAchievement = async (
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    identifier: BigNumberish,
    karma: BigNumberish,
  ) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Registry",
        entrypoint: "register_achievement",
        calldata: [worldAddress, namespace, identifier, karma],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_updateAchievement = async (
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    identifier: BigNumberish,
    karma: BigNumberish,
  ) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Registry",
        entrypoint: "update_achievement",
        calldata: [worldAddress, namespace, identifier, karma],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_publishAchievement = async (
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    identifier: BigNumberish,
  ) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Registry",
        entrypoint: "publish_achievement",
        calldata: [worldAddress, namespace, identifier],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_hideAchievement = async (
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    identifier: BigNumberish,
  ) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Registry",
        entrypoint: "hide_achievement",
        calldata: [worldAddress, namespace, identifier],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_whitelistAchievement = async (
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    identifier: BigNumberish,
  ) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Registry",
        entrypoint: "whitelist_achievement",
        calldata: [worldAddress, namespace, identifier],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_blacklistAchievement = async (
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    identifier: BigNumberish,
  ) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Registry",
        entrypoint: "blacklist_achievement",
        calldata: [worldAddress, namespace, identifier],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Registry_removeAchievement = async (
    worldAddress: BigNumberish,
    namespace: BigNumberish,
    identifier: BigNumberish,
  ) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Registry",
        entrypoint: "remove_achievement",
        calldata: [worldAddress, namespace, identifier],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Slot_deploy = async (service: BigNumberish, project: BigNumberish, tier: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Slot",
        entrypoint: "deploy",
        calldata: [service, project, tier],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Slot_remove = async (service: BigNumberish, project: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Slot",
        entrypoint: "remove",
        calldata: [service, project],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Slot_hire = async (project: BigNumberish, accountId: BigNumberish, role: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Slot",
        entrypoint: "hire",
        calldata: [project, accountId, role],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Slot_fire = async (project: BigNumberish, accountId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Slot",
        entrypoint: "fire",
        calldata: [project, accountId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    Social: {
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
    Registry: {
      pin: Registry_pin,
      unpin: Registry_unpin,
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
    Slot: {
      deploy: Slot_deploy,
      remove: Slot_remove,
      hire: Slot_hire,
      fire: Slot_fire,
    },
  };
}
