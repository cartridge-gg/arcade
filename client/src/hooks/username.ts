import { useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import type ControllerConnector from "@cartridge/connector/controller";

export function useUsername(): string | undefined {
  const { account, connector } = useAccount();
  const [username, setUSername] = useState<string>();
  useEffect(() => {
    if (account && connector) {
      (connector as ControllerConnector)
        .username()
        ?.then((u) => setUSername(u));
    }
  }, [account, connector]);

  return username;
}
