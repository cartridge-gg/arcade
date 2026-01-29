import { Button, SignOutIcon, Skeleton } from "@cartridge/ui";
import { Link } from "@tanstack/react-router";
import { UserAvatar } from "@/components/user/avatar";
import type { ConnectionViewModel } from "@/features/connection/useConnectionViewModel";

export const ConnectionView = ({
  status,
  username,
  onConnect,
  onOpenProfile,
  onDisconnect,
  isConnectDisabled,
  isFetchingUsername,
}: ConnectionViewModel) => {
  if (status === "loading" || isFetchingUsername) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    );
  }

  if (status === "disconnected") {
    return (
      <Button
        variant="secondary"
        className="border border-primary-100 text-primary hover:text-spacer bg-background-100 hover:bg-primary transition-colors text-sm font-medium select-none px-4 py-2.5"
        disabled={isConnectDisabled}
        onClick={onConnect}
      >
        <span className="font-medium text-sm">Connect</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        className="bg-background-100 hover:bg-background-150 px-3 py-2.5 select-none border border-background-200"
        onClick={onOpenProfile}
      >
        <div className="size-5 flex items-center justify-center">
          <UserAvatar username={username || ""} size="sm" />
        </div>
        <p className="text-sm font-medium normal-case">{username}</p>
      </Button>
      <Link to="/">
        <button
          type="button"
          onClick={onDisconnect}
          className="p-2 rounded bg-background-100 hover:bg-background-150 outline outline-1 outline-background-200"
        >
          <SignOutIcon size="default" />
        </button>
      </Link>
    </div>
  );
};
