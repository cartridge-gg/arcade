import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { BigNumberish } from "starknet";

// Type definition for `controller::models::index::Account` struct
export interface Account {
  id: BigNumberish;
  controllers: BigNumberish;
  name: BigNumberish;
  username: BigNumberish;
  socials: string;
  credits: BigNumberish;
}

// Type definition for `controller::models::index::AccountValue` struct
export interface AccountValue {
  controllers: BigNumberish;
  name: BigNumberish;
  username: BigNumberish;
  socials: string;
  credits: BigNumberish;
}

// Type definition for `controller::models::index::Controller` struct
export interface Controller {
  account_id: BigNumberish;
  id: BigNumberish;
  signers: BigNumberish;
  address: BigNumberish;
  network: BigNumberish;
  constructor_calldata: string;
}

// Type definition for `controller::models::index::ControllerValue` struct
export interface ControllerValue {
  signers: BigNumberish;
  address: BigNumberish;
  network: BigNumberish;
  constructor_calldata: string;
}

// Type definition for `controller::models::index::Signer` struct
export interface Signer {
  account_id: BigNumberish;
  controller_id: BigNumberish;
  method: BigNumberish;
  metadata: string;
}

// Type definition for `controller::models::index::SignerValue` struct
export interface SignerValue {
  method: BigNumberish;
  metadata: string;
}

// Type definition for `provider::models::index::Deployment` struct
export interface Deployment {
  service: BigNumberish;
  project: BigNumberish;
  status: BigNumberish;
  tier: BigNumberish;
  config: string;
}

// Type definition for `provider::models::index::DeploymentValue` struct
export interface DeploymentValue {
  status: BigNumberish;
  tier: BigNumberish;
  config: string;
}

// Type definition for `provider::models::index::Factory` struct
export interface Factory {
  id: BigNumberish;
  version: BigNumberish;
  default_version: BigNumberish;
}

// Type definition for `provider::models::index::FactoryValue` struct
export interface FactoryValue {
  version: BigNumberish;
  default_version: BigNumberish;
}

// Type definition for `provider::models::index::Team` struct
export interface Team {
  id: BigNumberish;
  deployment_count: BigNumberish;
  time: BigNumberish;
  name: BigNumberish;
  description: string;
}

// Type definition for `provider::models::index::TeamValue` struct
export interface TeamValue {
  deployment_count: BigNumberish;
  time: BigNumberish;
  name: BigNumberish;
  description: string;
}

// Type definition for `provider::models::index::Teammate` struct
export interface Teammate {
  team_id: BigNumberish;
  time: BigNumberish;
  account_id: BigNumberish;
  role: BigNumberish;
}

// Type definition for `provider::models::index::TeammateValue` struct
export interface TeammateValue {
  role: BigNumberish;
}

// Type definition for `registry::models::index::Access` struct
export interface Access {
  address: BigNumberish;
  role: BigNumberish;
}

// Type definition for `registry::models::index::AccessValue` struct
export interface AccessValue {
  role: BigNumberish;
}

// Type definition for `registry::models::index::Collection` struct
export interface Collection {
  id: BigNumberish;
  uuid: BigNumberish;
  contract_address: string;
}

// Type definition for `registry::models::index::CollectionValue` struct
export interface CollectionValue {
  uuid: BigNumberish;
  contract_address: string;
}

// Type definition for `registry::models::index::Edition` struct
export interface Edition {
  id: BigNumberish;
  world_address: BigNumberish;
  namespace: BigNumberish;
  published: boolean;
  whitelisted: boolean;
  priority: BigNumberish;
  game_id: BigNumberish;
  config: string;
  color: string;
  image: string;
  image_data: string;
  external_url: string;
  description: string;
  name: string;
  animation_url: string;
  youtube_url: string;
  attributes: string;
  properties: string;
  socials: string;
}

// Type definition for `registry::models::index::EditionValue` struct
export interface EditionValue {
  world_address: BigNumberish;
  namespace: BigNumberish;
  published: boolean;
  whitelisted: boolean;
  priority: BigNumberish;
  game_id: BigNumberish;
  config: string;
  color: string;
  image: string;
  image_data: string;
  external_url: string;
  description: string;
  name: string;
  animation_url: string;
  youtube_url: string;
  attributes: string;
  properties: string;
  socials: string;
}

// Type definition for `registry::models::index::Game` struct
export interface Game {
  id: BigNumberish;
  published: boolean;
  whitelisted: boolean;
  color: string;
  image: string;
  image_data: string;
  external_url: string;
  description: string;
  name: string;
  animation_url: string;
  youtube_url: string;
  attributes: string;
  properties: string;
  socials: string;
}

// Type definition for `registry::models::index::GameValue` struct
export interface GameValue {
  published: boolean;
  whitelisted: boolean;
  color: string;
  image: string;
  image_data: string;
  external_url: string;
  description: string;
  name: string;
  animation_url: string;
  youtube_url: string;
  attributes: string;
  properties: string;
  socials: string;
}

