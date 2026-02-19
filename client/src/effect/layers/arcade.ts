import { makeToriiLayer } from "@dojoengine/react/effect";
import { Atom } from "@effect-atom/atom-react";
import {
  AccessModel,
  AllianceModel,
  BookModel,
  CollectionEditionModel,
  configs,
  EditionModel,
  FollowEvent,
  GameModel,
  getToriiUrl,
  GuildModel,
  ListingEvent,
  MemberModel,
  ModeratorModel,
  OfferEvent,
  OrderModel,
  PinEvent,
  SaleEvent,
} from "@cartridge/arcade";
import { constants } from "starknet";
import { DEFAULT_PROJECT } from "@/constants";

export type ArcadeEntityItem =
  | { type: "game"; identifier: string; data: GameModel }
  | { type: "edition"; identifier: string; data: EditionModel }
  | { type: "access"; identifier: string; data: AccessModel }
  | {
      type: "collectionEdition";
      identifier: string;
      data: CollectionEditionModel;
    }
  | { type: "order"; identifier: string; data: OrderModel }
  | { type: "book"; identifier: string; data: BookModel }
  | { type: "moderator"; identifier: string; data: ModeratorModel }
  | { type: "alliance"; identifier: string; data: AllianceModel }
  | { type: "guild"; identifier: string; data: GuildModel }
  | { type: "member"; identifier: string; data: MemberModel };

export type ArcadeEventItem =
  | { type: "listing"; key: string; data: ListingEvent }
  | { type: "offer"; key: string; data: OfferEvent }
  | { type: "sale"; key: string; data: SaleEvent }
  | { type: "pin"; key: string; data: PinEvent }
  | { type: "follow"; key: string; data: FollowEvent };

export type ArcadeItem = ArcadeEntityItem | ArcadeEventItem;

export const mainnetConfig = configs[constants.StarknetChainId.SN_MAIN];
export const ARCADE_MODELS = [
  "ARCADE-Game",
  "ARCADE-Edition",
  "ARCADE-Order",
  "ARCADE-Book",
  "ARCADE-Access",
  "ARCADE-CollectionEdition",
  "ARCADE-Moderator",
  "ARCADE-Listing",
  "ARCADE-Offer",
  "ARCADE-Sale",
  "ARCADE-Alliance",
  "ARCADE-Guild",
  "ARCADE-Member",
  "ARCADE-TrophyPinning",
  "ARCADE-Follow",
];

export const arcadeFormatters = {
  models: {
    "ARCADE-Game": (m: any, ctx: any) => ({
      type: "game",
      identifier: ctx.entityId,
      data: GameModel.from(ctx.entityId, m),
    }),
    "ARCADE-Edition": (m: any, ctx: any) => ({
      type: "edition",
      identifier: ctx.entityId,
      data: EditionModel.from(ctx.entityId, m),
    }),
    "ARCADE-Access": (m: any, ctx: any) => ({
      type: "access",
      identifier: ctx.entityId,
      data: AccessModel.from(ctx.entityId, m),
    }),
    "ARCADE-CollectionEdition": (m: any, ctx: any) => ({
      type: "collectionEdition",
      identifier: ctx.entityId,
      data: CollectionEditionModel.from(ctx.entityId, m),
    }),
    "ARCADE-Order": (m: any, ctx: any) => ({
      type: "order",
      identifier: ctx.entityId,
      data: OrderModel.from(ctx.entityId, m as any),
    }),
    "ARCADE-Book": (m: any, ctx: any) => ({
      type: "book",
      identifier: ctx.entityId,
      data: BookModel.from(ctx.entityId, m as any),
    }),
    "ARCADE-Moderator": (m: any, ctx: any) => ({
      type: "moderator",
      identifier: ctx.entityId,
      data: ModeratorModel.from(ctx.entityId, m as any),
    }),
    "ARCADE-Alliance": (m: any, ctx: any) => ({
      type: "alliance",
      identifier: ctx.entityId,
      data: AllianceModel.from(ctx.entityId, m),
    }),
    "ARCADE-Guild": (m: any, ctx: any) => ({
      type: "guild",
      identifier: ctx.entityId,
      data: GuildModel.from(ctx.entityId, m),
    }),
    "ARCADE-Member": (m: any, ctx: any) => ({
      type: "member",
      identifier: ctx.entityId,
      data: MemberModel.from(ctx.entityId, m),
    }),
    "ARCADE-Listing": (m: any, ctx: any) => ({
      type: "listing",
      key: ctx.entityId,
      data: ListingEvent.from(ctx.entityId, m as any),
    }),
    "ARCADE-Offer": (m: any, ctx: any) => ({
      type: "offer",
      key: ctx.entityId,
      data: OfferEvent.from(ctx.entityId, m as any),
    }),
    "ARCADE-Sale": (m: any, ctx: any) => ({
      type: "sale",
      key: ctx.entityId,
      data: SaleEvent.from(ctx.entityId, m as any),
    }),
    "ARCADE-TrophyPinning": (m: any, ctx: any) => ({
      type: "pin",
      key: ctx.entityId,
      data: PinEvent.from(ctx.entityId, m),
    }),
    "ARCADE-Follow": (m: any, ctx: any) => ({
      type: "follow",
      key: ctx.entityId,
      data: FollowEvent.from(ctx.entityId, m),
    }),
  },
} as const;

const toriiLayer = makeToriiLayer(
  { manifest: mainnetConfig.manifest, toriiUrl: getToriiUrl(DEFAULT_PROJECT) },
  {
    autoReconnect: true,
    maxReconnectAttempts: 5,
    formatters: arcadeFormatters,
  },
);

export const toriiRuntime = Atom.runtime(toriiLayer);
