import { CollectibleAsset } from "@cartridge/ui-next";
import { useCollections } from "@/hooks/collections";
import { useArcade } from "@/hooks/arcade";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EditionModel } from "@bal7hazar/arcade-sdk";
import placeholder from "@/assets/placeholder.svg";
import { useAccount } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Chain, mainnet } from "@starknet-react/chains";
import { Collection } from "@/context/collection";

export const Collections = () => {
  const { editions, chains } = useArcade();
  const { collections, status } = useCollections();

  switch (status) {
    case "loading":
    case "error": {
      return null;
    }
    default: {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 place-items-center select-none">
          {collections.map((collection) => (
            <Item
              key={collection.address}
              collection={collection}
              editions={editions}
              chains={chains}
            />
          ))}
        </div>
      );
    }
  }
};

function Item({
  collection,
  editions,
  chains,
}: {
  collection: Collection;
  editions: EditionModel[];
  chains: Chain[];
}) {
  const { connector } = useAccount();
  const [username, setUsername] = useState<string>("");

  const chain: Chain = useMemo(() => {
    const edition = editions.find(
      (edition) => edition.config.project === collection.project,
    );
    return (
      chains.find(
        (chain) => chain.rpcUrls.default.http[0] === edition?.config.rpc,
      ) || mainnet
    );
  }, [chains]);

  useEffect(() => {
    async function fetch() {
      try {
        const name = await (connector as ControllerConnector)?.username();
        if (!name) return;
        setUsername(name);
      } catch (error) {
        console.error(error);
      }
    }
    fetch();
  }, [connector]);

  const handleClick = useCallback(async () => {
    if (!username) return;
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) {
      console.error("Connector not initialized");
      return;
    }
    const path = `account/${username}/slot/${collection.project}/inventory/collection/${collection.address}?ps=${collection.project}`;
    controller.switchStarknetChain(`0x${chain.id.toString(16)}`);
    controller.openProfileAt(path);
  }, [collection.address, username, connector]);

  return (
    <div className="w-full group select-none">
      <CollectibleAsset
        title={collection.name}
        image={
          collection.imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/") ||
          placeholder
        }
        count={collection.totalCount}
        onClick={handleClick}
      />
    </div>
  );
}
