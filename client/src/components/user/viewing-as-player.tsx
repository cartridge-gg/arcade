import { useNavigationContext } from "@/features/navigation";
import { useMemo } from "react";
import { UserAvatar } from "./avatar";
import { ContextCloser } from "../ui/modules/context-closer";
import { useAccountByAddress } from "@/effect";
type PlayerProps = {
  player: string;
  username?: string;
};

export function ViewingAsPlayerBannerInformation() {
  const { manager } = useNavigationContext();

  const player = useMemo(() => manager.getParams().player, [manager]);

  const playerUsername = useAccountByAddress(player);

  const hasPlayer = useMemo(() => undefined !== player, [player]);

  if (!hasPlayer) return null;
  return (
    <div className="flex flex-row px-3 py-1.5 border-b border-background-200 bg-background-125 justify-between lg:hidden">
      <div className="spacer-left" />
      <PlayerNameDisplay
        player={player as string}
        username={playerUsername.data?.username}
      />
      <div className="self-center">
        <ContextCloser variant={"muted"} className="w-4 h-4" />
      </div>
    </div>
  );
}

function PlayerNameDisplay({ player, username }: PlayerProps) {
  return (
    <div className="flex flex-row text-foreground-300 font-sans items-center text-sm font-normal gap-1">
      <span>Viewing</span>
      <PlayerTag player={player} username={username} />
      <span>'s controller</span>
    </div>
  );
}

function PlayerTag({ player, username }: PlayerProps) {
  return (
    <span className="flex flex-row text-primary-100 items-center border border-translucent-light-100 rounded-md py-0.5 px-1 gap-0.5">
      <UserAvatar username={player} size="xs" />
      <span className="text-sm font-medium px-0.5">{username || player}</span>
    </span>
  );
}
