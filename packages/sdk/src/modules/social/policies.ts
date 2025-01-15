import { constants } from "starknet";
import { configs } from "../../configs";
import { NAMESPACE } from "../../constants";
import { getContractByName } from "../../provider/helpers";
import { Pin } from "./pin";
import { Follow } from "./follow";
import { Member } from "./member";
import { Guild } from "./guild";
import { Alliance } from "./alliance";

const CONTRACT_NAME = "Social";
const CONTRACT_TAG = `${NAMESPACE}-${CONTRACT_NAME}`;
const CONTRACT_DESCRIPTION = "Social contract to manage your social activities";

export type SocialOptions = {
  pin?: boolean;
  follow?: boolean;
  member?: boolean;
  guild?: boolean;
  alliance?: boolean;
};

export const getSocialPolicies = (
  chainId: constants.StarknetChainId,
  options: SocialOptions = { pin: true, follow: true, member: true, guild: true, alliance: true },
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
