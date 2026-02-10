import { UserAvatar } from "@/components/user/avatar";

export function Username({
  username,
  address,
}: {
  username: string | null | undefined;
  address: string;
}) {
  if (!username)
    return <span className="font-mono">{truncateAddress(address)}</span>;
  return (
    <span className="flex flex-row gap-1 items-center">
      <UserAvatar username={username} />
      {username}
    </span>
  );
}

export const truncateAddress = (rawAddress: string | null | undefined) => {
  if (!rawAddress) return "";
  const address = rawAddress.startsWith("0x")
    ? `0x${BigInt(rawAddress).toString(16)}`
    : rawAddress;
  return address.length > 13
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;
};
