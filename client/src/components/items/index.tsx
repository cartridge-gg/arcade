import {
  Button,
  Checkbox,
  cn,
  CollectibleCard,
  Empty,
  MarketplaceSearch,
  SearchResult,
  Separator,
} from "@cartridge/ui";
import { useProject } from "@/hooks/project";
import { useBalances } from "@/hooks/market-collections";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Token } from "@dojoengine/torii-wasm";
import { MetadataHelper } from "@/helpers/metadata";
import placeholder from "@/assets/placeholder.svg";
import { useMarketplace } from "@/hooks/marketplace";
import { getChecksumAddress } from "starknet";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";
import { Chain, mainnet } from "@starknet-react/chains";
import { useArcade } from "@/hooks/arcade";
import { useMarketFilters } from "@/hooks/market-filters";
import { useUsernames } from "@/hooks/account";
import { UserAvatar } from "../user/avatar";
import { OrderModel, SaleEvent, TokenMetadataUI, useInfiniteCollectionQuery } from "@cartridge/marketplace";
import { erc20Metadata } from "@cartridge/presets";
import makeBlockie from "ethereum-blockies-base64";
import { useParams } from "react-router-dom";
import { useFilters } from "@/context/filter";

const DEFAULT_ROW_CAP = 6;
const ROW_HEIGHT = 218;

type MarketplaceToken = Token & {
  metadata: TokenMetadataUI,
};

type Asset = MarketplaceToken & { orders: OrderModel[]; owner: string };

