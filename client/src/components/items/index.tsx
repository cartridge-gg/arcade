import {
  Button,
  Checkbox,
  cn,
  CollectibleCard,
  Empty,
  MarketplaceSearch,
  SearchResult,
  Separator,
  Skeleton,
} from "@cartridge/ui";
import { useProject } from "@/hooks/project";
import { useBalances, useCollection } from "@/hooks/market-collections";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Token } from "@dojoengine/torii-wasm";
import { MetadataHelper } from "@/helpers/metadata";
import placeholder from "@/assets/placeholder.svg";
import { useMarketplace } from "@/hooks/marketplace";
import {
  FunctionAbi,
  getChecksumAddress,
  InterfaceAbi,
  RpcProvider,
} from "starknet";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";
import { Chain, mainnet } from "@starknet-react/chains";
import { useArcade } from "@/hooks/arcade";
import { useMarketFilters } from "@/hooks/market-filters";
import { useUsernames } from "@/hooks/account";
import { UserAvatar } from "../user/avatar";
import { OrderModel, SaleEvent } from "@cartridge/marketplace";
import { erc20Metadata } from "@cartridge/presets";
import makeBlockie from "ethereum-blockies-base64";

const DEFAULT_ROW_CAP = 6;
const ROW_HEIGHT = 218;
const ERC1155_ENTRYPOINT = "balance_of_batch";

type Asset = Token & { orders: OrderModel[]; owner: string };

const getEntrypoints = async (provider: RpcProvider, address: string) => {
  try {
    // TODO: Remove dependency on getClassAt since it is super slow
    const code = await provider.getClassAt(address);
    if (!code) return;
    const interfaces = code.abi.filter(
      (element) => element.type === "interface",
    );
    if (interfaces.length > 0) {
      return interfaces.flatMap((element: InterfaceAbi) =>
        element.items.map((item: FunctionAbi) => item.name),
      );
    }
    const functions = code.abi.filter((element) => element.type === "function");
    return functions.map((item: FunctionAbi) => item.name);
  } catch (error) {
    console.error(error);
  }
};

