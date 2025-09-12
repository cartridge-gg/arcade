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

function getToriiUrl(project: string): string {
  return `https://api.cartridge.gg/x/${project}/torii`;
}

async function fetchFromEndpoint(toriiUrl: string, options: FetchToriiOptions, signal: AbortSignal): Promise<any> {
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
    const response = await fetch(toriiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: options.sql,
        limit: options.pagination?.limit,
        cursor: options.pagination?.cursor,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
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
      const result = await fetchFromEndpoint(toriiUrl, options, signal);
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
