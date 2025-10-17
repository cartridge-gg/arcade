import type { constants } from "starknet";
import { configs } from "../../configs";
import { NAMESPACE } from "../../constants";
import { getContractByName } from "../../provider/helpers";
import { Pin } from "./pin";
import { Follow } from "./follow";
import { Member } from "./member";
import { Guild } from "./guild";
import { Alliance } from "./alliance";
import { DefaultSocialOptions, type SocialOptions } from "./options";

const CONTRACT_NAME = "Social";
const CONTRACT_TAG = `${NAMESPACE}-${CONTRACT_NAME}`;
const CONTRACT_DESCRIPTION = "Social contract to manage your social activities";

export const getSocialPolicies = (
  chainId: constants.StarknetChainId,
  options: SocialOptions = DefaultSocialOptions,
) => {
  const config = configs[chainId];
  const address: string = getContractByName(config.manifest, CONTRACT_TAG);
  return {
    contracts: {
      [address]: {
        name: CONTRACT_NAME,
        description: CONTRACT_DESCRIPTION,
        methods: [
          ...(options.pin ? Pin.getMethods() : []),
          ...(options.follow ? Follow.getMethods() : []),
          ...(options.member ? Member.getMethods() : []),
          ...(options.guild ? Guild.getMethods() : []),
          ...(options.alliance ? Alliance.getMethods() : []),
        ],
      },
    },
  };
};
