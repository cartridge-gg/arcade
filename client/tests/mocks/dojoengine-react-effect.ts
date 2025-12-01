import { Atom } from "@effect-atom/atom-react";

export const makeToriiLayer = () => Atom.runtime({});

export const createEntityQueryWithUpdatesAtom = () =>
  Atom.make(() => ({
    _tag: "Success" as const,
    value: { items: [] },
  }));

export class ToriiGrpcClient {
  async getTokens() {
    return { items: [], next_cursor: undefined };
  }
  async getTokenBalances() {
    return { items: [], next_cursor: undefined };
  }
}
