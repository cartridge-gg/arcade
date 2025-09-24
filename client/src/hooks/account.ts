import {
  useAccountNameQuery,
  useAccountNamesQuery,
} from "@cartridge/ui/utils/api/cartridge";

export function useUsername({ address }: { address: string }) {
  const { data } = useAccountNameQuery(
    { address: `0x${BigInt(address).toString(16)}` },
    {
      queryKey: ["username", address],
      cacheTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      enabled: !!address && BigInt(address) !== 0n,
    },
  );

  return { username: data?.accounts?.edges?.[0]?.node?.username ?? "" };
}

export function useUsernames({ addresses }: { addresses: string[] }) {
  const { data } = useAccountNamesQuery(
    { addresses },
    {
      queryKey: ["usernames", addresses],
      cacheTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      enabled: addresses.length > 0,
    },
  );

  return {
    usernames:
      data?.accounts?.edges?.map((edge) => ({
        username: edge?.node?.username,
        address: edge?.node?.controllers?.edges?.[0]?.node?.address,
      })) ?? [],
  };
}
