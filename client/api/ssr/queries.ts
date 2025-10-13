/**
 * GraphQL query definitions
 */

import type { Project } from "./types";

/**
 * Query to resolve username to Starknet address
 */
export const ADDRESS_BY_USERNAME_QUERY = `
  query AddressByUsername($username: String!) {
    account(username: $username) {
      controllers(first: 1) {
        edges {
          node {
            address
          }
        }
      }
    }
  }
`;

/**
 * Format projects array to GraphQL input syntax (not JSON)
 * GraphQL requires unquoted keys: { model: "", namespace: "..." }
 * JSON would be wrong: {"model":"","namespace":"..."}
 */
function formatProjectsForGraphQL(projects: Project[]): string {
  return projects
    .map(p => `{ model: "${p.model}", namespace: "${p.namespace}", project: "${p.project}" }`)
    .join(', ');
}

/**
 * Build progressions query
 * Note: The API returns achievements for ALL players in the projects.
 * We filter by playerId client-side in computePlayerStats()
 */
export function buildProgressionsQuery(projects: Project[]): string {
  return `
    query PlayerAchievements {
      playerAchievements(
        projects: [${formatProjectsForGraphQL(projects)}]
      ) {
        items {
          meta {
            project
            model
            namespace
            count
          }
          achievements {
            playerId
            achievementId
            points
            taskId
            taskTotal
            total
            completionTime
          }
        }
      }
    }
  `;
}
