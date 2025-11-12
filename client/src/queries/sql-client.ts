import { getToriiSqlUrl } from "@cartridge/arcade";

const API_URL = getToriiSqlUrl("arcade-main");

export interface SQLError {
  message: string;
  code?: string;
  details?: string;
}

export interface SQLResponse extends Array<any> {}

export async function sqlClient<T = any>(query: string): Promise<T[]> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: query,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: SQLResponse = await response.json();

  return data;
}

export function createSQLQueryFn<TData = any>(query: string) {
  console.log("createSQLQueryFn");
  return async (): Promise<TData[]> => {
    return sqlClient<TData>(query);
  };
}

// Utility functions for common SQL operations
export const sqlUtils = {
  // Build WHERE clause with parameters
  buildWhereClause: (
    conditions: Record<string, any>,
  ): { clause: string; params: Record<string, any> } => {
    const clauses: string[] = [];
    const params: Record<string, any> = {};
    let paramIndex = 1;

    for (const [key, value] of Object.entries(conditions)) {
      if (value !== undefined && value !== null) {
        const paramName = `param${paramIndex++}`;
        clauses.push(`${key} = :${paramName}`);
        params[paramName] = value;
      }
    }

    return {
      clause: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
      params,
    };
  },

  // Build ORDER BY clause
  buildOrderByClause: (orderBy: string | string[]): string => {
    if (typeof orderBy === "string") {
      return `ORDER BY ${orderBy}`;
    }
    return `ORDER BY ${orderBy.join(", ")}`;
  },

  // Build LIMIT clause
  buildLimitClause: (limit?: number, offset?: number): string => {
    if (limit === undefined) return "";
    if (offset === undefined) return `LIMIT ${limit}`;
    return `LIMIT ${limit} OFFSET ${offset}`;
  },
};
