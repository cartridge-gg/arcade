import {
  createEntityQueryWithUpdatesAtom,
  ToriiGrpcClient,
  mergeFormatters,
  parseEntities,
} from "@dojoengine/react/effect";
import { Atom, Result } from "@effect-atom/atom-react";
import { Effect, Stream, Schedule } from "effect";
import {
  ARCADE_MODELS,
  arcadeFormatters,
  mainnetConfig,
  toriiRuntime,
} from "../layers/arcade";
import { KeysClause, ToriiQueryBuilder } from "@dojoengine/sdk";

const clause = KeysClause([], [], "VariableLen").build();
const query = new ToriiQueryBuilder()
  .withClause(clause)
  .withEntityModels(ARCADE_MODELS)
  .includeHashedKeys()
  .withLimit(100000000);

const subscriptionAtom = createEntityQueryWithUpdatesAtom(
  toriiRuntime,
  query as unknown as Parameters<typeof createEntityQueryWithUpdatesAtom>[1],
  clause,
  [mainnetConfig.manifest.world.address],
  arcadeFormatters,
);

const POLL_INTERVAL = 10_000;

const pollingAtom = toriiRuntime
  .atom(
    Stream.unwrap(
      Effect.gen(function* () {
        const { use, formatters } = yield* ToriiGrpcClient;
        const merged = mergeFormatters(formatters, arcadeFormatters);
        const built = query.build();

        return Stream.asyncScoped<any>((push) =>
          Effect.gen(function* () {
            const poll = () =>
              use((client) => client.getEntities(built)).pipe(
                Effect.flatMap(parseEntities(merged)),
                Effect.tap((result) => push.single(result)),
                Effect.catchAll(() => Effect.void),
              );

            yield* poll();

            const timer = setInterval(
              () => Effect.runPromise(poll()),
              POLL_INTERVAL,
            );
            yield* Effect.addFinalizer(() =>
              Effect.sync(() => clearInterval(timer)),
            );
          }),
        );
      }),
    ).pipe(Stream.retry(Schedule.exponential("1 second", 2))),
    { initialValue: null as any },
  )
  .pipe(Atom.keepAlive);

export const arcadeAtom = Atom.make((get: any) => {
  const sub = get(subscriptionAtom);
  const poll: any = get(pollingAtom);

  if (poll !== null && poll._tag === "Success" && poll.value !== null) {
    const pollData: any = poll.value;
    if (pollData?.items?.length > 0) {
      if (sub._tag !== "Success" || !(sub.value as any)?.items?.length) {
        return Result.success({
          items: pollData.items,
          entitiesMap: new Map(pollData.items.map((i: any) => [i.entityId, i])),
          next_cursor: pollData.next_cursor,
        });
      }

      const subVal: any = sub.value;
      const merged = new Map<string, any>();
      for (const item of pollData.items) {
        merged.set(item.entityId, item);
      }
      for (const item of subVal.items) {
        merged.set(item.entityId, item);
      }
      return Result.success({
        items: Array.from(merged.values()),
        entitiesMap: merged,
        next_cursor: pollData.next_cursor ?? subVal.next_cursor,
      });
    }
  }

  return sub;
}).pipe(Atom.keepAlive) as unknown as typeof subscriptionAtom;
