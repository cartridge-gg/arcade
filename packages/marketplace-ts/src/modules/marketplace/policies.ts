import type { constants } from "starknet";
import { configs } from "../../configs";
import { NAMESPACE } from "../../constants";
import { getContractByName } from "@dojoengine/core";
import { Moderator } from "./moderator";
import { Book } from "./book";
import { Order } from "./order";
import { DefaultMarketplaceOptions, type MarketplaceOptions } from "./options";

const CONTRACT_NAME = "Marketplace";
const CONTRACT_DESCRIPTION =
  "Marketplace contract to manage asset listings and offers.";

export const getMarketplacePolicies = (
  chainId: constants.StarknetChainId,
  options: MarketplaceOptions = DefaultMarketplaceOptions,
) => {
  const config = configs[chainId];
  const contract = getContractByName(config.manifest, NAMESPACE, CONTRACT_NAME);
  return {
    contracts: {
      [contract.address]: {
        name: CONTRACT_NAME,
        description: CONTRACT_DESCRIPTION,
        methods: [
          ...(options.access ? Moderator.getMethods() : []),
          ...(options.book ? Book.getMethods() : []),
          ...(options.order ? Order.getMethods() : []),
        ],
      },
    },
  };
};
