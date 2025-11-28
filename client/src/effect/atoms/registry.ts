import { Atom } from "@effect-atom/atom-react";
import { Array as A, pipe, Order } from "effect";
import type {
  GameModel,
  EditionModel,
  AccessModel,
  CollectionEditionModel,
} from "@cartridge/arcade";
import { arcadeAtom } from "./arcade";
import type { ArcadeEntityItem } from "../layers/arcade";

type ArcadeModels = {
  Game?: ArcadeEntityItem & { type: "game"; data: GameModel };
  Edition?: ArcadeEntityItem & { type: "edition"; data: EditionModel };
  Access?: ArcadeEntityItem & { type: "access"; data: AccessModel };
  CollectionEdition?: ArcadeEntityItem & {
    type: "collectionEdition";
    data: CollectionEditionModel;
  };
};

const getArcadeModels = (entity: { models?: Record<string, unknown> }):
  | ArcadeModels
  | undefined => entity.models?.ARCADE as ArcadeModels | undefined;

export const gamesAtom = Atom.make((get) => {
  const result = get(arcadeAtom);
  if (result._tag !== "Success") return result;

  const byName = Order.mapInput(Order.string, (g: GameModel) => g.name ?? "");

  const games = pipe(
    result.value.items,
    A.filter((entity) => getArcadeModels(entity)?.Game !== undefined),
    A.map((entity) => getArcadeModels(entity)!.Game!.data),
    A.filter((game) => game.name !== "All Games"),
    A.sort(byName),
  );

  return { ...result, value: games };
});

export const editionsAtom = Atom.make((get) => {
  const result = get(arcadeAtom);
  if (result._tag !== "Success") return result;

  const byPriority = Order.mapInput(
    Order.reverse(Order.number),
    (e: EditionModel) => e.priority ?? 0,
  );

  const editions = pipe(
    result.value.items,
    A.filter((entity) => getArcadeModels(entity)?.Edition !== undefined),
    A.map((entity) => getArcadeModels(entity)!.Edition!.data),
    A.sort(byPriority),
  );

  return { ...result, value: editions };
});

export const accessesAtom = Atom.make((get) => {
  const result = get(arcadeAtom);
  if (result._tag !== "Success") return result;

  const accesses = pipe(
    result.value.items,
    A.filter((entity) => getArcadeModels(entity)?.Access !== undefined),
    A.map((entity) => getArcadeModels(entity)!.Access!.data),
  );

  return { ...result, value: accesses };
});

export const collectionEditionsAtom = Atom.make((get) => {
  const result = get(arcadeAtom);
  if (result._tag !== "Success") return result;

  const collectionEditions = pipe(
    result.value.items,
    A.filter(
      (entity) => getArcadeModels(entity)?.CollectionEdition !== undefined,
    ),
    A.map((entity) => getArcadeModels(entity)!.CollectionEdition!.data),
  );

  return { ...result, value: collectionEditions };
});

export type { GameModel, EditionModel, AccessModel, CollectionEditionModel };
