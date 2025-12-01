export const KeysClause = (_keys: unknown[], _models: unknown[], _type: string) => ({
  build: () => ({}),
});

export class ToriiQueryBuilder {
  withClause(_clause: unknown) {
    return this;
  }
  withEntityModels(_models: unknown[]) {
    return this;
  }
  includeHashedKeys() {
    return this;
  }
  withLimit(_limit: number) {
    return this;
  }
}
