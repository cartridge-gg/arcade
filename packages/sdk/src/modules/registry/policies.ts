import { constants } from "starknet";
import { configs } from "../../configs";
import { NAMESPACE } from "../../constants";
import { getContractByName } from "../../provider/helpers";
import { Game } from "./game";
import { Achievement } from "./achievement";

const CONTRACT_NAME = "Registry";
const CONTRACT_TAG = `${NAMESPACE}-${CONTRACT_NAME}`;
const CONTRACT_DESCRIPTION = "Registry contract for games and achievements";

export type RegistryOptions = {
  game?: boolean;
  achievement?: boolean;
};

export const getRegistryPolicies = (
  chainId: constants.StarknetChainId,
  options: RegistryOptions = { game: true, achievement: true },
) => {
  const config = configs[chainId];
  const address: string = getContractByName(config.manifest, CONTRACT_TAG);
  return {
    contracts: {
      [address]: {
        name: CONTRACT_NAME,
        description: CONTRACT_DESCRIPTION,
        methods: [...(options.game ? Game.getMethods() : []), ...(options.achievement ? Achievement.getMethods() : [])],
      },
    },
  };
};
