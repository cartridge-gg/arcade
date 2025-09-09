export type RegistryOptions = {
  access?: boolean;
  game?: boolean;
  edition?: boolean;
};

export const DefaultRegistryOptions: RegistryOptions = {
  game: true,
  edition: true,
  access: true,
};
