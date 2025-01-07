import type { SchemaType } from "@dojoengine/sdk";

// Type definition for `registry::models::index::Access` struct
export interface Access {
	fieldOrder: string[];
	address: number;
	role: number;
}

// Type definition for `registry::models::index::AccessValue` struct
export interface AccessValue {
	fieldOrder: string[];
	role: number;
}

// Type definition for `controller::models::index::AccountValue` struct
export interface AccountValue {
	fieldOrder: string[];
	controllers: number;
	name: number;
	username: number;
	socials: string;
	credits: number;
}

// Type definition for `controller::models::index::Account` struct
export interface Account {
	fieldOrder: string[];
	id: number;
	controllers: number;
	name: number;
	username: number;
	socials: string;
	credits: number;
}

// Type definition for `registry::models::index::Achievement` struct
export interface Achievement {
	fieldOrder: string[];
	world_address: number;
	namespace: number;
	id: number;
	published: boolean;
	whitelisted: boolean;
	karma: number;
}

// Type definition for `registry::models::index::AchievementValue` struct
export interface AchievementValue {
	fieldOrder: string[];
	published: boolean;
	whitelisted: boolean;
	karma: number;
}

// Type definition for `society::models::index::AllianceValue` struct
export interface AllianceValue {
	fieldOrder: string[];
	open: boolean;
	free: boolean;
	guild_count: number;
	metadata: string;
	socials: string;
}

// Type definition for `society::models::index::Alliance` struct
export interface Alliance {
	fieldOrder: string[];
	id: number;
	open: boolean;
	free: boolean;
	guild_count: number;
	metadata: string;
	socials: string;
}

// Type definition for `controller::models::index::Controller` struct
export interface Controller {
	fieldOrder: string[];
	account_id: number;
	id: number;
	signers: number;
	address: number;
	network: number;
	constructor_calldata: string;
}

// Type definition for `controller::models::index::ControllerValue` struct
export interface ControllerValue {
	fieldOrder: string[];
	signers: number;
	address: number;
	network: number;
	constructor_calldata: string;
}

// Type definition for `provider::models::index::DeploymentValue` struct
export interface DeploymentValue {
	fieldOrder: string[];
	status: number;
	tier: number;
	config: string;
}

// Type definition for `provider::models::index::Deployment` struct
export interface Deployment {
	fieldOrder: string[];
	service: number;
	project: number;
	status: number;
	tier: number;
	config: string;
}

// Type definition for `provider::models::index::FactoryValue` struct
export interface FactoryValue {
	fieldOrder: string[];
	version: number;
	default_version: number;
}

// Type definition for `provider::models::index::Factory` struct
export interface Factory {
	fieldOrder: string[];
	id: number;
	version: number;
	default_version: number;
}

// Type definition for `registry::models::index::GameValue` struct
export interface GameValue {
	fieldOrder: string[];
	project: number;
	active: boolean;
	published: boolean;
	whitelisted: boolean;
	priority: number;
	karma: number;
	metadata: string;
	socials: string;
	owner: number;
}

// Type definition for `registry::models::index::Game` struct
export interface Game {
	fieldOrder: string[];
	world_address: number;
	namespace: number;
	project: number;
	active: boolean;
	published: boolean;
	whitelisted: boolean;
	priority: number;
	karma: number;
	metadata: string;
	socials: string;
	owner: number;
}

// Type definition for `society::models::index::GuildValue` struct
export interface GuildValue {
	fieldOrder: string[];
	open: boolean;
	free: boolean;
	role: number;
	member_count: number;
	alliance_id: number;
	pending_alliance_id: number;
	metadata: string;
	socials: string;
}

// Type definition for `society::models::index::Guild` struct
export interface Guild {
	fieldOrder: string[];
	id: number;
	open: boolean;
	free: boolean;
	role: number;
	member_count: number;
	alliance_id: number;
	pending_alliance_id: number;
	metadata: string;
	socials: string;
}

// Type definition for `society::models::index::Member` struct
export interface Member {
	fieldOrder: string[];
	id: number;
	role: number;
	guild_id: number;
	pending_guild_id: number;
}

// Type definition for `society::models::index::MemberValue` struct
export interface MemberValue {
	fieldOrder: string[];
	role: number;
	guild_id: number;
	pending_guild_id: number;
}

// Type definition for `controller::models::index::Signer` struct
export interface Signer {
	fieldOrder: string[];
	account_id: number;
	controller_id: number;
	method: number;
	metadata: string;
}

// Type definition for `controller::models::index::SignerValue` struct
export interface SignerValue {
	fieldOrder: string[];
	method: number;
	metadata: string;
}

// Type definition for `provider::models::index::TeamValue` struct
export interface TeamValue {
	fieldOrder: string[];
	deployment_count: number;
	time: number;
	name: number;
	description: string;
}

// Type definition for `provider::models::index::Team` struct
export interface Team {
	fieldOrder: string[];
	id: number;
	deployment_count: number;
	time: number;
	name: number;
	description: string;
}

// Type definition for `provider::models::index::TeammateValue` struct
export interface TeammateValue {
	fieldOrder: string[];
	role: number;
}

// Type definition for `provider::models::index::Teammate` struct
export interface Teammate {
	fieldOrder: string[];
	team_id: number;
	time: number;
	account_id: number;
	role: number;
}

