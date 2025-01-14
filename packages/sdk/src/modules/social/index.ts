import { initSDK } from "..";
import { constants } from "starknet";
import { configs } from "../../configs";
import { getContractByName } from "../../provider/helpers";
import { Pin } from "./pin";
import { Follow } from "./follow";
import { Guild } from "./guild";
import { Alliance } from "./alliance";
import { Member } from "./member";
export const Social = {
  address: undefined as string | undefined,
  Pin: Pin,
  Follow: Follow,
  Guild: Guild,
  Alliance: Alliance,
  Member: Member,

  init: async (chainId: constants.StarknetChainId) => {
    const config = configs[chainId];
    const address = getContractByName(config.manifest, "Social");
    const sdk = await initSDK(chainId);
    Social.address = address;
    Pin.init(sdk, address);
    Follow.init(sdk, address);
    Member.init(sdk, address);
    Guild.init(sdk, address);
    Alliance.init(sdk, address);
  },

  policies: () => {
    if (!Social.address) {
      throw new Error("Social module is not initialized");
    }
    return {
      contracts: {
        [Social.address]: {
          name: "Social",
          description: "Social contract to manage your social activities",
          methods: [
            ...Pin.methods(),
            ...Follow.methods(),
            ...Member.methods(),
            ...Guild.methods(),
            ...Alliance.methods(),
          ],
        },
      },
    };
  },
};
