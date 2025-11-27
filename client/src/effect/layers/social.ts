import { Effect, Context, Layer, Data } from "effect";
import {
  Social,
  PinEvent,
  FollowEvent,
  GuildModel,
  type SocialModel,
} from "@cartridge/arcade";
import { constants, getChecksumAddress } from "starknet";

const CHAIN_ID = constants.StarknetChainId.SN_MAIN;

export class SocialError extends Data.TaggedError("SocialError")<{
  message: string;
}> {}

export interface SocialItem {
  type: "pin" | "follow" | "guild";
  key: string;
  data: PinEvent | FollowEvent | GuildModel;
}

export interface SocialClientImpl {
  fetchAll: () => Effect.Effect<SocialItem[], SocialError>;
}

export class SocialClient extends Context.Tag("SocialClient")<
  SocialClient,
  SocialClientImpl
>() {}

export const makeSocialLayer = () =>
  Layer.succeed(SocialClient, {
    fetchAll: (): Effect.Effect<SocialItem[], SocialError> =>
      Effect.tryPromise({
        try: async () => {
          await Social.init(CHAIN_ID);
          const items: SocialItem[] = [];

          await Social.fetch(
            (models: SocialModel[]) => {
              models.forEach((model) => {
                if (PinEvent.isType(model as PinEvent)) {
                  const pin = model as PinEvent;
                  if (pin.time > 0) {
                    const playerId = getChecksumAddress(pin.playerId);
                    items.push({
                      type: "pin",
                      key: `${playerId}-${pin.achievementId}`,
                      data: pin,
                    });
                    return;
                  }
                }
                if (FollowEvent.isType(model as FollowEvent)) {
                  const follow = model as FollowEvent;
                  if (follow.time > 0) {
                    const follower = getChecksumAddress(follow.follower);
                    const followed = getChecksumAddress(follow.followed);
                    items.push({
                      type: "follow",
                      key: `${follower}-${followed}`,
                      data: follow,
                    });
                    return;
                  }
                }
                if (GuildModel.isType(model as GuildModel)) {
                  const guild = model as GuildModel;
                  if (guild.exists()) {
                    items.push({
                      type: "guild",
                      key: guild.id.toString(),
                      data: guild,
                    });
                    return;
                  }
                }
              });
            },
            { pin: true, follow: true, guild: true }
          );

          return items;
        },
        catch: (error) =>
          new SocialError({
            message: error instanceof Error ? error.message : "Unknown error",
          }),
      }),
  });

export const socialLayer = makeSocialLayer();
