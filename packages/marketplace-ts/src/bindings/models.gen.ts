import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import type { BigNumberish } from "starknet";

// Type definition for `orderbook::models::index::Access` struct
export interface Access {
	address: BigNumberish;
	role: BigNumberish;
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

// Type definition for `orderbook::models::index::MetadataAttributeIntegrity` struct
export interface MetadataAttributeIntegrity {
	identity: string;
	collection: BigNumberish;
	token_id: BigNumberish;
	state: BigNumberish;
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

export interface SchemaType extends ISchemaType {
	NO_ROOT_PACKAGE: {
		Access: Access;
		Book: Book;
		MetadataAttribute: MetadataAttribute;
		MetadataAttributeIntegrity: MetadataAttributeIntegrity;
		Order: Order;
		Listing: Listing;
		Offer: Offer;
		Sale: Sale;
	};
}
export const schema: SchemaType = {
	NO_ROOT_PACKAGE: {
		Access: {
			address: 0,
			role: 0,
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
		MetadataAttributeIntegrity: {
			identity: "",
			collection: 0,
			token_id: 0,
			state: 0,
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
		Listing: {
			order_id: 0,
			order: {
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
			time: 0,
		},
		Offer: {
			order_id: 0,
			order: {
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
			time: 0,
		},
		Sale: {
			order_id: 0,
			order: {
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
			from: 0,
			to: 0,
			time: 0,
		},
	},
};
export enum ModelsMapping {
	Access = "MARKETPLACE-Access",
	Book = "MARKETPLACE-Book",
	MetadataAttribute = "MARKETPLACE-MetadataAttribute",
	MetadataAttributeIntegrity = "MARKETPLACE-MetadataAttributeIntegrity",
	Order = "MARKETPLACE-Order",
	Listing = "MARKETPLACE-Listing",
	Offer = "MARKETPLACE-Offer",
	Sale = "MARKETPLACE-Sale",
}
