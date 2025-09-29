import { NAMESPACE } from "../../constants";
import { getChecksumAddress } from "starknet";
import type { SchemaType } from "../../bindings";
import { MemberClause, ParsedEntity } from "@dojoengine/sdk";

const MODEL_NAME = "TrophyPinning";

export class PinEvent {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public playerId: string,
    public achievementId: string,
    public time: number,
  ) {
    this.identifier = identifier;
    this.playerId = playerId;
    this.achievementId = achievementId;
    this.time = time;
  }

  static from(identifier: string, model: any) {
    if (!model) return PinEvent.default(identifier);
    const playerId = getChecksumAddress(model.player_id);
    const achievementId = `0x${BigInt(String(model.achievement_id)).toString(16)}`;
    const time = Number(model.time);
    return new PinEvent(identifier, playerId, achievementId, time);
  }

  static isType(model: PinEvent) {
    return model.type === MODEL_NAME;
  }

  static default(identifier: string) {
    return new PinEvent(identifier, "0x0", "0x0", 0);
  }

  exists() {
    return this.playerId !== "0x0";
  }
}

export const Pin = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return PinEvent.from(entity.entityId, entity.models[NAMESPACE]?.[MODEL_NAME]);
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getClause: () => {
    return MemberClause(`${NAMESPACE}-${Pin.getModelName()}`, "player_id", "Neq", "0x0");
  },

  getMethods: () => [
    { name: "pin", entrypoint: "pin", description: "Pin an achievement." },
    { name: "unpin", entrypoint: "unpin", description: "Unpin an achievement." },
  ],
};
