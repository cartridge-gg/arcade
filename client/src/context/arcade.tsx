import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArcadeProvider as ExternalProvider,
  Marketplace,
  Registry,
  Social,
  PinEvent,
  AccessModel,
  GameModel,
  type RegistryModel,
  type SocialModel,
  type SocialOptions,
  type RegistryOptions,
  FollowEvent,
  EditionModel,
  BookModel,
  OrderModel,
  ListingEvent,
  SaleEvent,
  type MarketplaceModel,
  CategoryType,
  StatusType,
  type MarketplaceOptions,
  CollectionEditionModel,
} from "@cartridge/arcade";
import {
  constants,
  getChecksumAddress,
  RpcProvider,
  shortString,
} from "starknet";
import type { Chain } from "@starknet-react/chains";
import type * as torii from "@dojoengine/torii-wasm";

const CHAIN_ID = constants.StarknetChainId.SN_MAIN;
const IGNORES = [
  "populariumdemo-game",
  "dragark-mainnet-v11-6",
  "evolute-duel-arcade",
  "zkube-budo-mainnet",
  "budokan-mainnet-2",
  "ponziland-tourney-2-2",
  "jokersofneon",
];

export interface ProjectProps {
  namespace: string;
  project: string;
}

/**
 * Interface defining the shape of the Arcade context.
 */
interface ArcadeContextType {
  /** The Arcade client instance */
  chainId: string;
  provider: ExternalProvider;
  pins: { [playerId: string]: string[] };
  follows: { [playerId: string]: string[] };
  accesses: AccessModel[];
  games: GameModel[];
  editions: EditionModel[];
  collectionEditions: { [collection: string]: number[] };
  chains: Chain[];
  player: string | undefined;
  clients: { [key: string]: torii.ToriiClient };
  book: BookModel | null;
  orders: {
    [collection: string]: { [token: string]: { [order: string]: OrderModel } };
  };
  listings: {
    [collection: string]: {
      [token: string]: { [listing: string]: ListingEvent };
    };
  };
  sales: {
    [collection: string]: { [token: string]: { [sale: string]: SaleEvent } };
  };
  addOrder: (order: OrderModel) => void;
  removeOrder: (order: OrderModel) => void;
  setPlayer: React.Dispatch<React.SetStateAction<string | undefined>>;
}

/**
 * React context for sharing Arcade-related data throughout the application.
 */
export const ArcadeContext = createContext<ArcadeContextType | null>(null);

/**
 * Provider component that makes Arcade context available to child components.
 *
 * @param props.children - Child components that will have access to the Arcade context
 * @throws {Error} If ArcadeProvider is used more than once in the component tree
 */
