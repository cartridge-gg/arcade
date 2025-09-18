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
	Registry,
	type RegistryModel,
	type RegistryOptions,
	EditionModel,
} from "@cartridge/arcade";
import { constants, RpcProvider, shortString } from "starknet";
import type { Chain } from "@starknet-react/chains";
import type * as torii from "@dojoengine/torii-client";
import { hydrateModel } from ".";

const CHAIN_ID = constants.StarknetChainId.SN_MAIN;
const IGNORES = ["populariumdemo-game", "dragark-mainnet-v11-3"];

export interface ProjectProps {
	namespace: string;
	project: string;
}

/**
 * Interface defining the shape of the Arcade context.
 */
export type ArcadeContextType = {
	/** The Arcade client instance */
	chainId: string;
	provider: ExternalProvider;
	clients: { [key: string]: torii.ToriiClient };
	chains: Chain[];
};

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

	if (currentValue) {
		throw new Error("ArcadeProvider can only be used once");
	}

	const [editions, setEditions] = useState<{
		[editionId: string]: EditionModel;
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
						paymasterRpcUrls: {},
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

	const provider = useMemo(
		// TODO: Update here to select either Mainnet or Sepolia
		() => new ExternalProvider(CHAIN_ID),
		[],
	);

	const handleRegistryModels = useCallback((models: RegistryModel[]) => {
		models.map(async (model: RegistryModel) => {
			// @ts-expect-error this is failing here for type
			hydrateModel(model as EditionModel, EditionModel.isType, setEditions);
		});
	}, []);

	useEffect(() => {
		if (initialized) return;
		const initialize = async () => {
			await Registry.init(CHAIN_ID);
			setInitialized(true);
		};
		initialize();
	}, [initialized]);

	useEffect(() => {
		if (!initialized) return;
		const options: RegistryOptions = {
			access: false,
			game: true,
			edition: true,
		};
		Registry.fetch(handleRegistryModels, options);
		// Registry.sub(handleRegistryModels, options);
		return () => {
			// Registry.unsub();
		};
	}, [initialized, handleRegistryModels]);

	useEffect(() => {
		const getClients = async () => {
			const clients: { [key: string]: torii.ToriiClient } = {};
			await Promise.all(
				Object.values(editions).map(async (edition) => {
					// FIXME: some old torii version not compatible with the dojo.js version
					if (IGNORES.includes(edition.config.project)) return;
					const url = `https://api.cartridge.gg/x/${edition.config.project}/torii`;
					const client = await provider.getToriiClient(url);
					clients[edition.config.project] = client;
				}),
			);
			setClients(clients);
		};
		getClients();
	}, [provider, editions]);

	return (
		<ArcadeContext.Provider
			value={{
				chainId: CHAIN_ID,
				provider,
				clients,
				chains,
			}}
		>
			{children}
		</ArcadeContext.Provider>
	);
};
