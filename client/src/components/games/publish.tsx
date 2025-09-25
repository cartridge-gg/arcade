import { GameModel } from "@cartridge/arcade";
import { useAccount } from "@starknet-react/core";
import { useArcade } from "@/hooks/arcade";
import { useCallback, useMemo, useState } from "react";
import ControllerConnector from "@cartridge/connector/controller";
import { constants } from "starknet";
import ControllerAction from "../modules/controller-action";

export function Publish({
  game,
  action,
  setPublished,
}: {
  game: GameModel;
  action: "publish" | "hide";
  setPublished: (published: boolean) => void;
}) {
  const { account, connector } = useAccount();
  const { provider } = useArcade();
  const [loading, setLoading] = useState(false);

  const disabled = useMemo(() => {
    if (!game) return true;
    return (
      (game.published && action === "publish") ||
      (!game.published && action === "hide")
    );
  }, [game]);

  const handleClick = useCallback(() => {
    if (!game || !account || disabled) return;
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) return;
    const process = async () => {
      setLoading(true);
      try {
        const args = { gameId: game.id };
        const calls =
          action === "publish"
            ? provider.registry.publish_game(args)
            : provider.registry.hide_game(args);
        controller.switchStarknetChain(constants.StarknetChainId.SN_MAIN);
        await account.execute(calls);
        setPublished(action === "publish");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    process();
  }, [account, disabled, game]);

  return (
    <ControllerAction
      disabled={disabled || loading}
      loading={loading}
      label={action === "publish" ? "Publish" : "Hide"}
      Icon={
        <div className="h-5 w-5 p-[3px] flex items-center justify-center">
          {action === "publish" ? (
            <i className="fa-rocket fa-solid h-full w-full" />
          ) : (
            <i className="fa-eye-slash fa-solid h-full w-full" />
          )}
        </div>
      }
      onClick={disabled ? undefined : handleClick}
    />
  );
}
