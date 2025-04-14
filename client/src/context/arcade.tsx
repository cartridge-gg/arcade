import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArcadeProvider as ExternalProvider,
  Registry,
  Social,
  PinEvent,
  GameModel,
  RegistryModel,
  SocialModel,
  SocialOptions,
  RegistryOptions,
  FollowEvent,
} from "@bal7hazar/arcade-sdk";
import {
  constants,
  getChecksumAddress,
  RpcProvider,
  shortString,
} from "starknet";
import { Chain } from "@starknet-react/chains";

const CHAIN_ID = constants.StarknetChainId.SN_MAIN;

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
  games: GameModel[];
  chains: Chain[];
  projects: ProjectProps[];
  setProjects: (projects: ProjectProps[]) => void;
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
  const currentValue = useContext(ArcadeContext);
  const [pins, setPins] = useState<{ [playerId: string]: string[] }>({});
  const [follows, setFollows] = useState<{ [playerId: string]: string[] }>({});
  const [games, setGames] = useState<{ [gameId: string]: GameModel }>({});
  const [chains, setChains] = useState<Chain[]>([]);
  const [projects, setProjects] = useState<ProjectProps[]>([]);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    async function getChains() {
      const chains: Chain[] = await Promise.all(
        Object.values(games).map(async (game) => {
          const provider = new RpcProvider({ nodeUrl: game.config.rpc });
          const id = await provider.getChainId();
          return {
            id: BigInt(id),
            name: shortString.decodeShortString(id),
            network: id,
            rpcUrls: {
              default: { http: [game.config.rpc] },
              public: { http: [game.config.rpc] },
            },
            nativeCurrency: {
              address: "0x0",
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
          };
        }),
      );
      // Deduplicate chains
      const uniques = chains.filter(
        (chain, index) => index === chains.findIndex((t) => t.id === chain.id),
      );
      setChains(uniques);
    }
    getChains();
  }, [games]);

  if (currentValue) {
    throw new Error("ArcadeProvider can only be used once");
  }

  const provider = useMemo(
    // TODO: Update here to select either Mainnet or Sepolia
    () => new ExternalProvider(CHAIN_ID),
    [],
  );

  const handlePinEvent = useCallback((event: PinEvent) => {
    const playerId = getChecksumAddress(event.playerId);
    if (event.time == 0) {
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
    if (event.time == 0) {
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

  const handleGameModels = useCallback((models: RegistryModel[]) => {
    models.forEach(async (model: RegistryModel) => {
      if (!GameModel.isType(model as GameModel)) return;
      const game = model as GameModel;
      const torii = `https://api.cartridge.gg/x/${game.config.project}/torii`;
      const response = await fetch(torii);
      const data = await response.json();
      if (!data.success) return;
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
    });
  }, []);

  useEffect(() => {
    if (initialized) return;
    const initialize = async () => {
      await Social.init(CHAIN_ID);
      await Registry.init(CHAIN_ID);
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
    const options: RegistryOptions = { game: true };
    Registry.fetch(handleGameModels, options);
    Registry.sub(handleGameModels, options);
    return () => {
      Registry.unsub();
    };
  }, [initialized, handleGameModels]);

  const sortedGames = useMemo(() => {
    return Object.values(games).sort((a, b) =>
      a.metadata.name.localeCompare(b.metadata.name),
    );
  }, [games]);

  return (
    <ArcadeContext.Provider
      value={{
        chainId: CHAIN_ID,
        provider,
        pins,
        follows,
        games: sortedGames,
        chains,
        projects,
        setProjects,
      }}
    >
      {children}
    </ArcadeContext.Provider>
  );
};
