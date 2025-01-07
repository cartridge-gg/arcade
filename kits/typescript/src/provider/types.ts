import { Account, AccountInterface, BigNumberish, ByteArray } from "starknet";

export enum TransactionType {
  // Society
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

interface SystemSigner {
  signer: AccountInterface | Account;
}

export interface SocietyFollowProps extends SystemSigner {
  target: BigNumberish;
}

export interface SocietyUnfollowProps extends SystemSigner {
  target: BigNumberish;
}

export interface SocietyCreateAllianceProps extends SystemSigner {
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

export interface SocietyOpenAllianceProps extends SystemSigner {
  free: boolean;
}

export interface SocietyCloseAllianceProps extends SystemSigner {}

export interface SocietyCrownGuildProps extends SystemSigner {
  guildId: BigNumberish;
}

export interface SocietyHireGuildProps extends SystemSigner {
  guildId: BigNumberish;
}

export interface SocietyFireGuildProps extends SystemSigner {
  guildId: BigNumberish;
}

export interface SocietyRequestAllianceProps extends SystemSigner {
  allianceId: BigNumberish;
}

export interface SocietyCancelAllianceProps extends SystemSigner {}

export interface SocietyLeaveAllianceProps extends SystemSigner {}

export interface SocietyCreateGuildProps extends SystemSigner {
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

export interface SocietyOpenGuildProps extends SystemSigner {
  free: boolean;
}

export interface SocietyCloseGuildProps extends SystemSigner {}

export interface SocietyCrownMemberProps extends SystemSigner {
  memberId: BigNumberish;
}

export interface SocietyPromoteMemberProps extends SystemSigner {
  memberId: BigNumberish;
}

export interface SocietyDemoteMemberProps extends SystemSigner {
  memberId: BigNumberish;
}

export interface SocietyHireMemberProps extends SystemSigner {
  memberId: BigNumberish;
}

export interface SocietyFireMemberProps extends SystemSigner {
  memberId: BigNumberish;
}

export interface SocietyRequestGuildProps extends SystemSigner {
  guildId: BigNumberish;
}

export interface SocietyCancelGuildProps extends SystemSigner {}

export interface SocietyLeaveGuildProps extends SystemSigner {}

export interface RegistryPinProps extends SystemSigner {
  achievementId: BigNumberish;
}

export interface RegistryUnpinProps extends SystemSigner {
  achievementId: BigNumberish;
}

export interface RegistryRegisterGameProps extends SystemSigner {
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

export interface RegistryUpdateGameProps extends SystemSigner {
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

export interface RegistryPublishGameProps extends SystemSigner {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
}

export interface RegistryHideGameProps extends SystemSigner {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
}

export interface RegistryWhitelistGameProps extends SystemSigner {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
}

export interface RegistryBlacklistGameProps extends SystemSigner {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
}

export interface RegistryRemoveGameProps extends SystemSigner {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
}

export interface RegistryRegisterAchievementProps extends SystemSigner {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  identifier: BigNumberish;
  karma: BigNumberish;
}

export interface RegistryUpdateAchievementProps extends SystemSigner {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  identifier: BigNumberish;
  karma: BigNumberish;
}

export interface RegistryPublishAchievementProps extends SystemSigner {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  identifier: BigNumberish;
}

export interface RegistryHideAchievementProps extends SystemSigner {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  identifier: BigNumberish;
}

export interface RegistryWhitelistAchievementProps extends SystemSigner {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  identifier: BigNumberish;
}

export interface RegistryBlacklistAchievementProps extends SystemSigner {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  identifier: BigNumberish;
}

export interface RegistryRemoveAchievementProps extends SystemSigner {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  identifier: BigNumberish;
}

export interface SlotDeployProps extends SystemSigner {
  service: BigNumberish;
  project: BigNumberish;
  tier: BigNumberish;
}

export interface SlotRemoveProps extends SystemSigner {
  service: BigNumberish;
  project: BigNumberish;
}

export interface SlotHireProps extends SystemSigner {
  project: BigNumberish;
  accountId: BigNumberish;
  role: BigNumberish;
}

export interface SlotFireProps extends SystemSigner {
  project: BigNumberish;
  accountId: BigNumberish;
}