export function Items() {
  const {
    setAllMetadata,
    setFilteredMetadata,
    tokens,
    filteredTokens,
    selected,
    setSelected,
  } = useMarketFilters();
  const { connector } = useAccount();
  const { collection: collectionAddress, filter } = useProject();
  const { sales } = useMarketplace();
  const { collection } = useCollection(collectionAddress || "", 10000);
  const { balances } = useBalances(collectionAddress || "", 10000);
  const [search, setSearch] = useState<string>("");
  const [cap, setCap] = useState(DEFAULT_ROW_CAP);
  const [selection, setSelection] = useState<Asset[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);
  const { chains, provider } = useArcade();
  const { edition } = useProject();

  const chain: Chain = useMemo(() => {
    return (
      chains.find(
        (chain) => chain.rpcUrls.default.http[0] === edition?.config.rpc,
      ) || mainnet
    );
  }, [chains, edition]);

  const accounts = useMemo(() => {
    if (!balances || balances.length === 0) return [];
    const owners = balances
      .filter((balance) => parseInt(balance.balance, 16) > 0)
      .map((balance) => `0x${BigInt(balance.account_address).toString(16)}`);
    return Array.from(new Set(owners));
  }, [balances, collectionAddress]);

  const { usernames } = useUsernames({ addresses: accounts });

  const searchResults = useMemo(() => {
    return usernames
      .filter((item) => !!item.username)
      .map((item) => {
        const image = (
          <UserAvatar
            username={item.username || ""}
            className="h-full w-full"
          />
        );
        return {
          image,
          label: item.username,
          address: getChecksumAddress(item.address || "0x0"),
        };
      });
  }, [usernames]);

  const options = useMemo(() => {
    if (!search) return [];
    return searchResults
      .filter((item) =>
        item.label?.toLowerCase().startsWith(search.toLowerCase()),
      )
      .slice(0, 3);
  }, [searchResults, search]);

  const handleScroll = useCallback(() => {
    const parent = parentRef.current;
    if (!parent) return;
    const height = parent.clientHeight;
    const newCap = Math.ceil((height + parent.scrollTop) / ROW_HEIGHT);
    if (newCap < cap) return;
    setCap(newCap + 0);
  }, [parentRef, cap, setCap]);

  const handleReset = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const handleInspect = useCallback(
    async (token: Token & { owner: string }) => {
      if (!edition) return;
      const contractAddress = token.contract_address;
      const controller = (connector as ControllerConnector)?.controller;
      const username = await controller?.username();
      if (!controller || !username) {
        console.error("Connector not initialized");
        return;
      }

      const entrypoints = await getEntrypoints(
        provider.provider,
        contractAddress,
      );
      const isERC1155 = entrypoints?.includes(ERC1155_ENTRYPOINT);
      const subpath = isERC1155 ? "collectible" : "collection";

      const project = edition?.config.project;
      const preset = edition?.properties.preset;
      const options = [`ps=${project}`];
      if (preset) {
        options.push(`preset=${preset}`);
      } else {
        options.push("preset=cartridge");
      }
      options.push(`address=${getChecksumAddress(token.owner)}`);
      options.push("purchaseView=true");
      const path = `account/${username}/inventory/${subpath}/${contractAddress}/token/${token.token_id}${options.length > 0 ? `?${options.join("&")}` : ""}`;
      controller.switchStarknetChain(`0x${chain.id.toString(16)}`);
      controller.openProfileAt(path);
    },
    [connector, edition, chain],
  );

  const handlePurchase = useCallback(
    async (tokens: (Token & { orders: OrderModel[]; owner: string })[]) => {
      const orders = tokens.map((token) => token.orders).flat();
      const contractAddresses = new Set(
        tokens.map((token) => token.contract_address),
      );
      if (!edition || contractAddresses.size !== 1) return;
      const contractAddress = `0x${BigInt(Array.from(contractAddresses)[0]).toString(16)}`;
      const controller = (connector as ControllerConnector)?.controller;
      const username = await controller?.username();
      if (!controller || !username) {
        console.error("Connector not initialized");
        return;
      }

      const entrypoints = await getEntrypoints(
        provider.provider,
        contractAddress,
      );
      const isERC1155 = entrypoints?.includes(ERC1155_ENTRYPOINT);
      const subpath = isERC1155 ? "collectible" : "collection";

      const project = edition?.config.project;
      const preset = edition?.properties.preset;
      const options = [`ps=${project}`];
      if (preset) {
        options.push(`preset=${preset}`);
      } else {
        options.push("preset=cartridge");
      }
      let path;
      if (orders.length > 1) {
        options.push(`orders=${orders.map((order) => order.id).join(",")}`);
        path = `account/${username}/inventory/${subpath}/${contractAddress}/purchase${options.length > 0 ? `?${options.join("&")}` : ""}`;
      } else {
        const token = tokens[0];
        options.push(`address=${getChecksumAddress(token.owner)}`);
        options.push("purchaseView=true");
        options.push(`tokenIds=${[token.token_id].join(",")}`);
        path = `account/${username}/inventory/${subpath}/${contractAddress}/token/${token.token_id}${options.length > 0 ? `?${options.join("&")}` : ""}`;
      }
      controller.switchStarknetChain(`0x${chain.id.toString(16)}`);
      controller.openProfileAt(path);
    },
    [connector, edition, chain],
  );

  useEffect(() => {
    const parent = parentRef.current;
    if (parent) {
      parent.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (parent) {
        parent.removeEventListener("scroll", handleScroll);
      }
    };
  }, [cap, parentRef, handleScroll]);

  useEffect(() => {
    // Reset scroll and cap on filter change
    const parent = parentRef.current;
    if (!parent) return;
    parent.scrollTop = 0;
    const height = parent.clientHeight;
    const cap = Math.ceil(height / ROW_HEIGHT);
    setCap(cap + 0);
  }, [parentRef, collection, setCap]);

  useEffect(() => {
    if (!tokens) return;
    setAllMetadata(MetadataHelper.extract(tokens));
  }, [tokens, setAllMetadata]);

  useEffect(() => {
    if (!filteredTokens) return;
    setFilteredMetadata(MetadataHelper.extract(filteredTokens));
  }, [filteredTokens, setFilteredMetadata]);

  useEffect(() => {
    const selection = searchResults.find(
      (option) => option.label?.toLowerCase() === filter?.toLowerCase(),
    );
    if (
      !filter ||
      !searchResults.length ||
      selected?.label === selection?.label
    )
      return;
    if (selection) {
      setSelected(selection as SearchResult);
    }
  }, [filter, searchResults, setSelected, selected]);

  if (!collection) return <EmptyState />;

  if (!tokens || tokens.length === 0) return <LoadingState />;

  if (!filteredTokens || filteredTokens.length === 0)
    return <EmptySelectionState />;

  return (
    <div className="p-6 flex flex-col gap-4 h-full w-full overflow-hidden">
      <div className="min-h-10 w-full flex justify-between items-center relative">
        <div
          className={cn(
            "h-6 p-0.5 flex items-center gap-1.5 text-foreground-200 text-xs",
            !selection.length && "text-foreground-400",
            !!selection.length && "cursor-pointer",
          )}
          onClick={handleReset}
        >
          {selection.length > 0 && (
            <Checkbox
              className="text-foreground-100"
              variant="minus-line"
              size="sm"
              checked
            />
          )}
          {selection.length > 0 ? (
            <p>{`${selection.length} / ${filteredTokens.length} Selected`}</p>
          ) : (
            <p>{`${filteredTokens.length} Items`}</p>
          )}
        </div>
        <MarketplaceSearch
          search={search}
          setSearch={setSearch}
          selected={selected}
          setSelected={(selected) => setSelected(selected as SearchResult)}
          options={options as SearchResult[]}
          variant="darkest"
          className="w-[200px] lg:w-[240px] absolute top-0 right-0 z-10"
        />
      </div>
      <div
        ref={parentRef}
        className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 select-none overflow-y-scroll h-full auto-rows-max"
        style={{ scrollbarWidth: "none" }}
      >
        {filteredTokens.slice(0, cap * 3).map((token) => (
          <Item
            key={`${token.contract_address}-${token.token_id}`}
            token={token}
            sales={sales[getChecksumAddress(token.contract_address)] || {}}
            selection={selection}
            setSelection={setSelection}
            handlePurchase={() => handlePurchase([token])}
            handleInspect={() => handleInspect(token)}
          />
        ))}
      </div>
      <Separator className="w-full h-px bg-background-200" />
      <div className="w-full flex justify-end items-center p-4">
        <Button
          variant="primary"
          onClick={() => handlePurchase(selection)}
          disabled={selection.length === 0}
        >
          {`Buy (${selection.length})`}
        </Button>
      </div>
    </div>
  );
}

