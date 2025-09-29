export type MarketplaceOptions = {
  access?: boolean;
  book?: boolean;
  order?: boolean;
  listing?: boolean;
  offer?: boolean;
  sale?: boolean;
};

export const DefaultMarketplaceOptions: MarketplaceOptions = {
  access: true,
  book: true,
  order: true,
  listing: true,
  offer: true,
  sale: true,
};