// Type definition for `registry::models::index::Unicity` struct
export interface Unicity {
  world_address: BigNumberish;
  namespace: BigNumberish;
  token_id: BigNumberish;
}

// Type definition for `registry::models::index::UnicityValue` struct
export interface UnicityValue {
  token_id: BigNumberish;
}

// Type definition for `social::models::index::Alliance` struct
export interface Alliance {
  id: BigNumberish;
  open: boolean;
  free: boolean;
  guild_count: BigNumberish;
  metadata: string;
  socials: string;
}

// Type definition for `social::models::index::AllianceValue` struct
export interface AllianceValue {
  open: boolean;
  free: boolean;
  guild_count: BigNumberish;
  metadata: string;
  socials: string;
}

// Type definition for `social::models::index::Guild` struct
export interface Guild {
  id: BigNumberish;
  open: boolean;
  free: boolean;
  role: BigNumberish;
  member_count: BigNumberish;
  alliance_id: BigNumberish;
  pending_alliance_id: BigNumberish;
  metadata: string;
  socials: string;
}

// Type definition for `social::models::index::GuildValue` struct
export interface GuildValue {
  open: boolean;
  free: boolean;
  role: BigNumberish;
  member_count: BigNumberish;
  alliance_id: BigNumberish;
  pending_alliance_id: BigNumberish;
  metadata: string;
  socials: string;
}

// Type definition for `social::models::index::Member` struct
export interface Member {
  id: BigNumberish;
  role: BigNumberish;
  guild_id: BigNumberish;
  pending_guild_id: BigNumberish;
}

// Type definition for `social::models::index::MemberValue` struct
export interface MemberValue {
  role: BigNumberish;
  guild_id: BigNumberish;
  pending_guild_id: BigNumberish;
}

// Type definition for `achievement::events::index::TrophyPinning` struct
export interface TrophyPinning {
  player_id: BigNumberish;
  achievement_id: BigNumberish;
  time: BigNumberish;
}

// Type definition for `achievement::events::index::TrophyPinningValue` struct
export interface TrophyPinningValue {
  time: BigNumberish;
}

// Type definition for `social::events::index::Follow` struct
export interface Follow {
  follower: BigNumberish;
  followed: BigNumberish;
  time: BigNumberish;
}

// Type definition for `social::events::index::FollowValue` struct
export interface FollowValue {
  time: BigNumberish;
}

