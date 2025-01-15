import { initSDK } from "..";
import { constants } from "starknet";
import { Pin, PinEvent } from "./pin";
import { Follow, FollowEvent } from "./follow";
import { Guild, GuildModel } from "./guild";
import { Alliance, AllianceModel } from "./alliance";
import { Member, MemberModel } from "./member";

export * from "./policies";
export type { PinEvent, FollowEvent, GuildModel, AllianceModel, MemberModel };

export const Social = {
  Pin: Pin,
  Follow: Follow,
  Guild: Guild,
  Alliance: Alliance,
  Member: Member,

  init: async (chainId: constants.StarknetChainId) => {
    const sdk = await initSDK(chainId);
    Pin.init(sdk);
    Follow.init(sdk);
    Member.init(sdk);
    Guild.init(sdk);
    Alliance.init(sdk);
  },
};
