import { Effect, Context, Layer, Data } from "effect";
import {
  Registry,
  GameModel,
  EditionModel,
  AccessModel,
  CollectionEditionModel,
  type RegistryModel,
} from "@cartridge/arcade";
import { constants } from "starknet";

const CHAIN_ID = constants.StarknetChainId.SN_MAIN;

export class RegistryError extends Data.TaggedError("RegistryError")<{
  message: string;
}> {}

export interface RegistryItem {
  type: "game" | "edition" | "access" | "collectionEdition";
  identifier: string;
  data: GameModel | EditionModel | AccessModel | CollectionEditionModel;
}

export interface RegistryClientImpl {
  fetchAll: () => Effect.Effect<RegistryItem[], RegistryError>;
}

export class RegistryClient extends Context.Tag("RegistryClient")<
  RegistryClient,
  RegistryClientImpl
>() {}

export const makeRegistryLayer = () =>
  Layer.succeed(RegistryClient, {
    fetchAll: (): Effect.Effect<RegistryItem[], RegistryError> =>
      Effect.tryPromise({
        try: async () => {
          await Registry.init(CHAIN_ID);
          const items: RegistryItem[] = [];

          await Registry.fetch(
            (models: RegistryModel[]) => {
              models.forEach((model) => {
                if (GameModel.isType(model as GameModel)) {
                  const game = model as GameModel;
                  if (game.exists()) {
                    items.push({
                      type: "game",
                      identifier: game.identifier,
                      data: game,
                    });
                    return;
                  }
                }
                if (EditionModel.isType(model as EditionModel)) {
                  const edition = model as EditionModel;
                  if (edition.exists()) {
                    items.push({
                      type: "edition",
                      identifier: edition.identifier,
                      data: edition,
                    });
                    return;
                  }
                }
                if (AccessModel.isType(model as AccessModel)) {
                  const access = model as AccessModel;
                  if (access.exists()) {
                    items.push({
                      type: "access",
                      identifier: access.identifier,
                      data: access,
                    });
                    return;
                  }
                }
                if (
                  CollectionEditionModel.isType(model as CollectionEditionModel)
                ) {
                  const collectionEdition = model as CollectionEditionModel;
                  if (collectionEdition.exists()) {
                    items.push({
                      type: "collectionEdition",
                      identifier: collectionEdition.identifier,
                      data: collectionEdition,
                    });
                    return;
                  }
                }
              });
            },
            { game: true, edition: true, access: true, collectionEdition: true }
          );

          return items;
        },
        catch: (error) =>
          new RegistryError({
            message: error instanceof Error ? error.message : "Unknown error",
          }),
      }),
  });

export const registryLayer = makeRegistryLayer();
