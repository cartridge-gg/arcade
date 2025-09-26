import {
  Button,
  Checkbox,
  cn,
  CollectibleCard,
  Empty,
  MarketplaceSearch,
  Separator,
  Skeleton,
} from "@cartridge/ui";
import { useCallback, useMemo, useRef, useState } from "react";
import { Token } from "@dojoengine/torii-wasm";
import { useMarketplace } from "@/hooks/marketplace";
import {
  FunctionAbi,
  getChecksumAddress,
  InterfaceAbi,
  RpcProvider,
} from "starknet";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect } from "@starknet-react/core";
import { useArcade } from "@/hooks/arcade";
import { OrderModel, SaleEvent } from "@cartridge/arcade";
import { erc20Metadata } from "@cartridge/presets";
import makeBlockie from "ethereum-blockies-base64";
import { useMarketTokensFetcher } from "@/hooks/marketplace-tokens-fetcher";
import { useMetadataFiltersAdapter } from "@/hooks/use-metadata-filters-adapter";
import { useVirtualizer } from "@tanstack/react-virtual";
import { FloatingLoadingSpinner } from "@/components/ui/floating-loading-spinner";
import { DEFAULT_PRESET, DEFAULT_PROJECT } from "@/constants";

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

export function Items({
  collectionAddress,
}: {
  collectionAddress: string;
}) {
  const { connector, address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { sales, getCollectionOrders } = useMarketplace();
  const [search, setSearch] = useState<string>("");
  const [selection, setSelection] = useState<Asset[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);
  const { provider } = useArcade();

  // Use the adapter hook which includes Buy Now/Show All functionality
  const {
    tokens,
    filteredTokens,
    activeFilters,
    resetSelected: clearAllFilters,
  } = useMetadataFiltersAdapter();

  // Get marketplace orders for this collection
  const collectionOrders = useMemo(() => {
    return getCollectionOrders(collectionAddress);
  }, [getCollectionOrders, collectionAddress]);

  // Get collection info
  const { collection, status, loadingProgress } = useMarketTokensFetcher({
    project: [DEFAULT_PROJECT],
    address: collectionAddress,
  });

  // Apply search filtering on top of metadata filters
  const searchFilteredTokens = useMemo(() => {
    if (!search.trim()) return filteredTokens;

    const searchLower = search.toLowerCase();

    return filteredTokens.filter((token) => {
      const tokenName = (token.metadata as any)?.name || token.name || "";
      return tokenName.toLowerCase().includes(searchLower);
    });
  }, [filteredTokens, search]);

  const connectWallet = useCallback(async () => {
    connect({ connector: connectors[0] });
  }, [connect, connectors]);

  const handleReset = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const handleInspect = useCallback(
    async (token: Token & { owner: string }) => {
      if (!isConnected || !connector) return;
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

      const project = DEFAULT_PROJECT;
      const preset = DEFAULT_PRESET;
      const options = [`ps=${project}`];
      if (preset) {
        options.push(`preset=${preset}`);
      } else {
        options.push("preset=cartridge");
      }
      options.push(`address=${getChecksumAddress(token.owner)}`);
      options.push("purchaseView=true");
      const path = `account/${username}/inventory/${subpath}/${contractAddress}/token/${token.token_id}${options.length > 0 ? `?${options.join("&")}` : ""}`;
      controller.openProfileAt(path);
    },
    [connector, provider.provider],
  );

  const handlePurchase = useCallback(
    async (tokens: (Token & { orders: OrderModel[]; owner: string })[]) => {
      if (!isConnected || !connector) return;
      const orders = tokens.map((token) => token.orders).flat();
      const contractAddresses = new Set(
        tokens.map((token) => token.contract_address),
      );
      if (contractAddresses.size !== 1) return;
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

      const project = DEFAULT_PROJECT;
      const preset = DEFAULT_PRESET;
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
      controller.openProfileAt(path);
    },
    [connector, provider.provider],
  );

  // Set up virtualizer for rows
  const virtualizer = useVirtualizer({
    count: searchFilteredTokens.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT + 16, // ROW_HEIGHT + gap
    overscan: 2,
  });

  if (!collection && tokens.length === 0) return <EmptyState />;

  if (!tokens || tokens.length === 0) return <LoadingState />;

  return (
    <div className="p-6 flex flex-col gap-4 h-full w-full overflow-hidden">
      <div className="min-h-10 w-full flex justify-between items-center relative">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "h-6 p-0.5 flex items-center gap-1.5 text-foreground-200 text-xs",
              !selection.length && "text-foreground-400",
              isConnected && !!selection.length && "cursor-pointer",
            )}
            onClick={isConnected ? handleReset : undefined}
          >
            {isConnected && selection.length > 0 && (
              <Checkbox
                className="text-foreground-100"
                variant="minus-line"
                size="sm"
                checked
              />
            )}
            {isConnected && selection.length > 0 ? (
              <p>{`${selection.length} / ${searchFilteredTokens.length} Selected`}</p>
            ) : (
              <>
                <p>{`${searchFilteredTokens.length} ${tokens && searchFilteredTokens.length < tokens.length ? `of ${tokens.length}` : ""} Items`}</p>
                {Object.keys(activeFilters).length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="ml-2 text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        <MarketplaceSearch
          search={search}
          setSearch={setSearch}
          selected={undefined}
          setSelected={() => {}}
          options={[]}
          variant="darkest"
          className="w-[200px] lg:w-[240px] absolute top-0 right-0 z-10"
        />
      </div>
      <div
        ref={parentRef}
        className="overflow-y-auto h-full"
        style={{ scrollbarWidth: "none" }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * 4;
            const endIndex = Math.min(
              startIndex + 4,
              searchFilteredTokens.length,
            );
            const rowTokens = searchFilteredTokens.slice(startIndex, endIndex);

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {rowTokens.map((token) => {
                    // Get orders for this specific token
                    const tokenId = token.token_id?.toString();
                    const tokenOrders = tokenId
                      ? collectionOrders?.[tokenId] || []
                      : [];
                    const assetToken = {
                      ...token,
                      orders: tokenOrders,
                      owner: address || "",
                    } as Asset;
                    return (
                      <Item
                        key={`${token.contract_address}-${token.token_id}`}
                        isConnected={isConnected}
                        connect={connectWallet}
                        token={assetToken}
                        sales={
                          sales[getChecksumAddress(token.contract_address)] ||
                          {}
                        }
                        selection={selection}
                        setSelection={setSelection}
                        handlePurchase={() => handlePurchase([assetToken])}
                        handleInspect={() => handleInspect(assetToken)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          isConnected && selection.length > 0
            ? " max-h-36 opacity-100"
            : "max-h-0 opacity-0",
        )}
      >
        <Separator className="w-full bg-background-200" />
        <div className="w-full flex justify-end items-center">
          <Button
            variant="primary"
            onClick={() => handlePurchase(selection)}
            disabled={selection.length === 0}
          >
            {`Buy (${selection.length})`}
          </Button>
        </div>
      </div>
      <FloatingLoadingSpinner
        isLoading={status === "loading" && tokens && tokens.length > 0}
        loadingProgress={loadingProgress}
      />
    </div>
  );
}

function Item({
  token,
  sales,
  selection,
  connect,
  setSelection,
  handlePurchase,
  handleInspect,
  isConnected,
}: {
  token: Asset;
  sales: {
    [token: string]: {
      [sale: string]: SaleEvent;
    };
  };
  selection: Asset[];
  connect: () => void;
  setSelection: (selection: Asset[]) => void;
  handlePurchase: (tokens: Asset[]) => void;
  handleInspect: (token: Token) => void;
  isConnected?: boolean;
}) {
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
        if (isConnected && selection.length > 0 && selectable) {
          e.preventDefault();
          handleSelect();
        }
      }}
    >
      <CollectibleCard
        title={
          (token.metadata as unknown as { name: string })?.name || token.name
        }
        // @ts-expect-error TODO: Fix this type to include image in metadata
        image={token.image ?? collection.image}
        listingCount={token.orders.length}
        onClick={
          selectable && openable && isConnected
            ? () => handlePurchase([token])
            : openable && isConnected
              ? () => handleInspect(token)
              : !isConnected
                ? () => connect()
                : undefined
        }
        className={
          selectable || openable
            ? "cursor-pointer"
            : "cursor-default pointer-events-none"
        }
        onSelect={isConnected && selectable ? handleSelect : undefined}
        price={price}
        lastSale={lastSale}
        selectable={isConnected && selectable}
        selected={isConnected && selected}
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 place-items-center select-none overflow-hidden h-full">
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
