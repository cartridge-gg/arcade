import { CollectibleAsset, Skeleton } from "@cartridge/ui-next";
import { useArcade } from "@/hooks/arcade";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EditionModel } from "@bal7hazar/arcade-sdk";
import placeholder from "@/assets/placeholder.svg";
import { useAccount } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Chain, mainnet } from "@starknet-react/chains";
import { Collection, CollectionType } from "@/context/collection";
import { useAddress } from "@/hooks/address";

interface CollectionsProps {
  collections: Collection[];
  status: "loading" | "error" | "idle" | "success";
}

export const Collections = ({ collections, status }: CollectionsProps) => {
  const { editions, chains } = useArcade();

  switch (status) {
    case "loading": {
      return <LoadingState />;
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
  const { isSelf } = useAddress();
  const { connector } = useAccount();
  const [username, setUsername] = useState<string>("");

  const edition = useMemo(() => {
    return editions.find(
      (edition) => edition.config.project === collection.project,
    );
  }, [editions, collection]);

  const chain: Chain = useMemo(() => {
    return (
      chains.find(
        (chain) => chain.rpcUrls.default.http[0] === edition?.config.rpc,
      ) || mainnet
    );
  }, [chains, edition]);

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
    let subpath;
    switch (collection.type) {
      case CollectionType.ERC721:
        subpath = "collection";
        break;
      case CollectionType.ERC1155:
        subpath = "collectible";
        break;
      default:
        console.error("Unknown collection type");
        return;
    }
    if (!subpath) return;
    const preset = edition?.properties.preset;
    let options = [`ps=${collection.project}`, "closable=true"];
    if (preset) {
      options.push(`preset=${preset}`);
    } else {
      options.push("preset=cartridge");
    }
    const path = `account/${username}/slot/${collection.project}/inventory/${subpath}/${collection.address}${options.length > 0 ? `?${options.join("&")}` : ""}`;
    controller.switchStarknetChain(`0x${chain.id.toString(16)}`);
    controller.openProfileAt(path);
  }, [collection.address, username, connector, collection.type, edition]);

  return (
    <div className="w-full group select-none">
      <CollectibleAsset
        title={collection.name}
        image={
          collection.imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/") ||
          placeholder
        }
        count={collection.totalCount}
        onClick={isSelf ? handleClick : undefined}
        className={
          isSelf ? "cursor-pointer" : "cursor-default pointer-events-none"
        }
      />
    </div>
  );
}

const LoadingState = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 place-items-center select-none">
      <Skeleton className="w-full h-[164px] rounded" />
      <Skeleton className="w-full h-[164px] rounded" />
      <Skeleton className="hidden lg:block w-full h-[164px] rounded" />
    </div>
  );
};
