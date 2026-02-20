"use client";

import { useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import {
  CONTROLLER_TOAST_MESSAGE_TYPE,
  type ToastOptions,
} from "@cartridge/ui";
import type ControllerConnector from "@cartridge/connector/controller";

export function useControllerUsername(): string | undefined {
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

export function useControllerCloseAfterToast() {
  const { connector } = useAccount();
  useEffect(() => {
    if (!connector) return;

    const eventHandler = (event: any) => {
      const options =
        event.data.type === CONTROLLER_TOAST_MESSAGE_TYPE
          ? (event.data.options as ToastOptions)
          : undefined;

      if (options?.safeToClose) {
        const controller = (connector as ControllerConnector)?.controller;
        controller?.close();
      }
    };

    window.addEventListener("message", eventHandler);
    return () => {
      window.removeEventListener("message", eventHandler);
    };
  }, [connector]);
}
