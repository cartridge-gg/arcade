import { Atom } from "@effect-atom/atom-react";
import { Effect, Array as A, pipe } from "effect";
import { getChecksumAddress } from "starknet";
import {
  SocialClient,
  socialLayer,
  type SocialItem,
} from "../layers/social";
import type {
  PinEvent,
  FollowEvent,
  GuildModel,
} from "@cartridge/arcade";

const fetchSocialEffect = Effect.gen(function* () {
  const client = yield* SocialClient;
  return yield* client.fetchAll();
});

const socialRuntime = Atom.runtime(socialLayer);

export const socialAtom = socialRuntime
  .atom(fetchSocialEffect)
  .pipe(Atom.keepAlive);

export const pinsAtom = Atom.make((get) => {
  const result = get(socialAtom);
  if (result._tag !== "Success") return result;

  const pins = pipe(
    result.value,
    A.filter((item): item is SocialItem & { data: PinEvent } =>
      item.type === "pin"
    ),
    A.map((item) => item.data)
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
      A.filter(
        (pin) => getChecksumAddress(pin.playerId) === checksumAddress
      )
    );

    return { ...result, value: filteredPins };
  });

export const followsAtom = Atom.make((get) => {
  const result = get(socialAtom);
  if (result._tag !== "Success") return result;

  const follows = pipe(
    result.value,
    A.filter((item): item is SocialItem & { data: FollowEvent } =>
      item.type === "follow"
    ),
    A.map((item) => item.data)
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
        (follow) => getChecksumAddress(follow.follower) === checksumAddress
      )
    );

    return { ...result, value: filteredFollows };
  });

export const guildsAtom = Atom.make((get) => {
  const result = get(socialAtom);
  if (result._tag !== "Success") return result;

  const guilds = pipe(
    result.value,
    A.filter((item): item is SocialItem & { data: GuildModel } =>
      item.type === "guild"
    ),
    A.map((item) => item.data)
  );

  return { ...result, value: guilds };
});

export type { PinEvent, FollowEvent, GuildModel };
