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
	Marketplace,
	type MarketplaceModel,
	ModeratorModel,
	BookModel,
	OrderModel,
	ListingEvent,
	OfferEvent,
	SaleEvent,
	type MarketplaceOptions,
} from "../modules/marketplace";
import { MarketplaceProvider as ExternalProvider } from "../provider";
import { constants } from "starknet";

const CHAIN_ID = constants.StarknetChainId.SN_MAIN;

export type MarketplaceStateInnerType<T extends MarketplaceModel> = {
	[key: string]: T;
};

/**
 * Helper function to hydrate a model into the state
 */
export function hydrateModel<T extends MarketplaceModel>(
	model: T,
	modelClassTypeCheckFn: (model: MarketplaceModel) => boolean,
	setModel: React.Dispatch<React.SetStateAction<MarketplaceStateInnerType<T>>>,
) {
	if (modelClassTypeCheckFn(model)) {
		const m = model as T;
		if (!m.exists()) {
			setModel((prevs) => {
				const news = { ...prevs };
				delete news[m.identifier];
				return news;
			});
			return;
		}
		setModel((prevs) => ({ ...prevs, [m.identifier]: m }));
	}
}

/**
 * Interface defining the shape of the Marketplace context.
 */
export type MarketplaceContextType = {
	/** The Marketplace client instance */
	chainId: string;
	provider: ExternalProvider;
	accesses: ModeratorModel[];
	books: BookModel[];
	orders: OrderModel[];
	listings: ListingEvent[];
	offers: OfferEvent[];
	sales: SaleEvent[];
};

/**
 * React context for sharing Marketplace-related data throughout the application.
 */
export const MarketplaceContext = createContext<MarketplaceContextType | null>(
	null,
);

/**
 * Provider component that makes Marketplace context available to child components.
 *
 * @param props.children - Child components that will have access to the Marketplace context
 * @throws {Error} If MarketplaceProvider is used more than once in the component tree
 */
export const MarketplaceContextProvider = ({
	children,
}: { children: ReactNode }) => {
	const currentValue = useContext(MarketplaceContext);

	if (currentValue) {
		throw new Error("MarketplaceProvider can only be used once");
	}

	const [accesses, setAccesses] = useState<
		MarketplaceStateInnerType<ModeratorModel>
	>({});
	const [books, setBooks] = useState<MarketplaceStateInnerType<BookModel>>({});
	const [orders, setOrders] = useState<MarketplaceStateInnerType<OrderModel>>(
		{},
	);
	const [listings, setListings] = useState<
		MarketplaceStateInnerType<ListingEvent>
	>({});
	const [offers, setOffers] = useState<MarketplaceStateInnerType<OfferEvent>>(
		{},
	);
	const [sales, setSales] = useState<MarketplaceStateInnerType<SaleEvent>>({});
	const [initialized, setInitialized] = useState<boolean>(false);

	const provider = useMemo(
		// TODO: Update here to select either Mainnet or Sepolia
		() => new ExternalProvider(CHAIN_ID),
		[],
	);

	const handleMarketplaceModels = useCallback((models: MarketplaceModel[]) => {
		models.map(async (model: MarketplaceModel) => {
			hydrateModel(model as ModeratorModel, ModeratorModel.isType, setAccesses);
			hydrateModel(model as BookModel, BookModel.isType, setBooks);
			hydrateModel(model as OrderModel, OrderModel.isType, setOrders);
			hydrateModel(model as ListingEvent, ListingEvent.isType, setListings);
			hydrateModel(model as OfferEvent, OfferEvent.isType, setOffers);
			hydrateModel(model as SaleEvent, SaleEvent.isType, setSales);
		});
	}, []);

	useEffect(() => {
		if (initialized) return;
		const initialize = async () => {
			await Marketplace.init(CHAIN_ID);
			setInitialized(true);
		};
		initialize();
	}, [initialized]);

	useEffect(() => {
		if (!initialized) return;
		const options: MarketplaceOptions = {
			access: true,
			book: true,
			order: true,
			listing: true,
			offer: true,
			sale: true,
		};
		Marketplace.fetch(handleMarketplaceModels, options);
		// Marketplace.sub(handleMarketplaceModels, options);
		return () => {
			// Marketplace.unsub();
		};
	}, [initialized, handleMarketplaceModels]);

	return (
		<MarketplaceContext.Provider
			value={{
				chainId: CHAIN_ID,
				provider,
				accesses: Object.values(accesses),
				books: Object.values(books),
				orders: Object.values(orders),
				listings: Object.values(listings),
				offers: Object.values(offers),
				sales: Object.values(sales),
			}}
		>
			{children}
		</MarketplaceContext.Provider>
	);
};