function Item({
  token,
  sales,
  selection,
  setSelection,
  handlePurchase,
  handleInspect,
}: {
  token: Asset;
  sales: {
    [token: string]: {
      [sale: string]: SaleEvent;
    };
  };
  selection: Asset[];
  setSelection: (selection: Asset[]) => void;
  handlePurchase: (tokens: Asset[]) => void;
  handleInspect: (token: Token) => void;
}) {
  const { edition } = useProject();
  const [image, setImage] = useState<string>(placeholder);

  const selected = useMemo(() => {
    return selection.some((t) => t.token_id === token.token_id);
  }, [selection, token]);

  const selectable = useMemo(() => {
    if (
      selection.length === 0 ||
      selection[0].orders.length === 0 ||
      !token.orders.length
    )
      return token.orders.length > 0;
    const tokenCurrency = token.orders[0].currency;
    const selectionCurrency = selection[0].orders[0].currency;
    return tokenCurrency === selectionCurrency;
  }, [token.orders, selection]);

  const openable = useMemo(() => {
    return selection.length === 0;
  }, [selection]);

  const price = useMemo(() => {
    if (!token.orders.length || token.orders.length > 1) return null;
    const currency = token.orders[0].currency;
    const metadata = erc20Metadata.find(
      (m) =>
        getChecksumAddress(m.l2_token_address) === getChecksumAddress(currency),
    );
    const image =
      erc20Metadata.find(
        (m) => getChecksumAddress(m.l2_token_address) === currency,
      )?.logo_url || makeBlockie(currency);
    const decimals = metadata?.decimals || 0;
    const price = token.orders[0].price / 10 ** decimals;
    return { value: price.toString(), image };
  }, [token.orders]);

  const lastSale = useMemo(() => {
    if (!token.token_id) return null;
    const tokenId = parseInt(token.token_id.toString());
    const tokenSales = sales[tokenId];
    if (!tokenSales || Object.keys(tokenSales).length === 0) return null;
    const sale = Object.values(tokenSales).sort((a, b) => b.time - a.time)[0];
    const order = sale.order;
    const metadata = erc20Metadata.find(
      (m) =>
        getChecksumAddress(m.l2_token_address) ===
        getChecksumAddress(order.currency),
    );
    const image = metadata?.logo_url || makeBlockie(order.currency);
    const decimals = metadata?.decimals || 0;
    const price = order.price / 10 ** decimals;
    return { value: price.toString(), image };
  }, [token, sales]);

  useEffect(() => {
    const fetchImage = async () => {
      const toriiImage = await MetadataHelper.getToriiImage(
        edition?.config.project || "",
        token,
      );
      if (toriiImage) {
        setImage(toriiImage);
        return;
      }
      const metadataImage = await MetadataHelper.getMetadataImage(token);
      if (metadataImage) {
        setImage(metadataImage);
        return;
      }
    };
    fetchImage();
  }, [token, edition]);

  const handleSelect = useCallback(() => {
    // Toggle selection
    if (selection.some((t) => t.token_id === token.token_id)) {
      setSelection(selection.filter((t) => t.token_id !== token.token_id));
    } else {
      setSelection([...selection, token]);
    }
  }, [selection, setSelection, token]);

  return (
    <div
      className="w-full group select-none"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (selection.length > 0 && selectable) {
          e.preventDefault();
          handleSelect();
        }
      }}
    >
      <CollectibleCard
        title={
          (token.metadata as unknown as { name: string })?.name || token.name
        }
        image={image}
        listingCount={token.orders.length}
        onClick={
          selectable && openable
            ? () => handlePurchase([token])
            : openable
              ? () => handleInspect(token)
              : undefined
        }
        className={
          selectable || openable
            ? "cursor-pointer"
            : "cursor-default pointer-events-none"
        }
        onSelect={selectable ? handleSelect : undefined}
        price={price}
        lastSale={lastSale}
        selectable={selectable}
        selected={selected}
      />
    </div>
  );
}

const LoadingState = () => {
  return (
    <div className="flex flex-col gap-y-3 lg:gap-y-4 h-full p-6">
      <div className="flex justify-between items-center">
        <Skeleton className="min-h-10 w-1/5" />
        <Skeleton className="min-h-10 w-1/3" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 place-items-center select-none overflow-hidden h-full">
        {Array.from({ length: 20 }).map((_, index) => (
          <Skeleton key={index} className="min-h-[218px] w-full" />
        ))}
      </div>
    </div>
  );
};

const EmptyState = () => {
  return (
    <Empty
      title="No related collections"
      icon="inventory"
      className="h-full p-6"
    />
  );
};

const EmptySelectionState = () => {
  return (
    <Empty
      title="No results meet this criteria"
      icon="inventory"
      className="h-full p-6"
    />
  );
};