export interface Schema extends SchemaType {
	registry: {
		Access: Access,
		AccessValue: AccessValue,
		Achievement: Achievement,
		AchievementValue: AchievementValue,
		GameValue: GameValue,
		Game: Game,
	},
	controller: {
		AccountValue: AccountValue,
		Account: Account,
		Controller: Controller,
		ControllerValue: ControllerValue,
		Signer: Signer,
		SignerValue: SignerValue,
	},
	society: {
		AllianceValue: AllianceValue,
		Alliance: Alliance,
		GuildValue: GuildValue,
		Guild: Guild,
		Member: Member,
		MemberValue: MemberValue,
	},
	provider: {
		DeploymentValue: DeploymentValue,
		Deployment: Deployment,
		FactoryValue: FactoryValue,
		Factory: Factory,
		TeamValue: TeamValue,
		Team: Team,
		TeammateValue: TeammateValue,
		Teammate: Teammate,
	},
}
export const schema: Schema = {
	registry: {
		Access: {
			fieldOrder: ['address', 'role'],
			address: 0,
			role: 0,
		},
		AccessValue: {
			fieldOrder: ['role'],
			role: 0,
		},
		Achievement: {
			fieldOrder: ['world_address', 'namespace', 'id', 'published', 'whitelisted', 'karma'],
			world_address: 0,
			namespace: 0,
			id: 0,
			published: false,
			whitelisted: false,
			karma: 0,
		},
		AchievementValue: {
			fieldOrder: ['published', 'whitelisted', 'karma'],
			published: false,
			whitelisted: false,
			karma: 0,
		},
		GameValue: {
			fieldOrder: ['project', 'active', 'published', 'whitelisted', 'priority', 'karma', 'metadata', 'socials', 'owner'],
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
		Game: {
			fieldOrder: ['world_address', 'namespace', 'project', 'active', 'published', 'whitelisted', 'priority', 'karma', 'metadata', 'socials', 'owner'],
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
	},
	controller: {
		AccountValue: {
			fieldOrder: ['controllers', 'name', 'username', 'socials', 'credits'],
			controllers: 0,
			name: 0,
			username: 0,
			socials: "",
			credits: 0,
		},
		Account: {
			fieldOrder: ['id', 'controllers', 'name', 'username', 'socials', 'credits'],
			id: 0,
			controllers: 0,
			name: 0,
			username: 0,
			socials: "",
			credits: 0,
		},
		Controller: {
			fieldOrder: ['account_id', 'id', 'signers', 'address', 'network', 'constructor_calldata'],
			account_id: 0,
			id: 0,
			signers: 0,
			address: 0,
			network: 0,
			constructor_calldata: "",
		},
		ControllerValue: {
			fieldOrder: ['signers', 'address', 'network', 'constructor_calldata'],
			signers: 0,
			address: 0,
			network: 0,
			constructor_calldata: "",
		},
		Signer: {
			fieldOrder: ['account_id', 'controller_id', 'method', 'metadata'],
			account_id: 0,
			controller_id: 0,
			method: 0,
			metadata: "",
		},
		SignerValue: {
			fieldOrder: ['method', 'metadata'],
			method: 0,
			metadata: "",
		},
	},
	society: {
		AllianceValue: {
			fieldOrder: ['open', 'free', 'guild_count', 'metadata', 'socials'],
			open: false,
			free: false,
			guild_count: 0,
			metadata: "",
			socials: "",
		},
		Alliance: {
			fieldOrder: ['id', 'open', 'free', 'guild_count', 'metadata', 'socials'],
			id: 0,
			open: false,
			free: false,
			guild_count: 0,
			metadata: "",
			socials: "",
		},
		GuildValue: {
			fieldOrder: ['open', 'free', 'role', 'member_count', 'alliance_id', 'pending_alliance_id', 'metadata', 'socials'],
			open: false,
			free: false,
			role: 0,
			member_count: 0,
			alliance_id: 0,
			pending_alliance_id: 0,
			metadata: "",
			socials: "",
		},
		Guild: {
			fieldOrder: ['id', 'open', 'free', 'role', 'member_count', 'alliance_id', 'pending_alliance_id', 'metadata', 'socials'],
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
		Member: {
			fieldOrder: ['id', 'role', 'guild_id', 'pending_guild_id'],
			id: 0,
			role: 0,
			guild_id: 0,
			pending_guild_id: 0,
		},
		MemberValue: {
			fieldOrder: ['role', 'guild_id', 'pending_guild_id'],
			role: 0,
			guild_id: 0,
			pending_guild_id: 0,
		},
	},
	provider: {
		DeploymentValue: {
			fieldOrder: ['status', 'tier', 'config'],
			status: 0,
			tier: 0,
			config: "",
		},
		Deployment: {
			fieldOrder: ['service', 'project', 'status', 'tier', 'config'],
			service: 0,
			project: 0,
			status: 0,
			tier: 0,
			config: "",
		},
		FactoryValue: {
			fieldOrder: ['version', 'default_version'],
			version: 0,
			default_version: 0,
		},
		Factory: {
			fieldOrder: ['id', 'version', 'default_version'],
			id: 0,
			version: 0,
			default_version: 0,
		},
		TeamValue: {
			fieldOrder: ['deployment_count', 'time', 'name', 'description'],
			deployment_count: 0,
			time: 0,
			name: 0,
			description: "",
		},
		Team: {
			fieldOrder: ['id', 'deployment_count', 'time', 'name', 'description'],
			id: 0,
			deployment_count: 0,
			time: 0,
			name: 0,
			description: "",
		},
		TeammateValue: {
			fieldOrder: ['role'],
			role: 0,
		},
		Teammate: {
			fieldOrder: ['team_id', 'time', 'account_id', 'role'],
			team_id: 0,
			time: 0,
			account_id: 0,
			role: 0,
		},
	},
};