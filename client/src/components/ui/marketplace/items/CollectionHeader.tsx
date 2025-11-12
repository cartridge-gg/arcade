import { cn } from "@/lib/utils";
import { Thumbnail, VerifiedIcon } from "@cartridge/ui";
import type { EditionModel, GameModel, Socials } from "@cartridge/arcade";
import { useMarketplaceItemsViewModel } from "@/features/marketplace/items";
import { useShare } from "@/hooks/useShare";
import { AnalyticsEvents } from "@/hooks/useAnalytics";
import { ShareIcon } from "../../icons";
import { Button } from "../../button";

type CollectionHeaderProps = {
  isDashboard: boolean;
  isMobile: boolean;
  edition?: EditionModel;
  game?: GameModel;
  arcade: string;
  socials?: Socials;
  collectionAddress: string;
};

export function CollectionHeader({
  edition,
  game,
  arcade,
  collectionAddress,
}: CollectionHeaderProps) {
  const { collection } = useMarketplaceItemsViewModel({ collectionAddress });

  const { handleShare } = useShare({
    title: collection?.name ?? "Collection",
    text: `Check out ${collection?.name ?? "this collection"} on ${game?.name ?? "Arcade"}`,
    url: `${window.location.origin}/collection/${collectionAddress}`,
    analyticsEvent: {
      name: AnalyticsEvents.COLLECTION_SHARED,
      properties: {
        collection_address: collectionAddress,
        collection_name: collection?.name,
        game_name: game?.name,
      },
    },
  });

  return (
    <div className={cn("w-full flex flex-col gap-4 pb-5")}>
      <div className="flex flex-col gap-4 rounded-lg lg:p-0">
        <div className="flex items-start justify-between">
          <div className={cn("flex gap-4 items-center overflow-hidden")}>
            <Thumbnail
              icon={edition?.properties.icon || game?.properties.icon || arcade}
              size="xl"
              className="min-w-16 min-h-16"
            />
            <div className="flex flex-col gap-2 overflow-hidden">
              <p className="font-semibold text-xl/[24px] text-foreground-100 truncate">
                {collection?.name || "Dashboard"}
              </p>
              <GameName game={game} />
            </div>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-background-150"
            onClick={handleShare}
          >
            <ShareIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

function GameName({ game }: { game: GameModel | undefined }) {
  if (!game) return null;
  return (
    <div className="flex items-stretch gap-2 h-8 bg-background-150 px-2 rounded-md">
      <div className="grow flex justify-end items-center self-center">
        <VerifiedIcon size="sm" className="text-foreground-400" />
        <span className="text-sm text-start font-normal text-foreground-400 truncate">
          {game.name}
        </span>
      </div>
    </div>
  );
}
