/**
 * Active projects configuration for SSR
 *
 * TODO: This should ideally be fetched dynamically from the Registry,
 * but for SSR we need it synchronously. Consider adding a cached API
 * endpoint or making this configurable via environment variable.
 *
 * To update this list:
 * 1. Check the Arcade registry on-chain
 * 2. Or use the client app and inspect `editions` from ArcadeContext
 * 3. Add/remove projects as needed
 *
 * Each project needs:
 * - namespace: Dojo namespace (e.g., "dopewars")
 * - project: Project identifier (matches namespace usually)
 * - model: Dojo model selector (computed via getSelectorFromTag)
 *
 * The model selector is computed as:
 * hash.computePoseidonHashOnElements([
 *   computeByteArrayHash(namespace),
 *   computeByteArrayHash(eventName)
 * ])
 */

export interface Project {
  model: string;
  namespace: string;
  project: string;
}

/**
 * List of active game projects on Cartridge Arcade
 *
 * NOTE: This is a static list for SSR. It should be kept in sync with
 * the on-chain Registry. We use placeholders for model selectors as they
 * are computed dynamically in the client.
 *
 * The GraphQL API accepts projects with just namespace and project fields,
 * so we can leave model as empty string for now.
 */
export const ACTIVE_PROJECTS: Project[] = [
  {
    model: "", // Computed dynamically, not needed for GraphQL query
    namespace: "dopewars",
    project: "dopewars",
  },
  {
    model: "",
    namespace: "loot_survivor",
    project: "loot-survivor",
  },
  {
    model: "",
    namespace: "underdark",
    project: "underdark",
  },
  {
    model: "",
    namespace: "zkube",
    project: "zkube",
  },
  {
    model: "",
    namespace: "blobert",
    project: "blobert",
  },
  {
    model: "",
    namespace: "zdefender",
    project: "zdefender",
  },
  {
    model: "",
    namespace: "realm",
    project: "realm",
  },
  {
    model: "",
    namespace: "eternum",
    project: "eternum",
  },
  {
    model: "",
    namespace: "ponziland",
    project: "ponziland",
  },
  {
    model: "",
    namespace: "evolute_genesis",
    project: "evolute-genesis",
  },
  {
    model: "",
    namespace: "pistols",
    project: "pistols",
  },
];

/**
 * Get projects list from environment variable or use default
 *
 * Format: PROJECTS="namespace1:project1,namespace2:project2,..."
 *
 * Example:
 * PROJECTS="dopewars:dopewars,loot_survivor:loot-survivor"
 */
export function getProjects(): Project[] {
  const projectsEnv = process.env.PROJECTS;

  if (projectsEnv) {
    try {
      return projectsEnv.split(",").map((p) => {
        const [namespace, project] = p.trim().split(":");
        return {
          model: "",
          namespace: namespace.trim(),
          project: project.trim(),
        };
      });
    } catch (error) {
      console.error("Failed to parse PROJECTS env var, using defaults:", error);
    }
  }

  return ACTIVE_PROJECTS;
}
