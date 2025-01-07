import { BigNumberish, ByteArray } from "starknet";

export enum TransactionType {
  // Social
  FOLLOW = "follow",
  UNFOLLOW = "unfollow",
  CREATE_ALLIANCE = "create_alliance",
  OPEN_ALLIANCE = "open_alliance",
  CLOSE_ALLIANCE = "close_alliance",
  CROWN_GUILD = "crown_guild",
  HIRE_GUILD = "hire_guild",
  FIRE_GUILD = "fire_guild",
  REQUEST_ALLIANCE = "request_alliance",
  CANCEL_ALLIANCE = "cancel_alliance",
  LEAVE_ALLIANCE = "leave_alliance",
  CREATE_GUILD = "create_guild",
  OPEN_GUILD = "open_guild",
  CLOSE_GUILD = "close_guild",
  CROWN_MEMBER = "crown_member",
  PROMOTE_MEMBER = "promote_member",
  DEMOTE_MEMBER = "demote_member",
  HIRE_MEMBER = "hire_member",
  FIRE_MEMBER = "fire_member",
  REQUEST_GUILD = "request_guild",
  CANCEL_GUILD = "cancel_guild",
  LEAVE_GUILD = "leave_guild",

  // Registry
  PIN = "pin",
  UNPIN = "unpin",
  REGISTER_GAME = "register_game",
  UPDATE_GAME = "update_game",
  PUBLISH_GAME = "publish_game",
  HIDE_GAME = "hide_game",
  WHITELIST_GAME = "whitelist_game",
  BLACKLIST_GAME = "blacklist_game",
  REMOVE_GAME = "remove_game",
  REGISTER_ACHIEVEMENT = "register_achievement",
  UPDATE_ACHIEVEMENT = "update_achievement",
  PUBLISH_ACHIEVEMENT = "publish_achievement",
  HIDE_ACHIEVEMENT = "hide_achievement",
  WHITELIST_ACHIEVEMENT = "whitelist_achievement",
  BLACKLIST_ACHIEVEMENT = "blacklist_achievement",
  REMOVE_ACHIEVEMENT = "remove_achievement",

  // Slot transactions
  DEPLOY = "deploy",
  REMOVE = "remove",
  HIRE = "hire",
  FIRE = "fire",
}

export interface SocialFollowProps {
  target: BigNumberish;
}

export interface SocialUnfollowProps {
  target: BigNumberish;
}

export interface SocialCreateAllianceProps {
  color: BigNumberish;
  name: ByteArray;
  description: ByteArray;
  image: ByteArray;
  banner: ByteArray;
  discord: ByteArray;
  telegram: ByteArray;
  twitter: ByteArray;
  youtube: ByteArray;
  website: ByteArray;
}

export interface SocialOpenAllianceProps {
  free: boolean;
}

export interface SocialCloseAllianceProps {}

export interface SocialCrownGuildProps {
  guildId: BigNumberish;
}

export interface SocialHireGuildProps {
  guildId: BigNumberish;
}

export interface SocialFireGuildProps {
  guildId: BigNumberish;
}

export interface SocialRequestAllianceProps {
  allianceId: BigNumberish;
}

export interface SocialCancelAllianceProps {}

export interface SocialLeaveAllianceProps {}

export interface SocialCreateGuildProps {
  color: BigNumberish;
  name: ByteArray;
  description: ByteArray;
  image: ByteArray;
  banner: ByteArray;
  discord: ByteArray;
  telegram: ByteArray;
  twitter: ByteArray;
  youtube: ByteArray;
  website: ByteArray;
}

export interface SocialOpenGuildProps {
  free: boolean;
}

export interface SocialCloseGuildProps {}

export interface SocialCrownMemberProps {
  memberId: BigNumberish;
}

export interface SocialPromoteMemberProps {
  memberId: BigNumberish;
}

export interface SocialDemoteMemberProps {
  memberId: BigNumberish;
}

export interface SocialHireMemberProps {
  memberId: BigNumberish;
}

export interface SocialFireMemberProps {
  memberId: BigNumberish;
}

export interface SocialRequestGuildProps {
  guildId: BigNumberish;
}

export interface SocialCancelGuildProps {}

export interface SocialLeaveGuildProps {}

export interface RegistryPinProps {
  achievementId: BigNumberish;
}

export interface RegistryUnpinProps {
  achievementId: BigNumberish;
}

export interface RegistryRegisterGameProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  project: BigNumberish;
  color: BigNumberish;
  name: ByteArray;
  description: ByteArray;
  image: ByteArray;
  banner: ByteArray;
  discord: ByteArray;
  telegram: ByteArray;
  twitter: ByteArray;
  youtube: ByteArray;
  website: ByteArray;
}

export interface RegistryUpdateGameProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  color: BigNumberish;
  name: ByteArray;
  description: ByteArray;
  image: ByteArray;
  banner: ByteArray;
  discord: ByteArray;
  telegram: ByteArray;
  twitter: ByteArray;
  youtube: ByteArray;
  website: ByteArray;
}

export interface RegistryPublishGameProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
}

export interface RegistryHideGameProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
}

export interface RegistryWhitelistGameProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
}

export interface RegistryBlacklistGameProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
}

export interface RegistryRemoveGameProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
}

export interface RegistryRegisterAchievementProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  identifier: BigNumberish;
  karma: BigNumberish;
}

export interface RegistryUpdateAchievementProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  identifier: BigNumberish;
  karma: BigNumberish;
}

export interface RegistryPublishAchievementProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  identifier: BigNumberish;
}

export interface RegistryHideAchievementProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  identifier: BigNumberish;
}

export interface RegistryWhitelistAchievementProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  identifier: BigNumberish;
}

export interface RegistryBlacklistAchievementProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  identifier: BigNumberish;
}

export interface RegistryRemoveAchievementProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  identifier: BigNumberish;
}

export interface SlotDeployProps {
  service: BigNumberish;
  project: BigNumberish;
  tier: BigNumberish;
}

export interface SlotRemoveProps {
  service: BigNumberish;
  project: BigNumberish;
}

export interface SlotHireProps {
  project: BigNumberish;
  accountId: BigNumberish;
  role: BigNumberish;
}

export interface SlotFireProps {
  project: BigNumberish;
  accountId: BigNumberish;
}
