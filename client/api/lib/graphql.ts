/**
 * Server-side GraphQL client for Vercel serverless functions
 */

const API_URL = process.env.VITE_CARTRIDGE_API_URL || "https://api.cartridge.gg";

export interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
}

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
}

/**
 * Make a GraphQL request to the Cartridge API
 * @param query - GraphQL query string
 * @param variables - Query variables
 * @returns Parsed response data
 */
export async function serverGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  // Create abort controller for request timeout (10 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json: GraphQLResponse<T> = await response.json();

    if (json.errors && json.errors.length > 0) {
      const errorMessage = json.errors.map((e) => e.message).join(", ");
      throw new Error(`GraphQL error: ${errorMessage}`);
    }

    if (!json.data) {
      throw new Error("No data returned from GraphQL query");
    }

    return json.data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout errors specifically
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("GraphQL request timed out");
      throw new Error("GraphQL request timed out after 10 seconds");
    }

    console.error("GraphQL request failed:", error);
    throw error;
  }
}

/**
 * GraphQL query to resolve username to address
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
 * GraphQL query to fetch player achievements
 * Note: Once backend supports playerId filter, add it here
 */
export const PROGRESSIONS_QUERY = `
  query Progressions($projects: [Project!]!, $playerId: String) {
    playerAchievements(projects: $projects, playerId: $playerId) {
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

/**
 * GraphQL query to fetch achievement definitions
 */
export const ACHIEVEMENTS_QUERY = `
  query Achievements($projects: [Project!]!) {
    achievements(projects: $projects) {
      items {
        meta {
          project
          model
          namespace
          count
        }
        achievements {
          id
          hidden
          page
          points
          start
          end
          achievementGroup
          icon
          title
          description
          taskId
          taskTotal
          taskDescription
          data
        }
      }
    }
  }
`;
