import { ToriiGrpcClient } from "@dojoengine/grpc";
import { ToriiClient } from "@dojoengine/torii-client";

export interface PaginationOptions {
  limit?: number;
  cursor?: string;
  direction?: "Forward" | "Backward";
}

export interface ClientCallbackParams<TNative extends boolean = false> {
  client: TNative extends true ? ToriiGrpcClient : ToriiClient;
  signal: AbortSignal;
}

export interface FetchToriiOptionsBase {
  pagination?: PaginationOptions;
}

export type ClientCallback<TNative extends boolean = false> =
  | ((params: ClientCallbackParams<TNative>) => Promise<any> | void)
  | ((params: ClientCallbackParams<TNative>) => AsyncGenerator<any, void, unknown>);

export interface FetchToriiOptionsWithClient<TNative extends boolean = false> extends FetchToriiOptionsBase {
  client: ClientCallback<TNative>;
  native?: TNative;
  sql?: never;
}

export interface FetchToriiOptionsWithSQL extends FetchToriiOptionsBase {
  sql: string;
  native?: never;
  client?: never;
}

export type FetchToriiOptions = FetchToriiOptionsWithClient<boolean> | FetchToriiOptionsWithSQL;

export interface FetchToriiResult {
  data: any[];
  errors?: Error[];
  metadata?: {
    totalEndpoints: number;
    successfulEndpoints: number;
    failedEndpoints: number;
  };
}

export interface FetchToriiStreamResult {
  endpoint: string;
  data?: any;
  error?: Error;
  metadata: {
    completed: number;
    total: number;
    isLast: boolean;
  };
}

function getToriiUrl(project: string): string {
  return `https://api.cartridge.gg/x/${project}/torii`;
}

async function fetchFromEndpoint(
  endpoint: string,
  toriiUrl: string,
  options: FetchToriiOptions,
  signal: AbortSignal,
): Promise<any | AsyncGenerator<any, void, unknown>> {
  if ("client" in options && options.client) {
    const cfg = {
      toriiUrl,
      worldAddress: "0x0",
    }

    const client = options.native ? new ToriiGrpcClient(cfg) : await new ToriiClient(cfg);

    try {
      const result = options.client({
        client,
        signal,
      });

      // Check if result is an async generator
      if (result && typeof result === 'object' && Symbol.asyncIterator in result) {
        // Return an async generator that yields results and handles cleanup
        return (async function* () {
          try {
            for await (const data of result as AsyncGenerator<any>) {
              yield { endpoint, data };
            }
          } finally {
            if ('free' in client && typeof client.free === 'function') {
              client.free();
            }
          }
        })();
      } else {
        // Handle regular Promise or void return
        const data = await result;
        if ('free' in client && typeof client.free === 'function') {
          client.free();
        }
        return { endpoint, data };
      }
    } catch (err) {
      if ('free' in client && typeof client.free === 'function') {
        client.free();
      }
      throw err;
    }
  }

  if ("sql" in options && options.sql) {
    const response = await fetch(`${toriiUrl}/sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: options.sql,
      signal,
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}, statusText: ${response.statusText}, endpoint: ${endpoint}`,
      );
    }

    const data = await response.json();
    return { endpoint, data };
  }

  throw new Error("Either 'client' or 'sql' must be provided in options");
}

