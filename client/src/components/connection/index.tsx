import { useAccount } from "@starknet-react/core";
import { User } from "./user";
import { Connect } from "./connect";

export function Connection() {
  const { account } = useAccount();
  const { isConnected } = useAccount();

  if (!isConnected || !account) return <Connect />;
  return <User />;
}
