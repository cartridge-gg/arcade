import { constants } from "starknet";
import {
  createMarketplaceClient,
  type CollectionListingsOptions,
} from "../src/marketplace";

async function main() {
  const client = await createMarketplaceClient({
    chainId: constants.StarknetChainId.SN_MAIN,
    defaultProject: "arcade-main",
  });

  const collection = await client.getCollection({
    projectId: "arcade-main",
    address:
      "0x04f51290f2b0e16524084c27890711c7a955eb276cffec185d6f24f2a620b15f",
  });

  console.log("Collection summary", collection);

  const { page } = await client.listCollectionTokens({
    address:
      "0x04f51290f2b0e16524084c27890711c7a955eb276cffec185d6f24f2a620b15f",
    limit: 25,
    attributeFilters: {
      rarity: new Set(["legendary", "mythic"]),
    },
  });

  const tokenCount = page?.tokens.length ?? 0;
  console.log(`Fetched ${tokenCount} tokens`);

  const listingOptions: CollectionListingsOptions = {
    collection:
      "0x04f51290f2b0e16524084c27890711c7a955eb276cffec185d6f24f2a620b15f",
  };

  const listings = await client.listCollectionListings(listingOptions);
  console.log(`Active listings: ${listings.length}`);
}

main().catch((error) => {
  console.error("Example failed", error);
  process.exitCode = 1;
});
