import { useEffect, useMemo, useCallback, useState } from "react";
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import {
  ArcadeProvider as ExternalProvider,
  Marketplace,
  Registry,
  Social,
  BookModel,
  OrderModel,
  ListingEvent,
  SaleEvent,
  type MarketplaceModel,
  type MarketplaceOptions,
  CategoryType,
  StatusType,
} from "@cartridge/arcade";
import { constants, getChecksumAddress, RpcProvider, shortString } from "starknet";
import type { Chain } from "@starknet-react/chains";
import {
  bookAtom,
  ordersAtom,
  listingsAtom,
  salesAtom,
  editionsAtom,
} from "@/effect/atoms";
import { unwrapOr } from "@/effect/utils/result";

const CHAIN_ID = constants.StarknetChainId.SN_MAIN;

let initPromise: Promise<void> | null = null;
let isInitialized = false;

export const useArcadeInit = () => {
  const [initialized, setInitialized] = useState(isInitialized);
  const [chains, setChains] = useState<Chain[]>([]);

  const editionsResult = useAtomValue(editionsAtom);
  const editions = unwrapOr(editionsResult, []);

  const setBook = useAtomSet(bookAtom);
  const setOrders = useAtomSet(ordersAtom);
  const setListings = useAtomSet(listingsAtom);
  const setSales = useAtomSet(salesAtom);

  const provider = useMemo(() => new ExternalProvider(CHAIN_ID), []);

  const addOrder = useCallback(
    (order: OrderModel) => {
      const collection = getChecksumAddress(order.collection);
      const token = order.tokenId.toString();
      setOrders((prev) => ({
        ...prev,
        [collection]: {
          ...(prev[collection] || {}),
          [token]: {
            ...(prev[collection]?.[token] || {}),
            [order.id]: order,
          },
        },
      }));
    },
    [setOrders],
  );

  const removeOrder = useCallback(
    (order: OrderModel) => {
      const collection = getChecksumAddress(order.collection);
      const token = order.tokenId.toString();
      setOrders((prev) => {
        const newOrders = { ...prev };
        if (newOrders[collection]?.[token]?.[order.id]) {
          delete newOrders[collection][token][order.id];
        }
        return newOrders;
      });
    },
    [setOrders],
  );

  const handleMarketplaceEntities = useCallback(
    (entities: MarketplaceModel[]) => {
      const now = Date.now();
      entities.forEach((entity: MarketplaceModel) => {
        if (BookModel.isType(entity as BookModel)) {
          const book = entity as BookModel;
          if (book.version === 0) return;
          setBook(book);
        } else if (OrderModel.isType(entity as OrderModel)) {
          const order = entity as OrderModel;
          if (order.expiration * 1000 < now) return;
          if (order.category.value !== CategoryType.Sell) return;
          if (order.status.value === StatusType.Placed) {
            addOrder(order);
          } else {
            removeOrder(order);
          }
        } else if (SaleEvent.isType(entity as SaleEvent)) {
          const sale = entity as SaleEvent;
          const order = sale.order;
          const collection = getChecksumAddress(order.collection);
          const token = order.tokenId.toString();
          setSales((prev) => ({
            ...prev,
            [collection]: {
              ...(prev[collection] || {}),
              [token]: {
                ...(prev[collection]?.[token] || {}),
                [order.id]: sale,
              },
            },
          }));
        } else if (ListingEvent.isType(entity as ListingEvent)) {
          const listing = entity as ListingEvent;
          const order = listing.order;
          const collection = getChecksumAddress(order.collection);
          const token = order.tokenId.toString();
          setListings((prev) => ({
            ...prev,
            [collection]: {
              ...(prev[collection] || {}),
              [token]: {
                ...(prev[collection]?.[token] || {}),
                [order.id]: listing,
              },
            },
          }));
        }
      });
    },
    [addOrder, removeOrder, setBook, setListings, setSales],
  );

  useEffect(() => {
    if (initialized) return;
    if (initPromise) {
      initPromise.then(() => setInitialized(true));
      return;
    }
    initPromise = (async () => {
      await Social.init(CHAIN_ID);
      await Registry.init(CHAIN_ID);
      await Marketplace.init(CHAIN_ID);
      isInitialized = true;
    })();
    initPromise.then(() => setInitialized(true));
  }, [initialized]);

  useEffect(() => {
    if (!initialized) return;
    const options: MarketplaceOptions = {
      book: true,
      order: true,
      sale: true,
      listing: true,
    };
    Marketplace.fetch(handleMarketplaceEntities, options);
    Marketplace.sub(handleMarketplaceEntities, options);
    return () => {
      Marketplace.unsub();
    };
  }, [initialized, handleMarketplaceEntities]);

  useEffect(() => {
    async function getChains() {
      const chainList: Chain[] = await Promise.all(
        editions.map(async (edition) => {
          const rpcProvider = new RpcProvider({ nodeUrl: edition.config.rpc });
          let id = "0x0";
          try {
            id = await rpcProvider.getChainId();
          } catch {
            // Skip
          }
          return {
            id: BigInt(id),
            name: shortString.decodeShortString(id),
            network: id,
            rpcUrls: {
              default: { http: [edition.config.rpc] },
              public: { http: [edition.config.rpc] },
            },
            nativeCurrency: {
              address: "0x0",
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            paymasterRpcUrls: {
              avnu: {
                http: ["http://localhost:5050"],
              },
            },
          };
        }),
      );
      const uniques = chainList.filter(
        (chain, index) =>
          chain.id !== 0n &&
          index === chainList.findIndex((t) => t.id === chain.id),
      );
      setChains(uniques);
    }
    if (editions.length > 0) {
      getChains();
    }
  }, [editions]);

  return {
    chainId: CHAIN_ID,
    provider,
    chains,
    initialized,
    addOrder,
    removeOrder,
  };
};
