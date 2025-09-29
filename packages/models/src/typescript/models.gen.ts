import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { BigNumberish } from 'starknet';

// Type definition for `controller::models::index::Account` struct
export interface Account {
	id: BigNumberish;
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

// Type definition for `controller::models::index::Signer` struct
export interface Signer {
	account_id: BigNumberish;
	controller_id: BigNumberish;
	method: BigNumberish;
	metadata: string;
}

// Type definition for `orderbook::models::index::Book` struct
export interface Book {
	id: BigNumberish;
	version: BigNumberish;
	paused: boolean;
	royalties: boolean;
	counter: BigNumberish;
	fee_num: BigNumberish;
	fee_receiver: BigNumberish;
}

// Type definition for `orderbook::models::index::MetadataAttribute` struct
export interface MetadataAttribute {
	identity: string;
	collection: BigNumberish;
	token_id: BigNumberish;
	index: BigNumberish;
	trait_type: string;
	value: string;
}

// Type definition for `orderbook::models::index::Moderator` struct
export interface Moderator {
	address: BigNumberish;
	role: BigNumberish;
}

// Type definition for `orderbook::models::index::Order` struct
export interface Order {
	id: BigNumberish;
	collection: BigNumberish;
	token_id: BigNumberish;
	royalties: boolean;
	category: BigNumberish;
	status: BigNumberish;
	expiration: BigNumberish;
	quantity: BigNumberish;
	price: BigNumberish;
	currency: BigNumberish;
	owner: BigNumberish;
}

// Type definition for `provider::models::index::Deployment` struct
export interface Deployment {
	service: BigNumberish;
	project: BigNumberish;
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

// Type definition for `provider::models::index::Team` struct
export interface Team {
	id: BigNumberish;
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

// Type definition for `registry::models::index::Access` struct
export interface Access {
	address: BigNumberish;
	role: BigNumberish;
}

// Type definition for `registry::models::index::Collection` struct
export interface Collection {
	id: BigNumberish;
	uuid: BigNumberish;
	contract_address: string;
}

// Type definition for `registry::models::index::CollectionEdition` struct
export interface CollectionEdition {
	collection: BigNumberish;
	edition: BigNumberish;
	active: boolean;
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

// Type definition for `registry::models::index::Unicity` struct
export interface Unicity {
	world_address: BigNumberish;
	namespace: BigNumberish;
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

// Type definition for `social::models::index::Member` struct
export interface Member {
	id: BigNumberish;
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

// Type definition for `orderbook::events::index::Listing` struct
export interface Listing {
	order_id: BigNumberish;
	order: Order;
	time: BigNumberish;
}

// Type definition for `orderbook::events::index::Offer` struct
export interface Offer {
	order_id: BigNumberish;
	order: Order;
	time: BigNumberish;
}

// Type definition for `orderbook::events::index::Sale` struct
export interface Sale {
	order_id: BigNumberish;
	order: Order;
	from: BigNumberish;
	to: BigNumberish;
	time: BigNumberish;
}

// Type definition for `social::events::index::Follow` struct
export interface Follow {
	follower: BigNumberish;
	followed: BigNumberish;
	time: BigNumberish;
}

export interface SchemaType extends ISchemaType {
	arcade: {
		Account: Account,
		Controller: Controller,
		Signer: Signer,
		Book: Book,
		MetadataAttribute: MetadataAttribute,
		Moderator: Moderator,
		Order: Order,
		Deployment: Deployment,
		Factory: Factory,
		Team: Team,
		Teammate: Teammate,
		Access: Access,
		Collection: Collection,
		CollectionEdition: CollectionEdition,
		Edition: Edition,
		Game: Game,
		Unicity: Unicity,
		Alliance: Alliance,
		Guild: Guild,
		Member: Member,
		TrophyPinning: TrophyPinning,
		Listing: Listing,
		Offer: Offer,
		Sale: Sale,
		Follow: Follow,
	},
}
export const schema: SchemaType = {
	arcade: {
		Account: {
			id: 0,
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
		Signer: {
			account_id: 0,
			controller_id: 0,
			method: 0,
		metadata: "",
		},
		Book: {
			id: 0,
			version: 0,
			paused: false,
			royalties: false,
			counter: 0,
			fee_num: 0,
			fee_receiver: 0,
		},
		MetadataAttribute: {
			identity: "",
			collection: 0,
		token_id: 0,
			index: 0,
		trait_type: "",
		value: "",
		},
		Moderator: {
			address: 0,
			role: 0,
		},
		Order: {
			id: 0,
			collection: 0,
		token_id: 0,
			royalties: false,
			category: 0,
			status: 0,
			expiration: 0,
			quantity: 0,
			price: 0,
			currency: 0,
			owner: 0,
		},
		Deployment: {
			service: 0,
			project: 0,
			status: 0,
			tier: 0,
		config: "",
		},
		Factory: {
			id: 0,
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
		Teammate: {
			team_id: 0,
			time: 0,
			account_id: 0,
			role: 0,
		},
		Access: {
			address: 0,
			role: 0,
		},
		Collection: {
			id: 0,
			uuid: 0,
			contract_address: "",
		},
		CollectionEdition: {
			collection: 0,
			edition: 0,
			active: false,
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
		Unicity: {
			world_address: 0,
			namespace: 0,
			token_id: 0,
		},
		Alliance: {
			id: 0,
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
		Member: {
			id: 0,
			role: 0,
			guild_id: 0,
			pending_guild_id: 0,
		},
		TrophyPinning: {
			player_id: 0,
			achievement_id: 0,
			time: 0,
		},
		Listing: {
			order_id: 0,
		order: { id: 0, collection: 0, token_id: 0, royalties: false, category: 0, status: 0, expiration: 0, quantity: 0, price: 0, currency: 0, owner: 0, },
			time: 0,
		},
		Offer: {
			order_id: 0,
		order: { id: 0, collection: 0, token_id: 0, royalties: false, category: 0, status: 0, expiration: 0, quantity: 0, price: 0, currency: 0, owner: 0, },
			time: 0,
		},
		Sale: {
			order_id: 0,
		order: { id: 0, collection: 0, token_id: 0, royalties: false, category: 0, status: 0, expiration: 0, quantity: 0, price: 0, currency: 0, owner: 0, },
			from: 0,
			to: 0,
			time: 0,
		},
		Follow: {
			follower: 0,
			followed: 0,
			time: 0,
		},
	},
};
export enum ModelsMapping {
	Account = 'controller-Account',
	Controller = 'controller-Controller',
	Signer = 'controller-Signer',
	Book = 'orderbook-Book',
	MetadataAttribute = 'orderbook-MetadataAttribute',
	Moderator = 'orderbook-Moderator',
	Order = 'orderbook-Order',
	Deployment = 'provider-Deployment',
	Factory = 'provider-Factory',
	Team = 'provider-Team',
	Teammate = 'provider-Teammate',
	Access = 'registry-Access',
	Collection = 'registry-Collection',
	CollectionEdition = 'registry-CollectionEdition',
	Edition = 'registry-Edition',
	Game = 'registry-Game',
	Unicity = 'registry-Unicity',
	Alliance = 'social-Alliance',
	Guild = 'social-Guild',
	Member = 'social-Member',
	TrophyPinning = 'achievement-TrophyPinning',
	Listing = 'orderbook-Listing',
	Offer = 'orderbook-Offer',
	Sale = 'orderbook-Sale',
	Follow = 'social-Follow',
}