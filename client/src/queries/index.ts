// Main entry point for all queries
export * from './queryClient';
export * from './keys';

// Export all domain queries
export * from './achievements';
export * from './activities';
export * from './marketplace';
export * from './inventory';
export * from './tokens';
export * from './users';
export * from './discovery';
export * from './games';
export * from './torii';

// Re-export key types for convenience
export type { QueryKeyFactory } from './keys';

// Export query client and configs for setup
export { queryClient, queryConfigs } from './queryClient';
export { queryKeys } from './keys';