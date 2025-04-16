import { CollectibleAsset } from "@cartridge/ui-next";
import { useCollections } from "@/hooks/collections";
import { useArcade } from "@/hooks/arcade";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GameModel } from "@bal7hazar/arcade-sdk";
import placeholder from "@/assets/placeholder.svg";
import { useAccount } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Chain, mainnet } from "@starknet-react/chains";
import { Collection } from "@/context/collection";

export const Collections = () => {
  const { games, chains } = useArcade();
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
              games={games}
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
  games,
  chains,
}: {
  collection: Collection;
  games: GameModel[];
  chains: Chain[];
}) {
  const { connector } = useAccount();
  const [username, setUsername] = useState<string>("");

  const game = useMemo(() => {
    return games.find((game) =>
      collection.imageUrl.includes(game.config.project),
    );
  }, [games, collection]);

  const chain: Chain = useMemo(() => {
    return (
      chains.find(
        (chain) => chain.rpcUrls.default.http[0] === game?.config.rpc,
      ) || mainnet
    );
  }, [chains, game]);

  const slot = useMemo(() => {
    return game?.config.project;
  }, [game]);

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
    if (!username || !slot) return;
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) {
      console.error("Connector not initialized");
      return;
    }
    const path = `account/${username}/slot/${slot}/inventory/collection/${collection.address}?ps=${slot}`;
    controller.switchStarknetChain(`0x${chain.id.toString(16)}`);
    controller.openProfileAt(path);
  }, [collection.address, username, connector]);

  return (
    <div className="w-full group select-none">
      <CollectibleAsset
        title={collection.name}
        image={collection.imageUrl || placeholder}
        count={collection.totalCount}
        onClick={handleClick}
      />
    </div>
  );
}
