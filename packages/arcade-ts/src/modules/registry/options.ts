export type RegistryOptions = {
  access?: boolean;
  game?: boolean;
  edition?: boolean;
  collectionEdition?: boolean;
};

export const DefaultRegistryOptions: RegistryOptions = {
  game: true,
  edition: true,
  access: true,
  collectionEdition: true,
};
