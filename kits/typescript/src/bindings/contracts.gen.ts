import { DojoProvider } from "@dojoengine/core";
import { BigNumberish, ByteArray } from "starknet";

export function setupWorld(provider: DojoProvider) {
  const Society_follow = async (target: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "follow",
        calldata: [target],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_unfollow = async (target: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "unfollow",
        calldata: [target],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_createAlliance = async (
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
        contractName: "Society",
        entrypoint: "create_alliance",
        calldata: [color, name, description, image, banner, discord, telegram, twitter, youtube, website],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_openAlliance = async (free: boolean) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "open_alliance",
        calldata: [free],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_closeAlliance = async () => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "close_alliance",
        calldata: [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_crownGuild = async (guildId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "crown_guild",
        calldata: [guildId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_hireGuild = async (guildId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "hire_guild",
        calldata: [guildId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_fireGuild = async (guildId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "fire_guild",
        calldata: [guildId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_requestAlliance = async (allianceId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "request_alliance",
        calldata: [allianceId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_cancelAlliance = async () => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "cancel_alliance",
        calldata: [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_leaveAlliance = async () => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "leave_alliance",
        calldata: [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_createGuild = async (
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
        contractName: "Society",
        entrypoint: "create_guild",
        calldata: [color, name, description, image, banner, discord, telegram, twitter, youtube, website],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_openGuild = async (free: boolean) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "open_guild",
        calldata: [free],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_closeGuild = async () => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "close_guild",
        calldata: [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_crownMember = async (memberId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "crown_member",
        calldata: [memberId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_promoteMember = async (memberId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "promote_member",
        calldata: [memberId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_demoteMember = async (memberId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "demote_member",
        calldata: [memberId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_hireMember = async (memberId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "hire_member",
        calldata: [memberId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_fireMember = async (memberId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "fire_member",
        calldata: [memberId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_requestGuild = async (guildId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "request_guild",
        calldata: [guildId],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_cancelGuild = async () => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
        entrypoint: "cancel_guild",
        calldata: [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const Society_leaveGuild = async () => {
    try {
      return await provider.call("ARCADE", {
        contractName: "Society",
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
    Society: {
      follow: Society_follow,
      unfollow: Society_unfollow,
      createAlliance: Society_createAlliance,
      openAlliance: Society_openAlliance,
      closeAlliance: Society_closeAlliance,
      crownGuild: Society_crownGuild,
      hireGuild: Society_hireGuild,
      fireGuild: Society_fireGuild,
      requestAlliance: Society_requestAlliance,
      cancelAlliance: Society_cancelAlliance,
      leaveAlliance: Society_leaveAlliance,
      createGuild: Society_createGuild,
      openGuild: Society_openGuild,
      closeGuild: Society_closeGuild,
      crownMember: Society_crownMember,
      promoteMember: Society_promoteMember,
      demoteMember: Society_demoteMember,
      hireMember: Society_hireMember,
      fireMember: Society_fireMember,
      requestGuild: Society_requestGuild,
      cancelGuild: Society_cancelGuild,
      leaveGuild: Society_leaveGuild,
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
