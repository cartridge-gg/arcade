import { Atom } from "@effect-atom/atom-react";
import { Effect, Array as A, pipe, Order } from "effect";
import {
  RegistryClient,
  registryLayer,
  type RegistryItem,
} from "../layers/registry";
import type {
  GameModel,
  EditionModel,
  AccessModel,
  CollectionEditionModel,
} from "@cartridge/arcade";

const fetchRegistryEffect = Effect.gen(function* () {
  const client = yield* RegistryClient;
  return yield* client.fetchAll();
});

const registryRuntime = Atom.runtime(registryLayer);

export const registryAtom = registryRuntime
  .atom(fetchRegistryEffect)
  .pipe(Atom.keepAlive);

export const gamesAtom = Atom.make((get) => {
  const result = get(registryAtom);
  if (result._tag !== "Success") return result;

  const byName = Order.mapInput(
    Order.string,
    (g: GameModel) => g.name ?? ""
  );

  const games = pipe(
    result.value,
    A.filter((item): item is RegistryItem & { data: GameModel } =>
      item.type === "game"
    ),
    A.map((item) => item.data),
    A.filter((game) => game.name !== "All Games"),
    A.sort(byName)
  );

  return { ...result, value: games };
});

export const editionsAtom = Atom.make((get) => {
  const result = get(registryAtom);
  if (result._tag !== "Success") return result;

  const byPriority = Order.mapInput(
    Order.reverse(Order.number),
    (e: EditionModel) => e.priority ?? 0
  );

  const editions = pipe(
    result.value,
    A.filter((item): item is RegistryItem & { data: EditionModel } =>
      item.type === "edition"
    ),
    A.map((item) => item.data),
    A.sort(byPriority)
  );

  return { ...result, value: editions };
});

export const accessesAtom = Atom.make((get) => {
  const result = get(registryAtom);
  if (result._tag !== "Success") return result;

  const accesses = pipe(
    result.value,
    A.filter((item): item is RegistryItem & { data: AccessModel } =>
      item.type === "access"
    ),
    A.map((item) => item.data)
  );

  return { ...result, value: accesses };
});

export const collectionEditionsAtom = Atom.make((get) => {
  const result = get(registryAtom);
  if (result._tag !== "Success") return result;

  const collectionEditions = pipe(
    result.value,
    A.filter(
      (item): item is RegistryItem & { data: CollectionEditionModel } =>
        item.type === "collectionEdition"
    ),
    A.map((item) => item.data)
  );

  return { ...result, value: collectionEditions };
});

export type { GameModel, EditionModel, AccessModel, CollectionEditionModel };
