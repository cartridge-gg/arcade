import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import {
  useAccountNameQuery as useCartridgeAccountNameQuery,
  useAccountNamesQuery as useCartridgeAccountNamesQuery,
} from "@cartridge/ui/utils/api/cartridge";

export interface Account {
  address: string;
  username: string;
  avatar?: string;
  createdAt?: string;
}

export function useAccountNameQuery(address: string) {
  // Use the Cartridge API hook directly
  const result = useCartridgeAccountNameQuery(
    { address },
    {
      queryKey: queryKeys.users.account(address),
      enabled: !!address,
      ...queryConfigs.users,
    },
  );

  // Return with proper typing
  return {
    ...result,
    data: result.data?.username as string | undefined,
  };
}

export function useAccountNamesQuery(addresses: string[]) {
  // Use the Cartridge API hook directly
  const result = useCartridgeAccountNamesQuery(
    { addresses },
    {
      queryKey: queryKeys.users.accounts(addresses),
      enabled: addresses.length > 0,
      ...queryConfigs.users,
    },
  );

  // Return with proper typing
  return {
    usernames:
      result.data?.accounts?.edges?.map((edge) => ({
        username: edge?.node?.username,
        address: edge?.node?.controllers?.edges?.[0]?.node?.address,
      })) ?? [],
  };
}
