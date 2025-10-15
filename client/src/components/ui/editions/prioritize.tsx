import type { EditionModel } from "@cartridge/arcade";
import { useCallback, useMemo, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { useArcade } from "@/hooks/arcade";
import type ControllerConnector from "@cartridge/connector/controller";
import type { Call } from "starknet";
import ControllerAction from "../modules/controller-action";

export function Prioritize({
  edition,
  editions,
  direction,
}: {
  edition: EditionModel;
  editions: EditionModel[];
  direction: "up" | "down";
}) {
  const { account, connector } = useAccount();
  const { provider } = useArcade();
  const [loading, setLoading] = useState(false);

  const disabled = useMemo(() => {
    if (!edition || editions.length === 0) return true;
    // Find index of the current edition in the list, sorted by priority (from highest to lowest)
    const sortedEditions = editions.sort((a, b) => b.priority - a.priority);
    const index = sortedEditions.findIndex((e) => e.id === edition.id);
    // Find if there is 2 editions with the same priority
    const dup =
      editions.filter((e) => e.priority === edition.priority).length > 1;
    // If the action is to prioritize up, check ig the edition is not already the top priority and none other edition has the same prioriy
    if (index === 0 && !dup && direction === "up") return true;
    // If the action is to prioritize down, check if the edition is not already the lowest priority and none other edition has the same prioriy
    if (index === editions.length - 1 && !dup && direction === "down")
      return true;
    return false;
  }, [edition, editions]);

  const handleClick = useCallback(() => {
    if (!edition || !account || disabled) return;
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) return;
    const process = async () => {
      setLoading(true);
      try {
        // Reset the priority of all the editions, and moving the current edition to the expected direction
        const sortedEditions = editions.sort((a, b) => b.priority - a.priority);
        // Swap the current edition with the next one
        const currentIndex = sortedEditions.findIndex(
          (e) => e.id === edition.id,
        );
        const nextIndex =
          direction === "up" ? currentIndex - 1 : currentIndex + 1;
        // Resort the editions
        const newEditions = [...sortedEditions];
        newEditions[currentIndex] = sortedEditions[nextIndex];
        newEditions[nextIndex] = sortedEditions[currentIndex];
        // Create the multicall
        const calls = newEditions.map((e, index) => {
          const priority = newEditions.length - index - 1;
          const args = { editionId: e.id, priority: priority };
          return provider.registry.prioritize_edition(args) as Call;
        });
        await account.execute(calls);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    process();
  }, [account, disabled, edition, editions]);

  return (
    <ControllerAction
      disabled={disabled || loading}
      loading={loading}
      label={direction === "up" ? "Move up" : "Move down"}
      Icon={
        <div className="h-5 w-5 p-[3px] flex items-center justify-center">
          {direction === "up" ? (
            <i className="fa-chevron-up fa-solid h-full w-full" />
          ) : (
            <i className="fa-chevron-down fa-solid h-full w-full" />
          )}
        </div>
      }
      onClick={disabled ? undefined : handleClick}
    />
  );
}
