import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { BigNumberish } from "starknet";

type WithFieldOrder<T> = T & { fieldOrder: string[] };

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

// Type definition for `registry::models::index::Achievement` struct
export interface Achievement {
  world_address: BigNumberish;
  namespace: BigNumberish;
  id: BigNumberish;
  published: boolean;
  whitelisted: boolean;
  karma: BigNumberish;
}

// Type definition for `registry::models::index::AchievementValue` struct
export interface AchievementValue {
  published: boolean;
  whitelisted: boolean;
  karma: BigNumberish;
}

// Type definition for `registry::models::index::Game` struct
export interface Game {
  world_address: BigNumberish;
  namespace: BigNumberish;
  project: BigNumberish;
  active: boolean;
  published: boolean;
  whitelisted: boolean;
  priority: BigNumberish;
  karma: BigNumberish;
  metadata: string;
  socials: string;
  owner: BigNumberish;
}

// Type definition for `registry::models::index::GameValue` struct
export interface GameValue {
  project: BigNumberish;
  active: boolean;
  published: boolean;
  whitelisted: boolean;
  priority: BigNumberish;
  karma: BigNumberish;
  metadata: string;
  socials: string;
  owner: BigNumberish;
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

export interface SchemaType extends ISchemaType {
  controller: {
    Account: WithFieldOrder<Account>;
    AccountValue: WithFieldOrder<AccountValue>;
    Controller: WithFieldOrder<Controller>;
    ControllerValue: WithFieldOrder<ControllerValue>;
    Signer: WithFieldOrder<Signer>;
    SignerValue: WithFieldOrder<SignerValue>;
  };
  provider: {
    Deployment: WithFieldOrder<Deployment>;
    DeploymentValue: WithFieldOrder<DeploymentValue>;
    Factory: WithFieldOrder<Factory>;
    FactoryValue: WithFieldOrder<FactoryValue>;
    Team: WithFieldOrder<Team>;
    TeamValue: WithFieldOrder<TeamValue>;
    Teammate: WithFieldOrder<Teammate>;
    TeammateValue: WithFieldOrder<TeammateValue>;
  };
  registry: {
    Access: WithFieldOrder<Access>;
    AccessValue: WithFieldOrder<AccessValue>;
    Achievement: WithFieldOrder<Achievement>;
    AchievementValue: WithFieldOrder<AchievementValue>;
    Game: WithFieldOrder<Game>;
    GameValue: WithFieldOrder<GameValue>;
  };
  social: {
    Alliance: WithFieldOrder<Alliance>;
    AllianceValue: WithFieldOrder<AllianceValue>;
    Guild: WithFieldOrder<Guild>;
    GuildValue: WithFieldOrder<GuildValue>;
    Member: WithFieldOrder<Member>;
    MemberValue: WithFieldOrder<MemberValue>;
  };
}
export const schema: SchemaType = {
  controller: {
    Account: {
      fieldOrder: ["id", "controllers", "name", "username", "socials", "credits"],
      id: 0,
      controllers: 0,
      name: 0,
      username: 0,
      socials: "",
      credits: 0,
    },
    AccountValue: {
      fieldOrder: ["controllers", "name", "username", "socials", "credits"],
      controllers: 0,
      name: 0,
      username: 0,
      socials: "",
      credits: 0,
    },
    Controller: {
      fieldOrder: ["account_id", "id", "signers", "address", "network", "constructor_calldata"],
      account_id: 0,
      id: 0,
      signers: 0,
      address: 0,
      network: 0,
      constructor_calldata: "",
    },
    ControllerValue: {
      fieldOrder: ["signers", "address", "network", "constructor_calldata"],
      signers: 0,
      address: 0,
      network: 0,
      constructor_calldata: "",
    },
    Signer: {
      fieldOrder: ["account_id", "controller_id", "method", "metadata"],
      account_id: 0,
      controller_id: 0,
      method: 0,
      metadata: "",
    },
    SignerValue: {
      fieldOrder: ["method", "metadata"],
      method: 0,
      metadata: "",
    },
  },
  provider: {
    Deployment: {
      fieldOrder: ["service", "project", "status", "tier", "config"],
      service: 0,
      project: 0,
      status: 0,
      tier: 0,
      config: "",
    },
    DeploymentValue: {
      fieldOrder: ["status", "tier", "config"],
      status: 0,
      tier: 0,
      config: "",
    },
    Factory: {
      fieldOrder: ["id", "version", "default_version"],
      id: 0,
      version: 0,
      default_version: 0,
    },
    FactoryValue: {
      fieldOrder: ["version", "default_version"],
      version: 0,
      default_version: 0,
    },
    Team: {
      fieldOrder: ["id", "deployment_count", "time", "name", "description"],
      id: 0,
      deployment_count: 0,
      time: 0,
      name: 0,
      description: "",
    },
    TeamValue: {
      fieldOrder: ["deployment_count", "time", "name", "description"],
      deployment_count: 0,
      time: 0,
      name: 0,
      description: "",
    },
    Teammate: {
      fieldOrder: ["team_id", "time", "account_id", "role"],
      team_id: 0,
      time: 0,
      account_id: 0,
      role: 0,
    },
    TeammateValue: {
      fieldOrder: ["role"],
      role: 0,
    },
  },
  registry: {
    Access: {
      fieldOrder: ["address", "role"],
      address: 0,
      role: 0,
    },
    AccessValue: {
      fieldOrder: ["role"],
      role: 0,
    },
    Achievement: {
      fieldOrder: ["world_address", "namespace", "id", "published", "whitelisted", "karma"],
      world_address: 0,
      namespace: 0,
      id: 0,
      published: false,
      whitelisted: false,
      karma: 0,
    },
    AchievementValue: {
      fieldOrder: ["published", "whitelisted", "karma"],
      published: false,
      whitelisted: false,
      karma: 0,
    },
    Game: {
      fieldOrder: [
        "world_address",
        "namespace",
        "project",
        "active",
        "published",
        "whitelisted",
        "priority",
        "karma",
        "metadata",
        "socials",
        "owner",
      ],
      world_address: 0,
      namespace: 0,
      project: 0,
      active: false,
      published: false,
      whitelisted: false,
      priority: 0,
      karma: 0,
      metadata: "",
      socials: "",
      owner: 0,
    },
    GameValue: {
      fieldOrder: [
        "project",
        "active",
        "published",
        "whitelisted",
        "priority",
        "karma",
        "metadata",
        "socials",
        "owner",
      ],
      project: 0,
      active: false,
      published: false,
      whitelisted: false,
      priority: 0,
      karma: 0,
      metadata: "",
      socials: "",
      owner: 0,
    },
  },
  social: {
    Alliance: {
      fieldOrder: ["id", "open", "free", "guild_count", "metadata", "socials"],
      id: 0,
      open: false,
      free: false,
      guild_count: 0,
      metadata: "",
      socials: "",
    },
    AllianceValue: {
      fieldOrder: ["open", "free", "guild_count", "metadata", "socials"],
      open: false,
      free: false,
      guild_count: 0,
      metadata: "",
      socials: "",
    },
    Guild: {
      fieldOrder: [
        "id",
        "open",
        "free",
        "role",
        "member_count",
        "alliance_id",
        "pending_alliance_id",
        "metadata",
        "socials",
      ],
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
      fieldOrder: ["open", "free", "role", "member_count", "alliance_id", "pending_alliance_id", "metadata", "socials"],
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
      fieldOrder: ["id", "role", "guild_id", "pending_guild_id"],
      id: 0,
      role: 0,
      guild_id: 0,
      pending_guild_id: 0,
    },
    MemberValue: {
      fieldOrder: ["role", "guild_id", "pending_guild_id"],
      role: 0,
      guild_id: 0,
      pending_guild_id: 0,
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
  Achievement = "registry-Achievement",
  AchievementValue = "registry-AchievementValue",
  Game = "registry-Game",
  GameValue = "registry-GameValue",
  Alliance = "social-Alliance",
  AllianceValue = "social-AllianceValue",
  Guild = "social-Guild",
  GuildValue = "social-GuildValue",
  Member = "social-Member",
  MemberValue = "social-MemberValue",
}
