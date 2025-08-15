import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';

export interface Account {
  address: string;
  username: string;
  avatar?: string;
  createdAt?: string;
}

async function fetchAccountName(address: string): Promise<string | undefined> {
  // TODO: Replace with actual Cartridge API call
  // This should use @cartridge/ui/utils/api/cartridge useAccountNameQuery
  throw new Error('TODO: implement me at users/accounts.ts - Need to integrate Cartridge API for fetching username');
}

async function fetchAccountNames(addresses: string[]): Promise<Record<string, string>> {
  // TODO: Replace with actual Cartridge API call
  // This should use @cartridge/ui/utils/api/cartridge useAccountNamesQuery
  throw new Error('TODO: implement me at users/accounts.ts - Need to integrate Cartridge API for fetching multiple usernames');
}

export function useAccountNameQuery(address: string) {
  return useQuery({
    queryKey: queryKeys.users.account(address),
    queryFn: () => fetchAccountName(address),
    enabled: !!address,
    ...queryConfigs.users,
  });
}

export function useAccountNamesQuery(addresses: string[]) {
  return useQuery({
    queryKey: queryKeys.users.accounts(addresses),
    queryFn: () => fetchAccountNames(addresses),
    enabled: addresses.length > 0,
    ...queryConfigs.users,
  });
}

// Query for batch username resolution with caching
export function useBatchUsernamesQuery(addresses: string[]) {
  return useQuery({
    queryKey: queryKeys.users.accounts(addresses),
    queryFn: async () => {
      const usernames = await fetchAccountNames(addresses);
      // Transform to array format if needed
      return addresses.map(addr => ({
        address: addr,
        username: usernames[addr] || undefined,
      }));
    },
    enabled: addresses.length > 0,
    ...queryConfigs.users,
  });
}