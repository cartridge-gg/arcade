const API_URL = import.meta.env.VITE_CARTRIDGE_API_URL || 'https://api.cartridge.gg';

export interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
    [key: string]: any;
  };
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: GraphQLError[];
}

export async function graphqlClient<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const response = await fetch(`${API_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors && json.errors.length > 0) {
    const errorMessage = json.errors.map(e => e.message).join(', ');
    throw new Error(`GraphQL error: ${errorMessage}`);
  }

  if (!json.data) {
    throw new Error('No data returned from GraphQL query');
  }

  return json.data;
}

export function createGraphQLQueryFn<TVariables = any, TData = any>(
  query: string
) {
  return async (variables: TVariables): Promise<TData> => {
    return graphqlClient<TData>(query, variables as Record<string, any>);
  };
}