export function Items() {
  const {
    active: filter,
    setAllMetadata,
    setFilteredMetadata,
    isSelected,
    empty,
  } = useMarketFilters();
  const { connector } = useAccount();
  const { collection: collectionAddress } = useProject();
  const { orders, sales } = useMarketplace();

  const params = useParams();
  const { tokenIds } = useFilters();
  const {
    data: collectionData,
    fetchNextPage: getNextPage,
    hasNextPage: hasNext,
    isFetching: isLoading,
  } = useInfiniteCollectionQuery(params.collection ?? "", tokenIds, 50);
  const collection = useMemo(() => collectionData?.pages.flatMap((i: any) => i.items.map((t: any) => t)) ?? [], [collectionData]);

  const { balances } = useBalances(collectionAddress || "", 10000);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<SearchResult | undefined>();
  const [cap, setCap] = useState(DEFAULT_ROW_CAP);
  const [selection, setSelection] = useState<Asset[]>([]);
  const [username, setUsername] = useState<string>("");
  const parentRef = useRef<HTMLDivElement>(null);
  const { chains } = useArcade();
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

  const tokens: Asset[] =
    useMemo(() => {
      if (!collection || !collectionAddress) return [];
      const collectionOrders = orders[getChecksumAddress(collectionAddress)];
      return collection
        .map((token) => {
          const balance = balances.find(
            (balance) => balance.token_id === token.token_id,
          );
          if (!collectionOrders || Object.keys(collectionOrders).length === 0)
            return {
              ...token,
              orders: [],
              owner: balance?.account_address || "0x0",
            };
          const tokenOrders =
            collectionOrders[Number(token.token_id).toString()];
          if (!tokenOrders || Object.keys(tokenOrders).length === 0)
            return {
              ...token,
              orders: [],
              owner: balance?.account_address || "0x0",
            };
          const order = Object.values(tokenOrders)[0];
          return {
            ...token,
            orders: Object.values(tokenOrders)
              .map((order) => order)
              .slice(0, 1),
            owner: order.owner,
          };
        })
        .sort((a, b) => b.orders.length - a.orders.length);
    }, [collection, balances, orders, filter]);


  const filteredTokens = useMemo(() => {
    const account = usernames.find(
      (item) => item.username === selected?.label,
    )?.address;
    const tokenIds = balances
      .filter(
        (balance) =>
          getChecksumAddress(balance.account_address) ===
          getChecksumAddress(account || "0x0"),
      )
      .map((balance) => balance.token_id);
    return tokens.filter((token) => {
      const attributes =
        (
          token.metadata as unknown as {
            attributes: { trait_type: string; value: string }[];
          }
        ).attributes || [];
      return (
        (token.orders.length > 0 || filter === 1) &&
        (empty || isSelected(attributes)) &&
        (!account || tokenIds.includes(token.token_id))
      );
    });
  }, [tokens, filter, isSelected, empty, selected, balances]);

  const handleScroll = useCallback(() => {
    const parent = parentRef.current;
    if (!parent) return;
    const height = parent.clientHeight;
    const newCap = Math.ceil((height + parent.scrollTop) / ROW_HEIGHT);
    if (newCap < cap) return;
    setCap(newCap + 0);

    const isNearBottom = parent.scrollHeight - parent.scrollTop - parent.clientHeight;
    if (isNearBottom < 300 && hasNext && !isLoading) {
      getNextPage();
    }
  }, [parentRef, cap, setCap, hasNext, getNextPage]);

  const handleReset = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const handlePurchase = useCallback(
    async (tokens: (Token & { orders: OrderModel[]; owner: string })[]) => {
      const orders = tokens.map((token) => token.orders).flat();
      const contractAddresses = new Set(
        tokens.map((token) => token.contract_address),
      );
      if (!username || !edition || contractAddresses.size !== 1) return;
      const contractAddress = `0x${BigInt(Array.from(contractAddresses)[0]).toString(16)}`;
      const controller = (connector as ControllerConnector)?.controller;
      if (!controller) {
        console.error("Connector not initialized");
        return;
      }
      const project = edition?.config.project;
      const preset = edition?.properties.preset;
      const options = [`ps=${project}`, "closable=true"];
      if (preset) {
        options.push(`preset=${preset}`);
      } else {
        options.push("preset=cartridge");
      }
      let path;
      if (orders.length > 1) {
        options.push(`orders=${orders.map((order) => order.id).join(",")}`);
        path = `account/${username}/slot/${project}/inventory/collection/${contractAddress}/purchase${options.length > 0 ? `?${options.join("&")}` : ""}`;
      } else {
        const token = tokens[0];
        options.push(`address=${getChecksumAddress(token.owner)}`);
        options.push(`tokenIds=${[token.token_id].join(",")}`);
        path = `account/${username}/slot/${project}/inventory/collection/${contractAddress}/token/${token.token_id}${options.length > 0 ? `?${options.join("&")}` : ""}`;
      }
      controller.switchStarknetChain(`0x${chain.id.toString(16)}`);
      controller.openProfileAt(path);
    },
    [username, connector, edition, chain],
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

  useEffect(() => {
    if (!tokens) return;
    setAllMetadata(MetadataHelper.extract(tokens));
  }, [tokens, setAllMetadata]);

  useEffect(() => {
    if (!filteredTokens) return;
    setFilteredMetadata(MetadataHelper.extract(filteredTokens));
  }, [filteredTokens, setFilteredMetadata]);

  if (!collection) return <EmptyState />;

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
          setSelected={setSelected}
          options={options as SearchResult[]}
          variant="darkest"
          className="w-[200px] lg:w-[240px] absolute top-0 right-0 z-10"
        />
      </div>
      <div
        ref={parentRef}
        className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 select-none overflow-y-scroll h-full"
        style={{
          scrollbarWidth: "none"
        }}
      >
        {filteredTokens.map(token => {
          return (
            <Item
              key={`${token.contract_address}-${token.token_id}`}
              token={token}
              sales={sales[getChecksumAddress(token.contract_address)] || {}}
              selection={selection}
              setSelection={setSelection}
              handlePurchase={() => handlePurchase([token])}
            />

          );
        })}
      </div>
      <Separator className="w-full h-px bg-background-200" />
      <div className="w-full flex justify-end items-center p-4">
        <Button variant="primary" onClick={() => handlePurchase(selection)}>
          {selection.length > 0 ? `Buy (${selection.length})` : "Buy Floor"}
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
}) {
  const { edition } = useProject();
  const [image, setImage] = useState<string>(placeholder);

  const selected = useMemo(() => {
    return selection.some((t) => t.token_id === token.token_id);
  }, [selection, token]);

  const selectable = useMemo(() => {
    return token.orders.length > 0;
  }, [token.orders]);

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
      const imageURL = MetadataHelper.getMetadataImageURL(token);
      if (imageURL !== "") {
        setImage(imageURL);
        return;
      }

      const toriiImage = await MetadataHelper.getToriiImage(
        edition?.config.project || "",
        token,
      );
      if (toriiImage) {
        setImage(toriiImage);
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
          selection.length === 0 ? () => handlePurchase([token]) : undefined
        }
        onSelect={handleSelect}
        price={price}
        lastSale={lastSale}
        className="cursor-pointer"
        selectable={selectable}
        selected={selected}
      />
    </div>
  );
}

const EmptyState = () => {
  return (
    <Empty
      title="No related collections"
      icon="inventory"
      className="h-full py-3 lg:py-6"
    />
  );
};
