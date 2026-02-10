import { ShareIcon } from "@/components/ui/icons";
import { Button, Thumbnail, VerifiedIcon } from "@cartridge/ui";
import { useShare } from "@/hooks/useShare";
import { AnalyticsEvents } from "@/hooks/useAnalytics";
import { Link } from "@tanstack/react-router";
import { Username } from "@/components/user/username";
import { useDevice } from "@/hooks/device";

interface TokenHeaderProps {
  name: string;
  image: string;
  collectionName?: string;
  collectionAddress?: string;
  tokenId?: string;
  owner?: string;
  ownerUsername?: string | null;
  isOwner: boolean;
  ownedCount?: number | null;
  collectionHref?: string;
  ownerHref?: string;
  verified?: boolean;
}

export function TokenHeader({
  name,
  image,
  collectionName,
  collectionAddress,
  tokenId,
  owner,
  ownerUsername,
  isOwner,
  ownedCount,
  collectionHref,
  ownerHref,
  verified = true,
}: TokenHeaderProps) {
  const { handleShare } = useShare({
    title: name,
    text: `Check out ${name}${collectionName ? ` from ${collectionName}` : ""}`,
    url: `${window.location.origin}/collection/${collectionAddress}/${tokenId}`,
    analyticsEvent: {
      name: AnalyticsEvents.TOKEN_SHARED,
      properties: {
        token_id: tokenId,
        token_name: name,
        collection_address: collectionAddress,
        collection_name: collectionName,
      },
    },
  });
  const { isMobile } = useDevice();

  const displayOwner = owner && (isMobile || isOwner);

  return (
    <div className="flex justify-between gap-4 items-center">
      <div className="flex flex-row">
        <Thumbnail
          icon={`${image}?width=64&height=64`}
          size="xl"
          className="w-16 h-16 mr-3 self-center"
        />
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground-100 text-2xl font-semibold">{name}</h1>
          <div className="flex items-center gap-3">
            {collectionName && (
              <Link to={collectionHref} disabled={!collectionHref}>
                <div className="flex items-center gap-1.5 bg-background-150 rounded px-2 py-1">
                  {verified && (
                    <VerifiedIcon size="sm" className="text-foreground-300" />
                  )}
                  <span className="text-foreground-300 text-sm font-medium">
                    {collectionName}
                  </span>
                </div>
              </Link>
            )}
            {displayOwner && (
              <Link to={ownerHref} disabled={!ownerHref}>
                <div className="flex items-center gap-1.5 bg-background-150 rounded px-2 py-1">
                  {isOwner ? (
                    <span className="text-foreground-300 text-sm">
                      {ownedCount ? `You own ${ownedCount}` : "Owned by you"}
                    </span>
                  ) : (
                    <span className="text-foreground-300 text-sm">
                      Owned by{" "}
                      <Username username={ownerUsername} address={owner} />
                    </span>
                  )}
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full"
        onClick={handleShare}
      >
        <ShareIcon />
      </Button>
    </div>
  );
}