export interface SchemaType extends ISchemaType {
  controller: {
    Account: Account;
    AccountValue: AccountValue;
    Controller: Controller;
    ControllerValue: ControllerValue;
    Signer: Signer;
    SignerValue: SignerValue;
  };
  provider: {
    Deployment: Deployment;
    DeploymentValue: DeploymentValue;
    Factory: Factory;
    FactoryValue: FactoryValue;
    Team: Team;
    TeamValue: TeamValue;
    Teammate: Teammate;
    TeammateValue: TeammateValue;
  };
  registry: {
    Access: Access;
    AccessValue: AccessValue;
    Collection: Collection;
    CollectionValue: CollectionValue;
    Edition: Edition;
    EditionValue: EditionValue;
    Game: Game;
    GameValue: GameValue;
    Unicity: Unicity;
    UnicityValue: UnicityValue;
  };
  social: {
    Alliance: Alliance;
    AllianceValue: AllianceValue;
    Guild: Guild;
    GuildValue: GuildValue;
    Member: Member;
    MemberValue: MemberValue;
  };
  achievement: {
    TrophyPinning: TrophyPinning;
    TrophyPinningValue: TrophyPinningValue;
    Follow: Follow;
    FollowValue: FollowValue;
  };
}
export const schema: SchemaType = {
  controller: {
    Account: {
      id: 0,
      controllers: 0,
      name: 0,
      username: 0,
      socials: "",
      credits: 0,
    },
    AccountValue: {
      controllers: 0,
      name: 0,
      username: 0,
      socials: "",
      credits: 0,
    },
    Controller: {
      account_id: 0,
      id: 0,
      signers: 0,
      address: 0,
      network: 0,
      constructor_calldata: "",
    },
    ControllerValue: {
      signers: 0,
      address: 0,
      network: 0,
      constructor_calldata: "",
    },
    Signer: {
      account_id: 0,
      controller_id: 0,
      method: 0,
      metadata: "",
    },
    SignerValue: {
      method: 0,
      metadata: "",
    },
  },
  provider: {
    Deployment: {
      service: 0,
      project: 0,
      status: 0,
      tier: 0,
      config: "",
    },
    DeploymentValue: {
      status: 0,
      tier: 0,
      config: "",
    },
    Factory: {
      id: 0,
      version: 0,
      default_version: 0,
    },
    FactoryValue: {
      version: 0,
      default_version: 0,
    },
    Team: {
      id: 0,
      deployment_count: 0,
      time: 0,
      name: 0,
      description: "",
    },
    TeamValue: {
      deployment_count: 0,
      time: 0,
      name: 0,
      description: "",
    },
    Teammate: {
      team_id: 0,
      time: 0,
      account_id: 0,
      role: 0,
    },
    TeammateValue: {
      role: 0,
    },
  },
  registry: {
    Access: {
      address: 0,
      role: 0,
    },
    AccessValue: {
      role: 0,
    },
    Collection: {
      id: 0,
      uuid: 0,
      contract_address: "",
    },
    CollectionValue: {
      uuid: 0,
      contract_address: "",
    },
    Edition: {
      id: 0,
      world_address: 0,
      namespace: 0,
      published: false,
      whitelisted: false,
      priority: 0,
      game_id: 0,
      config: "",
      color: "",
      image: "",
      image_data: "",
      external_url: "",
      description: "",
      name: "",
      animation_url: "",
      youtube_url: "",
      attributes: "",
      properties: "",
      socials: "",
    },
    EditionValue: {
      world_address: 0,
      namespace: 0,
      published: false,
      whitelisted: false,
      priority: 0,
      game_id: 0,
      config: "",
      color: "",
      image: "",
      image_data: "",
      external_url: "",
      description: "",
      name: "",
      animation_url: "",
      youtube_url: "",
      attributes: "",
      properties: "",
      socials: "",
    },
    Game: {
      id: 0,
      published: false,
      whitelisted: false,
      color: "",
      image: "",
      image_data: "",
      external_url: "",
      description: "",
      name: "",
      animation_url: "",
      youtube_url: "",
      attributes: "",
      properties: "",
      socials: "",
    },
    GameValue: {
      published: false,
      whitelisted: false,
      color: "",
      image: "",
      image_data: "",
      external_url: "",
      description: "",
      name: "",
      animation_url: "",
      youtube_url: "",
      attributes: "",
      properties: "",
      socials: "",
    },
    Unicity: {
      world_address: 0,
      namespace: 0,
      token_id: 0,
    },
    UnicityValue: {
      token_id: 0,
    },
  },
  social: {
    Alliance: {
      id: 0,
      open: false,
      free: false,
      guild_count: 0,
      metadata: "",
      socials: "",
    },
    AllianceValue: {
      open: false,
      free: false,
      guild_count: 0,
      metadata: "",
      socials: "",
    },
    Guild: {
      id: 0,
      open: false,
      free: false,
      role: 0,
      member_count: 0,
      alliance_id: 0,
      pending_alliance_id: 0,
      metadata: "",
      socials: "",
    },
    GuildValue: {
      open: false,
      free: false,
      role: 0,
      member_count: 0,
      alliance_id: 0,
      pending_alliance_id: 0,
      metadata: "",
      socials: "",
    },
    Member: {
      id: 0,
      role: 0,
      guild_id: 0,
      pending_guild_id: 0,
    },
    MemberValue: {
      role: 0,
      guild_id: 0,
      pending_guild_id: 0,
    },
  },
  achievement: {
    TrophyPinning: {
      player_id: 0,
      achievement_id: 0,
      time: 0,
    },
    TrophyPinningValue: {
      time: 0,
    },
    Follow: {
      follower: 0,
      followed: 0,
      time: 0,
    },
    FollowValue: {
      time: 0,
    },
  },
};
export enum ModelsMapping {
  Account = "controller-Account",
  AccountValue = "controller-AccountValue",
  Controller = "controller-Controller",
  ControllerValue = "controller-ControllerValue",
  Signer = "controller-Signer",
  SignerValue = "controller-SignerValue",
  Deployment = "provider-Deployment",
  DeploymentValue = "provider-DeploymentValue",
  Factory = "provider-Factory",
  FactoryValue = "provider-FactoryValue",
  Team = "provider-Team",
  TeamValue = "provider-TeamValue",
  Teammate = "provider-Teammate",
  TeammateValue = "provider-TeammateValue",
  Access = "registry-Access",
  AccessValue = "registry-AccessValue",
  Collection = "registry-Collection",
  CollectionValue = "registry-CollectionValue",
  Edition = "registry-Edition",
  EditionValue = "registry-EditionValue",
  Game = "registry-Game",
  GameValue = "registry-GameValue",
  Unicity = "registry-Unicity",
  UnicityValue = "registry-UnicityValue",
  Alliance = "social-Alliance",
  AllianceValue = "social-AllianceValue",
  Guild = "social-Guild",
  GuildValue = "social-GuildValue",
  Member = "social-Member",
  MemberValue = "social-MemberValue",
  TrophyPinning = "achievement-TrophyPinning",
  TrophyPinningValue = "achievement-TrophyPinningValue",
  Follow = "social-Follow",
  FollowValue = "social-FollowValue",
}
