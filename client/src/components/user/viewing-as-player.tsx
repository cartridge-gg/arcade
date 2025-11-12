import { useNavigationContext } from "@/features/navigation";
import { useMemo } from "react";
import { UserAvatar } from "./avatar";
import { ContextCloser } from "../ui/modules/context-closer";
type PlayerProps = {
  player: string;
};

export function ViewingAsPlayerBannerInformation() {
  const { manager } = useNavigationContext();

  const player = useMemo(() => manager.getParams().player, [manager]);
  const hasPlayer = useMemo(() => undefined !== player, [player]);

  if (!hasPlayer) return null;
  return (
    <div className="flex flex-row px-[12px] py-[6px] border-b border-background-200 bg-background-125 justify-between lg:hidden">
      <div className="spacer-left" />
      <PlayerNameDisplay player={player as string} />
      <div className="self-center">
        <ContextCloser variant={"muted"} />
      </div>
    </div>
  );
}

function PlayerNameDisplay({ player }: PlayerProps) {
  return (
    <div className="flex flex-row text-foreground-300 font-sans items-center text-sm gap-1">
      <span>Viewing</span>
      <PlayerTag player={player} />
      <span>'s controller</span>
    </div>
  );
}

function PlayerTag({ player }: PlayerProps) {
  return (
    <span className="flex flex-row text-primary-100 items-center border border-translucent-light-100 rounded-md py-[2px] px-[4px] zb">
      <UserAvatar username={player} size={"xs"} />
      {player}
    </span>
  );
}
