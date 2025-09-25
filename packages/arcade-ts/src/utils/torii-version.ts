import { type SemVer, parseSemVer } from "./semver";

/**
 * Response structure from Torii version endpoint.
 */
export interface ToriiVersionResponse {
  /** Version string (e.g., "1.5.8-preview.4 (main 5392c8a)") */
  version: string;
  /** Service name (should be "torii") */
  service: string;
  /** Indicates if the request was successful */
  success: boolean;
}

/**
 * Extended semantic version with Torii-specific metadata.
 */
export interface ToriiSemVer extends SemVer {
  /** Git branch name (e.g., "main", "develop") */
  branch?: string;
  /** Git commit hash (7-40 characters) */
  commit?: string;
}

/**
 * Function type for fetching version information from a URL.
 */
export type VersionFetcher = (url: string) => Promise<ToriiVersionResponse>;

/**
 * Default implementation for fetching Torii version information.
 * Validates URL, handles network errors, and parses JSON response.
 * @param url - The URL to fetch version information from
 * @returns Promise resolving to version response
 * @throws Error for invalid URL, network errors, or JSON parsing failures
 */
export const defaultFetcher: VersionFetcher = async (url: string) => {
  // Validate URL
  try {
    new URL(url);
  } catch (error) {
    throw new Error(`Invalid URL provided: ${url}`);
  }

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new Error(
      `Network error while fetching Torii version from ${url}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Torii version: ${response.status} ${response.statusText}`,
    );
  }

  try {
    const data = await response.json();
    return data as ToriiVersionResponse;
  } catch (error) {
    throw new Error(
      `Failed to parse JSON response from ${url}: ${
        error instanceof Error ? error.message : "Invalid JSON"
      }`,
    );
  }
};

/**
 * Parses a Torii version string including branch and commit information.
 * Supports format: "1.5.8-preview.4 (main 5392c8a)"
 * @param version - The version string to parse
 * @returns Parsed version with branch and commit information
 */
export function parseToriiVersion(version: string): ToriiSemVer {
  // Pattern to match versions like "1.5.8-preview.4 (main 5392c8a)"
  // Branch names: letters, numbers, hyphens, underscores, dots, and forward slashes
  // Commit hashes: 1-40 alphanumeric characters (flexible for various hash lengths)
  const toriiVersionRegex =
    /^([^(]+?)(?:\s*\(([a-zA-Z0-9._\/-]+)\s+([a-zA-Z0-9]{1,40})\))?$/;
  const match = version.match(toriiVersionRegex);

  if (!match) {
    // Fallback to standard semver parsing if no Torii-specific format
    return parseSemVer(version);
  }

  const [, semverPart, branch, commit] = match;
  const baseSemVer = parseSemVer(semverPart.trim());

  return {
    ...baseSemVer,
    branch,
    commit,
  };
}

/**
 * Retrieves and parses version information from a Torii service.
 * @param toriiUrl - The URL of the Torii service
 * @param fetcher - Optional custom fetcher function
 * @returns Promise resolving to parsed Torii version information
 * @throws Error if service is not "torii", response indicates failure, or version is invalid
 */
export async function getToriiVersion(
  toriiUrl: string,
  fetcher: VersionFetcher = defaultFetcher,
): Promise<ToriiSemVer> {
  const response = await fetcher(toriiUrl);

  if (response.service !== "torii") {
    throw new Error(
      `Invalid service: expected 'torii', got '${response.service}'`,
    );
  }

  if (!response.success) {
    throw new Error("Torii service response indicates failure");
  }

  return parseToriiVersion(response.version);
}