export async function fetchToriis(endpoints: string[], options: FetchToriiOptions): Promise<FetchToriiResult> {
  const abortController = new AbortController();
  const signal = abortController.signal;

  const results: any[] = [];
  const errors: Error[] = [];

  const promises = endpoints.map(async (endpoint) => {
    const toriiUrl = getToriiUrl(endpoint);

    try {
      const result = await fetchFromEndpoint(endpoint, toriiUrl, options, signal);

      // Check if result is an async generator and consume it
      if (result && typeof result === 'object' && Symbol.asyncIterator in result) {
        const collectedData: any[] = [];
        for await (const data of result as AsyncGenerator<any>) {
          collectedData.push(data);
        }
        return { success: true as const, data: collectedData.length === 1 ? collectedData[0] : collectedData, endpoint };
      } else {
        return { success: true as const, data: result, endpoint };
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(`Failed to fetch from ${endpoint}: ${String(error)}`);
      return { success: false as const, error: err, endpoint };
    }
  });

  const responses = await Promise.allSettled(promises);

  let successCount = 0;
  let failCount = 0;

  for (const response of responses) {
    if (response.status === "fulfilled") {
      const result = response.value;
      if (result.success) {
        results.push(result.data);
        successCount++;
        continue;
      }
      errors.push(result.error);
      failCount++;
      continue;
    }
    const reason = response.reason as any;
    errors.push(new Error(`Promise rejected: ${reason?.message || "Unknown error"}`));
    failCount++;
  }

  return {
    data: results,
    errors: errors.length > 0 ? errors : undefined,
    metadata: {
      totalEndpoints: endpoints.length,
      successfulEndpoints: successCount,
      failedEndpoints: failCount,
    },
  };
}

export async function* fetchToriisStream(
  endpoints: string[],
  options: FetchToriiOptions,
): AsyncGenerator<FetchToriiStreamResult, void, unknown> {
  const abortController = new AbortController();
  const signal = abortController.signal;
  const totalEndpoints = endpoints.length;

  if (totalEndpoints === 0) {
    return;
  }

  let totalCompleted = 0;
  const endpointStatuses = new Map<string, { completed: boolean; streamCount: number }>();

  // Initialize status tracking
  endpoints.forEach(endpoint => {
    endpointStatuses.set(endpoint, { completed: false, streamCount: 0 });
  });

  // Process endpoints concurrently
  const generators = await Promise.all(
    endpoints.map(async (endpoint) => {
      const toriiUrl = getToriiUrl(endpoint);

      try {
        const result = await fetchFromEndpoint(endpoint, toriiUrl, options, signal);

        // Check if result is an async generator
        if (result && typeof result === 'object' && Symbol.asyncIterator in result) {
          // Return the generator directly
          return { type: 'generator' as const, generator: result as AsyncGenerator<any>, endpoint };
        } else {
          // Wrap single result in a generator
          return {
            type: 'single' as const,
            generator: (async function* () {
              yield result;
            })(),
            endpoint
          };
        }
      } catch (error) {
        // Wrap error in a generator
        return {
          type: 'error' as const,
          generator: (async function* () {
            yield {
              endpoint,
              error: error instanceof Error ? error : new Error(`Failed to fetch from ${endpoint}: ${String(error)}`)
            };
          })(),
          endpoint
        };
      }
    })
  );

  // Create async iterators from all generators
  const iterators = generators.map((gen) => ({
    iterator: gen.generator[Symbol.asyncIterator](),
    endpoint: gen.endpoint,
    type: gen.type,
    done: false
  }));

  // Process all iterators concurrently
  while (iterators.some(it => !it.done)) {
    const promises = iterators
      .filter(it => !it.done)
      .map(async (it, idx) => {
        try {
          const result = await it.iterator.next();
          return {
            value: result.value,
            done: result.done,
            endpoint: it.endpoint,
            type: it.type,
            iteratorIndex: iterators.indexOf(it),
            hasError: false
          };
        } catch (error) {
          return {
            value: {
              endpoint: it.endpoint,
              error: error instanceof Error ? error : new Error(String(error))
            },
            done: true,
            endpoint: it.endpoint,
            type: 'error' as const,
            iteratorIndex: iterators.indexOf(it),
            hasError: true
          };
        }
      });

    // Wait for the next available result
    const nextResult = await Promise.race(promises);

    if (nextResult.done) {
      iterators[nextResult.iteratorIndex].done = true;
      const status = endpointStatuses.get(nextResult.endpoint)!;
      if (!status.completed) {
        status.completed = true;
        totalCompleted++;
      }
    }

    if (!nextResult.done || nextResult.hasError) {
      const status = endpointStatuses.get(nextResult.endpoint)!;
      status.streamCount++;

      yield {
        endpoint: nextResult.endpoint,
        data: nextResult.hasError ? undefined : nextResult.value?.data,
        error: nextResult.hasError ? nextResult.value.error : nextResult.value?.error,
        metadata: {
          completed: totalCompleted,
          total: totalEndpoints,
          isLast: totalCompleted === totalEndpoints && iterators.every(it => it.done),
        },
      };
    }
  }
}
