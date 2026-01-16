import type {
  Token,
  TokenBalance,
  TokenContract,
} from "@dojoengine/torii-wasm/types";
import type { constants, RpcProvider } from "starknet";
import type { OrderModel } from "../modules/marketplace";

export type AttributeFilterInputValue =
  | string
  | number
  | bigint
  | Iterable<string | number | bigint>;

export type AttributeFilterInput = Record<
  string,
  AttributeFilterInputValue | null | undefined
>;

export type ResolveTokenImage = (
  token: Token,
  context: { projectId: string },
) => Promise<string | undefined> | string | undefined;

export type ResolveContractImage = (
  contract: TokenContract,
  context: { projectId: string },
) => Promise<string | undefined> | string | undefined;

export interface NormalizedToken extends Token {
  contract_address: string;
  metadata: any;
  image?: string;
}

export interface CollectionTokensPage {
  tokens: NormalizedToken[];
  nextCursor: string | null;
}

export interface CollectionTokensError {
  error: Error;
}

export interface FetchCollectionTokensOptions {
  address: string;
  project?: string;
  cursor?: string | null | undefined;
  attributeFilters?: AttributeFilterInput;
  tokenIds?: string[];
  limit?: number;
  fetchImages?: boolean;
  resolveTokenImage?: ResolveTokenImage;
  defaultProjectId?: string;
}

export interface FetchCollectionTokensResult {
  page: CollectionTokensPage | null;
  error: CollectionTokensError | null;
}

export interface NormalizedCollection {
  projectId: string;
  address: string;
  contractType: string;
  metadata: any;
  totalSupply: bigint;
  tokenIdSample?: string | null;
  image?: string;
  raw: TokenContract;
}

export interface CollectionSummaryOptions {
  projectId?: string;
  address: string;
  fetchImages?: boolean;
}

export interface CollectionOrdersOptions {
  collection: string;
  tokenId?: string;
  status?: OrderModel["status"]["value"];
  category?: OrderModel["category"]["value"];
  limit?: number;
  orderIds?: number[];
}

export interface CollectionListingsOptions {
  collection: string;
  tokenId?: string;
  limit?: number;
  verifyOwnership?: boolean;
  projectId?: string;
}

export interface TokenDetailsOptions {
  collection: string;
  tokenId: string;
  projectId?: string;
  fetchImages?: boolean;
  orderLimit?: number;
}

export interface TokenDetails {
  projectId: string;
  token: NormalizedToken;
  orders: OrderModel[];
  listings: OrderModel[];
}

export interface MarketplaceClientConfig {
  chainId: constants.StarknetChainId;
  defaultProject?: string;
  resolveTokenImage?: ResolveTokenImage;
  resolveContractImage?: ResolveContractImage;
  provider?: RpcProvider;
}

export interface MarketplaceFees {
  feeNum: number;
  feeReceiver: string;
  feeDenominator: number;
}

export interface RoyaltyFeeOptions {
  collection: string;
  tokenId: string;
  amount: bigint;
}

export interface RoyaltyFee {
  receiver: string;
  amount: bigint;
}

export interface MarketplaceClient {
  getCollection(
    options: CollectionSummaryOptions,
  ): Promise<NormalizedCollection | null>;
  listCollectionTokens(
    options: FetchCollectionTokensOptions,
  ): Promise<FetchCollectionTokensResult>;
  getCollectionOrders(options: CollectionOrdersOptions): Promise<OrderModel[]>;
  listCollectionListings(
    options: CollectionListingsOptions,
  ): Promise<OrderModel[]>;
  getToken(options: TokenDetailsOptions): Promise<TokenDetails | null>;
  getFees(): Promise<MarketplaceFees | null>;
  getRoyaltyFee(options: RoyaltyFeeOptions): Promise<RoyaltyFee | null>;
}

export interface TokenBalancesPage {
  balances: TokenBalance[];
  nextCursor: string | null;
}

export interface TokenBalancesError {
  error: Error;
}

export interface FetchTokenBalancesOptions {
  project?: string;
  contractAddresses?: string[];
  accountAddresses?: string[];
  tokenIds?: string[];
  cursor?: string | null | undefined;
  limit?: number;
  defaultProjectId?: string;
}

export interface FetchTokenBalancesResult {
  page: TokenBalancesPage | null;
  error: TokenBalancesError | null;
}
