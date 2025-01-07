import { DojoProvider } from "@dojoengine/core";
import { CairoOption } from "starknet";
import { Account } from "starknet";

export async function setupWorld(provider: DojoProvider) {

	const Slot_deploy = async (snAccount: Account, service: number, project: number, tier: number) => {
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

	const Slot_remove = async (snAccount: Account, service: number, project: number) => {
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

	const Slot_hire = async (snAccount: Account, project: number, accountId: number, role: number) => {
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

	const Slot_fire = async (snAccount: Account, project: number, accountId: number) => {
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

	const Registry_pin = async (snAccount: Account, achievementId: number) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Registry",
					entrypoint: "pin",
					calldata: [achievementId],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Registry_unpin = async (snAccount: Account, achievementId: number) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Registry",
					entrypoint: "unpin",
					calldata: [achievementId],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Registry_registerGame = async (snAccount: Account, worldAddress: number, namespace: number, project: number, color: CairoOption<string>, name: CairoOption<string>, description: CairoOption<string>, image: CairoOption<string>, banner: CairoOption<string>, discord: CairoOption<string>, telegram: CairoOption<string>, twitter: CairoOption<string>, youtube: CairoOption<string>, website: CairoOption<string>) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Registry",
					entrypoint: "register_game",
					calldata: [worldAddress, namespace, project, color, name, description, image, banner, discord, telegram, twitter, youtube, website],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Registry_updateGame = async (snAccount: Account, worldAddress: number, namespace: number, color: CairoOption<string>, name: CairoOption<string>, description: CairoOption<string>, image: CairoOption<string>, banner: CairoOption<string>, discord: CairoOption<string>, telegram: CairoOption<string>, twitter: CairoOption<string>, youtube: CairoOption<string>, website: CairoOption<string>) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Registry",
					entrypoint: "update_game",
					calldata: [worldAddress, namespace, color, name, description, image, banner, discord, telegram, twitter, youtube, website],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Registry_publishGame = async (snAccount: Account, worldAddress: number, namespace: number) => {
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

	const Registry_hideGame = async (snAccount: Account, worldAddress: number, namespace: number) => {
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

	const Registry_whitelistGame = async (snAccount: Account, worldAddress: number, namespace: number) => {
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

	const Registry_blacklistGame = async (snAccount: Account, worldAddress: number, namespace: number) => {
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

	const Registry_removeGame = async (snAccount: Account, worldAddress: number, namespace: number) => {
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

	const Registry_registerAchievement = async (snAccount: Account, worldAddress: number, namespace: number, identifier: number, karma: number) => {
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

	const Registry_updateAchievement = async (snAccount: Account, worldAddress: number, namespace: number, identifier: number, karma: number) => {
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

	const Registry_publishAchievement = async (snAccount: Account, worldAddress: number, namespace: number, identifier: number) => {
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

	const Registry_hideAchievement = async (snAccount: Account, worldAddress: number, namespace: number, identifier: number) => {
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

	const Registry_whitelistAchievement = async (snAccount: Account, worldAddress: number, namespace: number, identifier: number) => {
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

	const Registry_blacklistAchievement = async (snAccount: Account, worldAddress: number, namespace: number, identifier: number) => {
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

	const Registry_removeAchievement = async (snAccount: Account, worldAddress: number, namespace: number, identifier: number) => {
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

	const Society_follow = async (snAccount: Account, target: number) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "follow",
					calldata: [target],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_unfollow = async (snAccount: Account, target: number) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "unfollow",
					calldata: [target],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_createAlliance = async (snAccount: Account, color: CairoOption<string>, name: CairoOption<string>, description: CairoOption<string>, image: CairoOption<string>, banner: CairoOption<string>, discord: CairoOption<string>, telegram: CairoOption<string>, twitter: CairoOption<string>, youtube: CairoOption<string>, website: CairoOption<string>) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "create_alliance",
					calldata: [color, name, description, image, banner, discord, telegram, twitter, youtube, website],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_openAlliance = async (snAccount: Account, free: boolean) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "open_alliance",
					calldata: [free],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_closeAlliance = async (snAccount: Account) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "close_alliance",
					calldata: [],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_crownGuild = async (snAccount: Account, guildId: number) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "crown_guild",
					calldata: [guildId],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_hireGuild = async (snAccount: Account, guildId: number) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "hire_guild",
					calldata: [guildId],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_fireGuild = async (snAccount: Account, guildId: number) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "fire_guild",
					calldata: [guildId],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_requestAlliance = async (snAccount: Account, allianceId: number) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "request_alliance",
					calldata: [allianceId],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_cancelAlliance = async (snAccount: Account) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "cancel_alliance",
					calldata: [],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_leaveAlliance = async (snAccount: Account) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "leave_alliance",
					calldata: [],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_createGuild = async (snAccount: Account, color: CairoOption<string>, name: CairoOption<string>, description: CairoOption<string>, image: CairoOption<string>, banner: CairoOption<string>, discord: CairoOption<string>, telegram: CairoOption<string>, twitter: CairoOption<string>, youtube: CairoOption<string>, website: CairoOption<string>) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "create_guild",
					calldata: [color, name, description, image, banner, discord, telegram, twitter, youtube, website],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_openGuild = async (snAccount: Account, free: boolean) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "open_guild",
					calldata: [free],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_closeGuild = async (snAccount: Account) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "close_guild",
					calldata: [],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_crownMember = async (snAccount: Account, memberId: number) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "crown_member",
					calldata: [memberId],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_promoteMember = async (snAccount: Account, memberId: number) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "promote_member",
					calldata: [memberId],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_demoteMember = async (snAccount: Account, memberId: number) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "demote_member",
					calldata: [memberId],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_hireMember = async (snAccount: Account, memberId: number) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "hire_member",
					calldata: [memberId],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_fireMember = async (snAccount: Account, memberId: number) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "fire_member",
					calldata: [memberId],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_requestGuild = async (snAccount: Account, guildId: number) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "request_guild",
					calldata: [guildId],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_cancelGuild = async (snAccount: Account) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "cancel_guild",
					calldata: [],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const Society_leaveGuild = async (snAccount: Account) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "Society",
					entrypoint: "leave_guild",
					calldata: [],
				},
				"ARCADE",
			);
		} catch (error) {
			console.error(error);
		}
	};

	return {
		Slot: {
			deploy: Slot_deploy,
			remove: Slot_remove,
			hire: Slot_hire,
			fire: Slot_fire,
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
	};
}