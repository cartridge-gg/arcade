export interface FetchToriiSqlResult {
  data: any[];
  errors?: Error[];
  metadata?: {
    totalEndpoints: number;
    successfulEndpoints: number;
    failedEndpoints: number;
  };
}

const ARCADE_MAIN_PROJECT = "arcade-main";

function getToriiUrl(project: string): string {
  const resolvedProject = project || ARCADE_MAIN_PROJECT;
  return `https://api.cartridge.gg/x/${resolvedProject}/torii`;
}

async function fetchSqlFromEndpoint(
  endpoint: string,
  toriiUrl: string,
  sql: string,
  signal: AbortSignal,
): Promise<any> {
  const response = await fetch(`${toriiUrl}/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: sql,
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

export async function fetchToriisSql(
  endpoints: string[],
  sql: string,
): Promise<FetchToriiSqlResult> {
  const abortController = new AbortController();
  const signal = abortController.signal;

  const results: any[] = [];
  const errors: Error[] = [];

  const promises = endpoints.map(async (endpoint) => {
    const toriiUrl = getToriiUrl(endpoint);

    try {
      const result = await fetchSqlFromEndpoint(endpoint, toriiUrl, sql, signal);
      return { success: true as const, data: result, endpoint };
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error(`Failed to fetch from ${endpoint}: ${String(error)}`);
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
    errors.push(
      new Error(`Promise rejected: ${reason?.message || "Unknown error"}`),
    );
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
