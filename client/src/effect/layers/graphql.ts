import { Effect, Context, Layer, Data } from "effect";

const API_URL =
  import.meta.env.VITE_CARTRIDGE_API_URL || "https://api.cartridge.gg";

export interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
}

export class GraphQLClientError extends Data.TaggedError("GraphQLClientError")<{
  message: string;
  errors?: GraphQLError[];
}> {}

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
}

export interface CartridgeInternalGqlClientImpl {
  query: <T = unknown>(
    query: string,
    variables?: Record<string, unknown>,
  ) => Effect.Effect<T, GraphQLClientError>;
}

export class CartridgeInternalGqlClient extends Context.Tag(
  "CartridgeInternalGqlClient",
)<CartridgeInternalGqlClient, CartridgeInternalGqlClientImpl>() {}

export const makeGraphQLLayer = () =>
  Layer.succeed(CartridgeInternalGqlClient, {
    query: <T = unknown>(
      query: string,
      variables?: Record<string, unknown>,
    ): Effect.Effect<T, GraphQLClientError> =>
      Effect.tryPromise({
        try: async () => {
          const response = await fetch(`${API_URL}/query`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query,
              variables,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const json: GraphQLResponse<T> = await response.json();

          if (json.errors && json.errors.length > 0) {
            throw new GraphQLClientError({
              message: json.errors.map((e) => e.message).join(", "),
              errors: json.errors,
            });
          }

          if (!json.data) {
            throw new GraphQLClientError({
              message: "No data returned from GraphQL query",
            });
          }

          return json.data;
        },
        catch: (error) =>
          error instanceof GraphQLClientError
            ? error
            : new GraphQLClientError({
                message:
                  error instanceof Error ? error.message : "Unknown error",
              }),
      }),
  });

export const graphqlLayer = makeGraphQLLayer();
