import type { BigNumberish, ByteArray } from "starknet";

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
  REGISTER_EDITION = "register_edition",
  UPDATE_EDITION = "update_edition",
  PRIORITIZE_EDITION = "prioritize_edition",
  PUBLISH_EDITION = "publish_edition",
  HIDE_EDITION = "hide_edition",
  WHITELIST_EDITION = "whitelist_edition",
  BLACKLIST_EDITION = "blacklist_edition",
  REMOVE_EDITION = "remove_edition",

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
  metadata: ByteArray;
  socials: ByteArray;
}

export interface SocialOpenAllianceProps {
  free: boolean;
}

export type SocialCloseAllianceProps = Record<string, never>;

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

export type SocialCancelAllianceProps = Record<string, never>;

export type SocialLeaveAllianceProps = Record<string, never>;

export interface SocialCreateGuildProps {
  metadata: ByteArray;
  socials: ByteArray;
}

export interface SocialOpenGuildProps {
  free: boolean;
}

export type SocialCloseGuildProps = Record<string, never>;

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

export type SocialCancelGuildProps = Record<string, never>;

export type SocialLeaveGuildProps = Record<string, never>;

export interface RegistryPinProps {
  achievementId: BigNumberish;
}

export interface RegistryUnpinProps {
  achievementId: BigNumberish;
}

export interface RegistryRegisterGameProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  project: ByteArray;
  rpc: ByteArray;
  policies: ByteArray;
  color: ByteArray;
  game_image: ByteArray;
  edition_image: ByteArray;
  external_url: ByteArray;
  description: ByteArray;
  game_name: ByteArray;
  edition_name: ByteArray;
  game_attributes: ByteArray;
  edition_attributes: ByteArray;
  animation_url: ByteArray;
  youtube_url: ByteArray;
  properties: ByteArray;
  game_socials: ByteArray;
  edition_socials: ByteArray;
}

export interface RegistryUpdateGameProps {
  gameId: BigNumberish;
  color: ByteArray;
  image: ByteArray;
  image_data: ByteArray;
  external_url: ByteArray;
  description: ByteArray;
  name: ByteArray;
  attributes: ByteArray;
  animation_url: ByteArray;
  youtube_url: ByteArray;
  properties: ByteArray;
  socials: ByteArray;
}

export interface RegistryPublishGameProps {
  gameId: BigNumberish;
}

export interface RegistryHideGameProps {
  gameId: BigNumberish;
}

export interface RegistryWhitelistGameProps {
  gameId: BigNumberish;
}

export interface RegistryBlacklistGameProps {
  gameId: BigNumberish;
}

export interface RegistryRemoveGameProps {
  gameId: BigNumberish;
}

export interface RegistryRegisterEditionProps {
  worldAddress: BigNumberish;
  namespace: BigNumberish;
  gameId: BigNumberish;
  project: ByteArray;
  rpc: ByteArray;
  policies: ByteArray;
  color: ByteArray;
  image: ByteArray;
  image_data: ByteArray;
  external_url: ByteArray;
  description: ByteArray;
  name: ByteArray;
  attributes: ByteArray;
  animation_url: ByteArray;
  youtube_url: ByteArray;
  properties: ByteArray;
  socials: ByteArray;
}

export interface RegistryUpdateEditionProps {
  editionId: BigNumberish;
  project: ByteArray;
  rpc: ByteArray;
  policies: ByteArray;
  color: ByteArray;
  image: ByteArray;
  image_data: ByteArray;
  external_url: ByteArray;
  description: ByteArray;
  name: ByteArray;
  attributes: ByteArray;
  animation_url: ByteArray;
  youtube_url: ByteArray;
  properties: ByteArray;
  socials: ByteArray;
}

export interface RegistryPrioritizeEditionProps {
  editionId: BigNumberish;
  priority: BigNumberish;
}

export interface RegistryPublishEditionProps {
  editionId: BigNumberish;
}

export interface RegistryHideEditionProps {
  editionId: BigNumberish;
}

export interface RegistryWhitelistEditionProps {
  editionId: BigNumberish;
}

export interface RegistryBlacklistEditionProps {
  editionId: BigNumberish;
}

export interface RegistryRemoveEditionProps {
  editionId: BigNumberish;
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
