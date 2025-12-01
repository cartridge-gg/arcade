import { Atom } from "@effect-atom/atom-react";
import { Array as A, pipe } from "effect";
import { getChecksumAddress } from "starknet";
import type { PinEvent, FollowEvent, GuildModel } from "@cartridge/arcade";
import { arcadeAtom } from "./arcade";
import type { ArcadeEntityItem, ArcadeEventItem } from "../layers/arcade";

type ArcadeSocialModels = {
  TrophyPinning?: ArcadeEventItem & { type: "pin"; data: PinEvent };
  Follow?: ArcadeEventItem & { type: "follow"; data: FollowEvent };
  Guild?: ArcadeEntityItem & { type: "guild"; data: GuildModel };
};

const getArcadeSocialModels = (entity: { models?: Record<string, unknown> }):
  | ArcadeSocialModels
  | undefined => entity.models?.ARCADE as ArcadeSocialModels | undefined;

export const pinsAtom = Atom.make((get) => {
  const result = get(arcadeAtom);
  if (result._tag !== "Success") return result;

  const pins = pipe(
    result.value.items,
    A.filter(
      (entity) => getArcadeSocialModels(entity)?.TrophyPinning !== undefined,
    ),
    A.map((entity) => getArcadeSocialModels(entity)!.TrophyPinning!.data),
  );

  return { ...result, value: pins };
});

export const createPinsByPlayerAtom = (playerId: string) =>
  Atom.make((get) => {
    const result = get(pinsAtom);
    if (result._tag !== "Success") return result;

    const checksumAddress = getChecksumAddress(playerId);
    const filteredPins = pipe(
      result.value,
      A.filter((pin) => getChecksumAddress(pin.playerId) === checksumAddress),
    );

    return { ...result, value: filteredPins };
  });

export const followsAtom = Atom.make((get) => {
  const result = get(arcadeAtom);
  if (result._tag !== "Success") return result;

  const follows = pipe(
    result.value.items,
    A.filter((entity) => getArcadeSocialModels(entity)?.Follow !== undefined),
    A.map((entity) => getArcadeSocialModels(entity)!.Follow!.data),
  );

  return { ...result, value: follows };
});

export const createFollowsByFollowerAtom = (follower: string) =>
  Atom.make((get) => {
    const result = get(followsAtom);
    if (result._tag !== "Success") return result;

    const checksumAddress = getChecksumAddress(follower);
    const filteredFollows = pipe(
      result.value,
      A.filter(
        (follow) => getChecksumAddress(follow.follower) === checksumAddress,
      ),
    );

    return { ...result, value: filteredFollows };
  });

export const guildsAtom = Atom.make((get) => {
  const result = get(arcadeAtom);
  if (result._tag !== "Success") return result;

  const guilds = pipe(
    result.value.items,
    A.filter((entity) => getArcadeSocialModels(entity)?.Guild !== undefined),
    A.map((entity) => getArcadeSocialModels(entity)!.Guild!.data),
  );

  return { ...result, value: guilds };
});

export type { PinEvent, FollowEvent, GuildModel };
