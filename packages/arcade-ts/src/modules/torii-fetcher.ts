import { ToriiClient } from "@dojoengine/torii-client";

export interface PaginationOptions {
  limit?: number;
  cursor?: string;
  direction?: "Forward" | "Backward";
}

export interface ClientCallbackParams {
  client: ToriiClient;
  signal: AbortSignal;
}

export interface FetchToriiOptionsBase {
  pagination?: PaginationOptions;
}

export interface FetchToriiOptionsWithClient extends FetchToriiOptionsBase {
  client: (params: ClientCallbackParams) => Promise<any> | void;
  sql?: never;
}

export interface FetchToriiOptionsWithSQL extends FetchToriiOptionsBase {
  sql: string;
  client?: never;
}

export type FetchToriiOptions = FetchToriiOptionsWithClient | FetchToriiOptionsWithSQL;

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
): Promise<any> {
  if ("client" in options && options.client) {
    const client = await new ToriiClient({
      toriiUrl,
      worldAddress: "0x0",
    });

    try {
      return await options.client({
        client,
        signal,
      });
    } finally {
      client.free();
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
      return { success: true as const, data: result, endpoint };
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

  // Create promises with their indices
  const pendingPromises = endpoints.map(async (endpoint, index) => {
    const toriiUrl = getToriiUrl(endpoint);

    try {
      const result = await fetchFromEndpoint(endpoint, toriiUrl, options, signal);
      return { index, success: true as const, data: result, endpoint };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(`Failed to fetch from ${endpoint}: ${String(error)}`);
      return { index, success: false as const, error: err, endpoint };
    }
  });

  let completed = 0;
  const remainingIndices = new Set(Array.from({ length: totalEndpoints }, (_, i) => i));

  // Process promises as they complete using Promise.race
  while (remainingIndices.size > 0) {
    // Create a map of active promises
    const activePromises = Array.from(remainingIndices).map((index) =>
      pendingPromises[index].then((result) => ({ ...result, promiseIndex: index })),
    );

    try {
      // Wait for the first promise to complete
      const result = await Promise.race(activePromises);

      // Remove completed promise from remaining set
      remainingIndices.delete(result.promiseIndex);
      completed++;

      // Yield the result
      yield {
        endpoint: result.endpoint,
        data: result.success ? result.data : undefined,
        error: result.success ? undefined : result.error,
        metadata: {
          completed,
          total: totalEndpoints,
          isLast: completed === totalEndpoints,
        },
      };
    } catch (error) {
      // Handle unexpected errors
      completed++;
      yield {
        endpoint: "unknown",
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          completed,
          total: totalEndpoints,
          isLast: completed === totalEndpoints,
        },
      };
      break;
    }
  }
}
