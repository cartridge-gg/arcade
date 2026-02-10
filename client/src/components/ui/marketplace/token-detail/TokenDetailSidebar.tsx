import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useTokenDetailViewModel } from "@/features/marketplace/token-detail";
import { LayersIcon } from "@/components/ui/icons";
import { useProject } from "@/hooks/project";
import { cn } from "@/lib/utils";
import { truncateAddress, Username } from "@/components/user/username";

export function TokenDetailSidebar() {
  const { collection: collectionAddressParam, tokenId: tokenIdParam } =
    useProject();
  const {
    token,
    collection,
    ownerUsername,
    owner,
    collectible,
    collectionHref,
    ownerHref,
    contractHref,
  } = useTokenDetailViewModel({
    collectionAddress: collectionAddressParam ?? "0x0",
    tokenId: tokenIdParam ?? "0x0",
  });
  const tokenId = token?.token_id;

  const tokenIdStr = useMemo(
    () => BigInt(tokenId ?? "0x0").toString(10),
    [tokenId],
  );
  const collectionAddressTrunc = useMemo(
    () => truncateAddress(collectionAddressParam ?? "0x0"),
    [collectionAddressParam],
  );

  if (!collection || !tokenId) return null;

  const tokenStandard =
    collection.contract_type?.replace("ERC", "ERC-") ?? "Unknown";
  const collectionName = collection.name;
  const collectionSupply = collection.total_supply;

  return (
    <div
      className={cn(
        "w-full lg:min-w-[360px] h-full p-4 flex flex-col gap-6 bg-background-100",
        "border-r border-spacer-100 lg:border lg:border-background-200 lg:rounded-xl",
      )}
    >
      <div className="">
        <DetailTitle label="Details" />
        <div className="flex flex-col gap-[1px]">
          {collectible ? (
            <DetailItem label="Owners" hoverable>
              {collectible.ownersCount}
            </DetailItem>
          ) : (
            <Link to={ownerHref}>
              <DetailItem label="Owner" hoverable>
                <Username username={ownerUsername} address={owner} />
              </DetailItem>
            </Link>
          )}
          <Link to={contractHref} disabled={!contractHref} target="_blank">
            <DetailItem label="Contract Address" hoverable>
              {collectionAddressTrunc}
            </DetailItem>
          </Link>
          <DetailItem label="Token ID" copyable>
            {truncateAddress(tokenIdStr)}
          </DetailItem>
          <DetailItem label="Token Standard">{tokenStandard}</DetailItem>
        </div>
      </div>

      <div className="">
        <DetailTitle label="Collection" />
        <Link to={collectionHref}>
          <DetailItem
            label={
              <CollectionName name={collectionName} img={collection.image} />
            }
            hoverable
          >
            <CollectionSupply supply={collectionSupply} />
          </DetailItem>
        </Link>
      </div>
    </div>
  );
}

function DetailTitle({ label }: { label: string }) {
  return (
    <div className="flex flex-row justify-between py-2">
      <span className="text-foreground-300 text-xs font-sans">{label}</span>
    </div>
  );
}

function DetailItem({
  label,
  hoverable = false,
  copyable = false,
  children,
}: React.PropsWithChildren<{
  label: React.ReactNode;
  hoverable?: boolean;
  copyable?: boolean;
}>) {
  return (
    <div
      className={cn(
        "flex flex-row justify-between bg-background-200 py-[10px] px-3 first:rounded-t-md last:rounded-b-md items-center",
        hoverable && "hover:bg-background-300",
      )}
    >
      <span className="text-foreground-300 text-xs font-sans">{label}</span>
      <span
        className={cn(
          "text-foreground-100 text-sm font-medium font-mono",
          copyable && "select-all",
        )}
      >
        {children}
      </span>
    </div>
  );
}

function CollectionName({ name, img }: { name: string; img: string }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={`${img}?width=28&height=28`}
        className="w-[28px] h-[28px]"
        alt={`${name} collection`}
        aria-label={`${name} collection`}
      />
      <span className="ml-1">{name}</span>
    </div>
  );
}

function CollectionSupply({ supply }: { supply: string }) {
  const supplyStr = useMemo(
    () => BigInt(supply ?? "0x0").toString(10),
    [supply],
  );

  return (
    <span className="flex flex-row rounded-xl bg-translucent-dark-100 py-[4px] px-[6px] items-center">
      <LayersIcon />
      <span className="font-sans ml-1">{supplyStr}</span>
    </span>
  );
}
