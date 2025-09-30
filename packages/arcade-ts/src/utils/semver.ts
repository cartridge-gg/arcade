/**
 * Represents a parsed semantic version.
 */
export interface SemVer {
  /** Major version number (X in X.Y.Z) */
  major: number;
  /** Minor version number (Y in X.Y.Z) */
  minor: number;
  /** Patch version number (Z in X.Y.Z) */
  patch: number;
  /** Prerelease version identifier (e.g., "alpha.1" in "1.0.0-alpha.1") */
  prerelease?: string;
  /** Build metadata (e.g., "build.123" in "1.0.0+build.123") */
  build?: string;
  /** The original version string */
  raw: string;
}

/**
 * Parses a semantic version string into its components.
 * @param version - The version string to parse (e.g., "1.2.3", "v1.2.3-alpha.1+build.123")
 * @returns Parsed semantic version object
 * @throws Error if the version string is invalid
 */
export function parseSemVer(version: string): SemVer {
  const cleanVersion = version.startsWith("v") ? version.slice(1) : version;

  const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
  const match = cleanVersion.match(semverRegex);

  if (!match) {
    throw new Error(`Invalid semver format: ${version}`);
  }

  const [, major, minor, patch, prerelease, build] = match;

  return {
    major: Number.parseInt(major, 10),
    minor: Number.parseInt(minor, 10),
    patch: Number.parseInt(patch, 10),
    prerelease,
    build,
    raw: version,
  };
}

/**
 * Compares prerelease identifiers according to semver specification.
 * Numeric identifiers are compared numerically, non-numeric lexically.
 * @param a - First prerelease identifier
 * @param b - Second prerelease identifier
 * @returns Negative if a < b, positive if a > b, 0 if equal
 */
function comparePrereleaseIdentifiers(a: string, b: string): number {
  const aParts = a.split(".");
  const bParts = b.split(".");

  const maxLength = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < maxLength; i++) {
    const aPart = aParts[i];
    const bPart = bParts[i];

    // If one version has fewer parts, it's considered smaller
    if (aPart === undefined) return -1;
    if (bPart === undefined) return 1;

    const aIsNumeric = /^\d+$/.test(aPart);
    const bIsNumeric = /^\d+$/.test(bPart);

    // Numeric identifiers always have lower precedence than non-numeric
    if (aIsNumeric && !bIsNumeric) return -1;
    if (!aIsNumeric && bIsNumeric) return 1;

    // Compare numerically if both are numeric
    if (aIsNumeric && bIsNumeric) {
      const aNum = Number.parseInt(aPart, 10);
      const bNum = Number.parseInt(bPart, 10);
      if (aNum !== bNum) return aNum - bNum;
    } else {
      // Compare lexically if both are non-numeric
      const result = aPart.localeCompare(bPart);
      if (result !== 0) return result;
    }
  }

  return 0;
}

/**
 * Compares two semantic versions.
 * @param a - First version to compare
 * @param b - Second version to compare
 * @returns Negative if a < b, positive if a > b, 0 if equal
 */
export function compareSemVer(a: SemVer, b: SemVer): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;

  if (a.prerelease && !b.prerelease) return -1;
  if (!a.prerelease && b.prerelease) return 1;

  if (a.prerelease && b.prerelease) {
    return comparePrereleaseIdentifiers(a.prerelease, b.prerelease);
  }

  return 0;
}

/**
 * Checks if a version meets the specified requirements.
 * @param current - The current version
 * @param required - Required version constraints
 * @returns True if the current version satisfies the requirements
 */
export function isVersionCompatible(
  current: SemVer,
  required: { major?: number; minor?: number; patch?: number },
): boolean {
  if (required.major !== undefined && current.major !== required.major) {
    return false;
  }

  if (required.minor !== undefined && current.minor < required.minor) {
    return false;
  }

  if (required.patch !== undefined && current.patch < required.patch) {
    return false;
  }

  return true;
}