export const ArcadeProvider = ({ children }: { children: ReactNode }) => {
  const [book, setBook] = useState<BookModel | null>(null);
  const [orders, setOrders] = useState<{
    [collection: string]: { [token: string]: { [order: string]: OrderModel } };
  }>({});
  const [listings, setListings] = useState<{
    [collection: string]: {
      [token: string]: { [listing: string]: ListingEvent };
    };
  }>({});
  const [sales, setSales] = useState<{
    [collection: string]: { [token: string]: { [sale: string]: SaleEvent } };
  }>({});
  const [player, setPlayer] = useState<string | undefined>();
  const currentValue = useContext(ArcadeContext);
  const [pins, setPins] = useState<{ [playerId: string]: string[] }>({});
  const [follows, setFollows] = useState<{ [playerId: string]: string[] }>({});
  const [accesses, setAccesses] = useState<{ [gameId: string]: AccessModel }>(
    {},
  );
  const [games, setGames] = useState<{ [gameId: string]: GameModel }>({});
  const [editions, setEditions] = useState<{
    [editionId: string]: EditionModel;
  }>({});
  const [collectionEditions, setCollectionEditions] = useState<{
    [collectionEditionId: string]: CollectionEditionModel;
  }>({});
  const [chains, setChains] = useState<Chain[]>([]);
  const [clients, setClients] = useState<{ [key: string]: torii.ToriiClient }>(
    {},
  );
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    async function getChains() {
      const chains: Chain[] = await Promise.all(
        Object.values(editions).map(async (edition) => {
          const provider = new RpcProvider({ nodeUrl: edition.config.rpc });
          let id = "0x0";
          try {
            id = await provider.getChainId();
          } catch (e) {
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
      // Deduplicate chains
      const uniques = chains.filter(
        (chain, index) =>
          chain.id !== 0n &&
          index === chains.findIndex((t) => t.id === chain.id),
      );
      setChains(uniques);
    }
    getChains();
  }, [editions]);

  if (currentValue) {
    throw new Error("ArcadeProvider can only be used once");
  }

  const provider = useMemo(
    // TODO: Update here to select either Mainnet or Sepolia
    () => new ExternalProvider(CHAIN_ID),
    [],
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

  const handlePinEvent = useCallback((event: PinEvent) => {
    const playerId = getChecksumAddress(event.playerId);
    if (event.time === 0) {
      // Remove the achievement from the player's list
      setPins((prevPins) => {
        const achievementIds = prevPins[playerId] || [];
        return {
          ...prevPins,
          [playerId]: achievementIds.filter(
            (id: string) => id !== event.achievementId,
          ),
        };
      });
    } else {
      // Otherwise, add the achievement to the player's list
      setPins((prevPins) => {
        const achievementIds = prevPins[playerId] || [];
        return {
          ...prevPins,
          [playerId]: [...new Set([...achievementIds, event.achievementId])],
        };
      });
    }
  }, []);

  const handleFollowEvent = useCallback((event: FollowEvent) => {
    const follower = getChecksumAddress(event.follower);
    const followed = getChecksumAddress(event.followed);
    if (event.time === 0) {
      // Remove the follow
      setFollows((prevFollows) => {
        const followeds = prevFollows[follower] || [];
        return {
          ...prevFollows,
          [follower]: followeds.filter((id: string) => id !== followed),
        };
      });
    } else {
      // Otherwise, add the follow
      setFollows((prevFollows) => {
        const followeds = prevFollows[follower] || [];
        return {
          ...prevFollows,
          [follower]: [...new Set([...followeds, followed])],
        };
      });
    }
  }, []);

  const handleSocialEvents = useCallback(
    (models: SocialModel[]) => {
      models.forEach((model: SocialModel) => {
        // Return if the model is not a PinEvent
        if (PinEvent.isType(model as PinEvent))
          return handlePinEvent(model as PinEvent);
        if (FollowEvent.isType(model as FollowEvent))
          return handleFollowEvent(model as FollowEvent);
      });
    },
    [handlePinEvent, handleFollowEvent],
  );

  const handleRegistryModels = useCallback((models: RegistryModel[]) => {
    models.forEach(async (model: RegistryModel) => {
      if (AccessModel.isType(model as AccessModel)) {
        const access = model as AccessModel;
        if (!access.exists()) {
          setAccesses((prevAccesses) => {
            const newAccesses = { ...prevAccesses };
            delete newAccesses[access.identifier];
            return newAccesses;
          });
          return;
        }
        setAccesses((prevAccesses) => ({
          ...prevAccesses,
          [access.identifier]: access,
        }));
      } else if (GameModel.isType(model as GameModel)) {
        const game = model as GameModel;
        if (!game.exists()) {
          setGames((prevGames) => {
            const newGames = { ...prevGames };
            delete newGames[game.identifier];
            return newGames;
          });
          return;
        }
        setGames((prevGames) => ({
          ...prevGames,
          [game.identifier]: game,
        }));
      } else if (EditionModel.isType(model as EditionModel)) {
        const edition = model as EditionModel;
        if (!edition.exists()) {
          setEditions((prevEditions) => {
            const newEditions = { ...prevEditions };
            delete newEditions[edition.identifier];
            return newEditions;
          });
          return;
        }
        setEditions((prevEditions) => ({
          ...prevEditions,
          [edition.identifier]: edition,
        }));
      } else if (
        CollectionEditionModel.isType(model as CollectionEditionModel)
      ) {
        const collectionEdition = model as CollectionEditionModel;
        if (collectionEdition.exists()) {
          setCollectionEditions((prevCollectionEditions) => ({
            ...prevCollectionEditions,
            [collectionEdition.identifier]: collectionEdition,
          }));
        }
      }
    });
  }, []);

  useEffect(() => {
    if (initialized) return;
    const initialize = async () => {
      await Social.init(CHAIN_ID);
      await Registry.init(CHAIN_ID);
      await Marketplace.init(CHAIN_ID);
      setInitialized(true);
    };
    initialize();
  }, [initialized, setInitialized]);

  useEffect(() => {
    if (!initialized) return;
    const options: SocialOptions = { pin: true, follow: true };
    Social.fetch(handleSocialEvents, options);
    Social.sub(handleSocialEvents, options);
    return () => {
      Social.unsub();
    };
  }, [initialized, handleSocialEvents]);

  useEffect(() => {
    if (!initialized) return;
    const options: RegistryOptions = {
      access: true,
      game: true,
      edition: true,
      collectionEdition: true,
    };
    Registry.fetch(handleRegistryModels, options);
    Registry.sub(handleRegistryModels, options);
    return () => {
      Registry.unsub();
    };
  }, [initialized, handleRegistryModels]);

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
    const getClients = async () => {
      const clients: { [key: string]: torii.ToriiClient } = {};
      await Promise.all(
        Object.values(editions).map(async (edition) => {
          // FIXME: some old torii version not compatible with the dojo.js version
          if (IGNORES.includes(edition.config.project)) return;
          // Fetch the torii client to ensure it exists
          const url = `https://api.cartridge.gg/x/${edition.config.project}/torii`;
          try {
            const response = await fetch(url);
            if (!!response && response.status !== 404) {
              const client: torii.ToriiClient =
                await provider.getToriiClient(url);
              clients[edition.config.project] = client;
            }
          } catch (error) {
            console.log("Error fetching Torii instance:", error);
            return;
          }
        }),
      );
      const arcade = "https://api.cartridge.gg/x/arcade-main/torii";
      const client: torii.ToriiClient = await provider.getToriiClient(arcade);
      clients["arcade-main"] = client;
      setClients(clients);
    };
    getClients();
  }, [provider, editions]);

  const sortedAccesses = useMemo(() => {
    return Object.values(accesses).sort((a, b) =>
      a.identifier.localeCompare(b.identifier),
    );
  }, [accesses]);

  const sortedGames = useMemo(() => {
    return Object.values(games).sort((a, b) => {
      if (a.name === "Loot Survivor") return -1;
      if (b.name === "Loot Survivor") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [games]);

  const sortedEditions = useMemo(() => {
    return Object.values(editions)
      .sort((a, b) => a.id - b.id)
      .sort((a, b) => b.priority - a.priority);
  }, [editions, sortedGames]);

  const formmatedCollectionEditions = useMemo(() => {
    const results: { [collection: string]: number[] } = {};
    for (const collectionEdition of Object.values(collectionEditions)) {
      if (!results[collectionEdition.collection]) {
        results[collectionEdition.collection] = [];
      }
      results[collectionEdition.collection].push(
        Number.parseInt(collectionEdition.edition),
      );
    }
    return results;
  }, [collectionEditions]);

  return (
    <ArcadeContext.Provider
      value={{
        chainId: CHAIN_ID,
        provider,
        pins,
        follows,
        accesses: sortedAccesses,
        games: sortedGames,
        editions: sortedEditions,
        collectionEditions: formmatedCollectionEditions,
        chains,
        clients,
        player,
        book,
        orders,
        listings,
        sales,
        addOrder,
        removeOrder,
        setPlayer,
      }}
    >
      {children}
    </ArcadeContext.Provider>
  );
};
