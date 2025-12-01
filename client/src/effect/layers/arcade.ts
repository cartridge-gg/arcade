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

const toriiLayer = makeToriiLayer(
  { manifest: mainnetConfig.manifest, toriiUrl: getToriiUrl(DEFAULT_PROJECT) },
  {
    autoReconnect: false,
    maxReconnectAttempts: 5,
    formatters: {
      models: {
        "ARCADE-Game": (m, ctx) => ({
          type: "game",
          identifier: ctx.entityId,
          data: GameModel.from(ctx.entityId, m),
        }),
        "ARCADE-Edition": (m, ctx) => ({
          type: "edition",
          identifier: ctx.entityId,
          data: EditionModel.from(ctx.entityId, m),
        }),
        "ARCADE-Access": (m, ctx) => ({
          type: "access",
          identifier: ctx.entityId,
          data: AccessModel.from(ctx.entityId, m),
        }),
        "ARCADE-CollectionEdition": (m, ctx) => ({
          type: "collectionEdition",
          identifier: ctx.entityId,
          data: CollectionEditionModel.from(ctx.entityId, m),
        }),
        "ARCADE-Order": (m, ctx) => ({
          type: "order",
          identifier: ctx.entityId,
          data: OrderModel.from(ctx.entityId, m as any),
        }),
        "ARCADE-Book": (m, ctx) => ({
          type: "book",
          identifier: ctx.entityId,
          data: BookModel.from(ctx.entityId, m as any),
        }),
        "ARCADE-Moderator": (m, ctx) => ({
          type: "moderator",
          identifier: ctx.entityId,
          data: ModeratorModel.from(ctx.entityId, m as any),
        }),
        "ARCADE-Alliance": (m, ctx) => ({
          type: "alliance",
          identifier: ctx.entityId,
          data: AllianceModel.from(ctx.entityId, m),
        }),
        "ARCADE-Guild": (m, ctx) => ({
          type: "guild",
          identifier: ctx.entityId,
          data: GuildModel.from(ctx.entityId, m),
        }),
        "ARCADE-Member": (m, ctx) => ({
          type: "member",
          identifier: ctx.entityId,
          data: MemberModel.from(ctx.entityId, m),
        }),
        "ARCADE-Listing": (m, ctx) => ({
          type: "listing",
          key: ctx.entityId,
          data: ListingEvent.from(ctx.entityId, m as any),
        }),
        "ARCADE-Offer": (m, ctx) => ({
          type: "offer",
          key: ctx.entityId,
          data: OfferEvent.from(ctx.entityId, m as any),
        }),
        "ARCADE-Sale": (m, ctx) => ({
          type: "sale",
          key: ctx.entityId,
          data: SaleEvent.from(ctx.entityId, m as any),
        }),
        "ARCADE-TrophyPinning": (m, ctx) => ({
          type: "pin",
          key: ctx.entityId,
          data: PinEvent.from(ctx.entityId, m),
        }),
        "ARCADE-Follow": (m, ctx) => ({
          type: "follow",
          key: ctx.entityId,
          data: FollowEvent.from(ctx.entityId, m),
        }),
      },
    },
  },
);

export const toriiRuntime = Atom.runtime(toriiLayer);
