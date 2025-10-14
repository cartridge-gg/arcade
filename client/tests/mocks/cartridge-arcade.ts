import { ToriiClient } from "./torii-wasm";

type AnyRecord = Record<string, unknown>;

class BaseModel {
  id?: number | string | bigint;
  identifier: string;
  constructor(data: AnyRecord = {}) {
    Object.assign(this, data);
    this.id = (data.id as number | string | bigint | undefined) ?? this.id;
    this.identifier = String(
      data.identifier ?? data.id ?? data.name ?? Date.now().toString(),
    );
  }
  static isType() {
    return true;
  }
  exists() {
    return true;
  }
}

class AccessModel extends BaseModel {}
class GameModel extends BaseModel {}

class EditionModel extends BaseModel {
  config: AnyRecord;
  properties: AnyRecord;
  socials: AnyRecord;
  constructor(data: AnyRecord = {}) {
    super(data);
    this.config = (data.config as AnyRecord) ?? {};
    this.properties = (data.properties as AnyRecord) ?? {};
    this.socials = (data.socials as AnyRecord) ?? {};
  }
}

class CollectionEditionModel extends BaseModel {}
class GuildModel extends BaseModel {}

class PinEvent extends BaseModel {
  time: number;
  playerId: string;
  achievementId: string;
  constructor(data: AnyRecord = {}) {
    super(data);
    this.time = Number(data.time ?? Date.now());
    this.playerId = String(data.playerId ?? "");
    this.achievementId = String(data.achievementId ?? "");
  }
}

class FollowEvent extends BaseModel {
  time: number;
  follower: string;
  followed: string;
  constructor(data: AnyRecord = {}) {
    super(data);
    this.time = Number(data.time ?? Date.now());
    this.follower = String(data.follower ?? "");
    this.followed = String(data.followed ?? "");
  }
}

class BookModel extends BaseModel {}

const StatusType = {
  Placed: "Placed",
  Filled: "Filled",
  Cancelled: "Cancelled",
} as const;

const CategoryType = {
  Buy: "Buy",
  Sell: "Sell",
} as const;

class OrderModel extends BaseModel {
  status: { value: (typeof StatusType)[keyof typeof StatusType] };
  owner: string;
  price: number;
  constructor(data: AnyRecord = {}) {
    super(data);
    this.owner = String(data.owner ?? "0x0");
    this.price = Number(data.price ?? 0);
    const status = (data.status as AnyRecord) ?? {};
    const value = status.value;
    this.status = {
      value: (typeof value === "string" &&
      (Object.values(StatusType) as string[]).includes(value)
        ? value
        : StatusType.Placed) as (typeof StatusType)[keyof typeof StatusType],
    };
  }
}

class ListingEvent extends BaseModel {}
class SaleEvent extends BaseModel {}
class MarketplaceModel extends BaseModel {}

class Socials {
  private value: AnyRecord;
  constructor(value: AnyRecord = {}) {
    this.value = { ...value };
  }
  static merge(...sources: Array<AnyRecord | null | undefined>) {
    return sources.reduce<AnyRecord>((acc, source) => {
      if (!source) return acc;
      // biome-ignore lint/performance/noAccumulatingSpread: this is a test file, we can disable linting for this usecase
      return { ...acc, ...source };
    }, {});
  }
  compile() {
    return { ...this.value };
  }
}

class Attributes {
  private value: AnyRecord;
  constructor(value: AnyRecord = {}) {
    this.value = { ...value };
  }
  compile() {
    return { ...this.value };
  }
}

class Properties {
  private value: AnyRecord;
  constructor(value: AnyRecord = {}) {
    this.value = { ...value };
  }
  compile() {
    return { ...this.value };
  }
}

const noopAsync = async () => {};
const noop = () => {};

const Registry = {
  async init() {
    return;
  },
  async fetch(
    callback: (models: Array<BaseModel>) => void,
    _options?: AnyRecord,
  ) {
    callback([]);
  },
  async sub(
    callback: (models: Array<BaseModel>) => void,
    _options?: AnyRecord,
  ) {
    callback([]);
  },
  unsub: noop,
};

const Social = {
  init: noopAsync,
  async fetch(
    callback: (models: Array<BaseModel>) => void,
    _options?: AnyRecord,
  ) {
    callback([]);
  },
  sub: noopAsync,
  unsub: noop,
};

const Marketplace = {
  sdk: undefined as unknown,
  init: noopAsync,
  fetch: noopAsync,
  sub: noopAsync,
  unsub: noop,
  fetchEntities: noopAsync,
  fetchEvents: noopAsync,
  subEntities: noopAsync,
  subEvents: noopAsync,
  isEntityQueryable() {
    return true;
  },
  isEventQueryable() {
    return false;
  },
  async fetchCollections() {
    return {};
  },
};

const RoleType = {
  Admin: "Admin",
  Player: "Player",
} as const;

class ArcadeProvider {
  chainId: unknown;
  social: {
    pin: (_args: AnyRecord) => unknown[];
    unpin: (_args: AnyRecord) => unknown[];
  };
  registry: AnyRecord;
  marketplace: AnyRecord;
  provider: { getClassAt: (_address: string) => Promise<AnyRecord> };

  constructor(chainId: unknown) {
    this.chainId = chainId;
    this.social = {
      pin: () => [],
      unpin: () => [],
    };
    this.registry = {
      register_game: () => [],
      register_collection: () => [],
    };
    this.marketplace = {
      fetchCollections: async () => ({}),
      fetch: noopAsync,
      sub: noopAsync,
      unsub: noop,
    };
    this.provider = {
      getClassAt: async () => ({}),
    };
  }

  async getToriiClient(_url: string) {
    return new ToriiClient();
  }
}

const getSocialPolicies = (_chainId: unknown) => ({ contracts: {} });
const getRegistryPolicies = (_chainId: unknown) => ({ contracts: {} });
const getMarketplacePolicies = (_chainId: unknown) => ({ contracts: {} });

export {
  AccessModel,
  ArcadeProvider,
  Attributes,
  BookModel,
  CategoryType,
  CollectionEditionModel,
  EditionModel,
  FollowEvent,
  GameModel,
  GuildModel,
  ListingEvent,
  Marketplace,
  MarketplaceModel,
  OrderModel,
  PinEvent,
  Properties,
  Registry,
  RoleType,
  SaleEvent,
  Social,
  Socials,
  StatusType,
  getMarketplacePolicies,
  getRegistryPolicies,
  getSocialPolicies,
};
