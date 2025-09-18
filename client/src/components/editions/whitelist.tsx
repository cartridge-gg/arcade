import type { EditionModel } from "@cartridge/arcade";
import { useAccount } from "@starknet-react/core";
import { useArcade } from "@/hooks/arcade";
import { useCallback, useMemo, useState } from "react";
import type ControllerConnector from "@cartridge/connector/controller";
import { constants } from "starknet";
import ControllerAction from "../modules/controller-action";

export function Whitelist({
  edition,
  action,
  setWhitelisted,
}: {
  edition: EditionModel;
  action: "whitelist" | "blacklist";
  setWhitelisted: (whitelisted: boolean) => void;
}) {
  const { account, connector } = useAccount();
  const { provider } = useArcade();
  const [loading, setLoading] = useState(false);

  const disabled = useMemo(() => {
    if (!edition) return true;
    return (
      !edition.published ||
      (edition.whitelisted && action === "whitelist") ||
      (!edition.whitelisted && action === "blacklist")
    );
  }, [edition]);

  const handleClick = useCallback(() => {
    if (!edition || !account || disabled) return;
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) return;
    const process = async () => {
      setLoading(true);
      try {
        const args = { editionId: edition.id };
        const calls =
          action === "whitelist"
            ? provider.registry.whitelist_edition(args)
            : provider.registry.blacklist_edition(args);
        controller.switchStarknetChain(constants.StarknetChainId.SN_MAIN);
        await account.execute(calls);
        setWhitelisted(action === "whitelist");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    process();
  }, [account, disabled, edition, setWhitelisted]);

  return (
    <ControllerAction
      disabled={disabled || loading}
      loading={loading}
      label={action === "whitelist" ? "Whitelist" : "Blacklist"}
      Icon={
        <div className="h-5 w-5 p-[3px] flex items-center justify-center">
          {action === "whitelist" ? (
            <i className="fa-circle-check fa-solid h-full w-full" />
          ) : (
            <i className="fa-circle-xmark fa-solid h-full w-full" />
          )}
        </div>
      }
      onClick={disabled ? undefined : handleClick}
    />
  );
}
