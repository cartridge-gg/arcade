import { NAMESPACE } from "../../constants";
import { getChecksumAddress } from "starknet";
import type { SchemaType } from "@cartridge/models";
import { MemberClause, ParsedEntity } from "@dojoengine/sdk";

const MODEL_NAME = "Follow";

export class FollowEvent {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public follower: string,
    public followed: string,
    public time: number,
  ) {
    this.identifier = identifier;
    this.follower = follower;
    this.followed = followed;
    this.time = time;
  }

  static from(identifier: string, model: any) {
    if (!model) return FollowEvent.default(identifier);
    const follower = getChecksumAddress(model.follower);
    const followed = getChecksumAddress(model.followed);
    const time = Number(model.time);
    return new FollowEvent(identifier, follower, followed, time);
  }

  static default(identifier: string) {
    return new FollowEvent(identifier, "0x0", "0x0", 0);
  }

  static isType(model: FollowEvent) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.follower !== "0x0";
  }
}

export const Follow = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return FollowEvent.from(entity.entityId, entity.models[NAMESPACE]?.[MODEL_NAME]);
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getClause: () => {
    return MemberClause(`${NAMESPACE}-${Follow.getModelName()}`, "follower", "Neq", "0x0");
  },

  getMethods: () => [
    { name: "follow", entrypoint: "follow", description: "Follow another player." },
    { name: "unfollow", entrypoint: "unfollow", description: "Unfollow a player." },
  ],
};
