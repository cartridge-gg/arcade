import { useState, useMemo } from "react";
import { useTokenDetailViewModel } from "./useTokenDetailViewModel";
import { TokenFooterActions } from "@/components/ui/marketplace/token-detail/TokenFooterActions";
import { TokenHeader } from "@/components/ui/marketplace/token-detail/TokenHeader";
import { AssetPreview } from "@/components/ui/marketplace/token-detail/AssetPreview";
import { TokenTabs } from "@/components/ui/marketplace/token-detail/TokenTabs";
import { TokenProperties } from "@/components/ui/marketplace/token-detail/TokenProperties";
import { addAddressPadding } from "starknet";

interface TokenDetailContainerProps {
  collectionAddress: string;
  tokenId: string;
}

export const TokenDetailContainer = ({
  collectionAddress,
  tokenId,
}: TokenDetailContainerProps) => {
  const [activeTab, setActiveTab] = useState<"activity" | "traits">("traits");

  const {
    token,
    collection,
    isLoading,
    isOwner,
    isListed,
    owner,
    handleBuy,
    handleList,
    handleUnlist,
    handleSend,
    orders,
  } = useTokenDetailViewModel({ collectionAddress, tokenId });

  const properties = useMemo(() => {
    if (!token?.metadata) return [];

    const metadata = token.metadata as any;
    const props = [];

    const hasTokenId = metadata.attributes?.find(
      (t: any) => (t.trait_type || t.trait) === "Token ID",
    );
    if (tokenId && undefined === hasTokenId)
      props.push({ name: "Token ID", value: addAddressPadding(tokenId) });

    if (metadata.attributes) {
      metadata.attributes.forEach((attr: any) => {
        const traitName = attr.trait_type || attr.trait;
        if (traitName && attr.value !== undefined) {
          props.push({ name: traitName, value: attr.value });
        }
      });
    }

    return props;
  }, [token, tokenId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-foreground-300">Loading...</p>
      </div>
    );
  }

  if (undefined === token) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-foreground-300">Token not found</p>
      </div>
    );
  }

  const tokenName =
    (token.metadata as any)?.name || token.name || `#${tokenId}`;
  const tokenImage = (token as any).image;

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex flex-col h-full gap-6">
          <TokenHeader
            name={tokenName}
            image={tokenImage}
            collectionName={collection?.name}
            collectionAddress={collectionAddress}
            tokenId={tokenId}
            owner={owner}
            isOwner={isOwner}
            verified
          />

          <AssetPreview
            image={tokenImage}
            name={tokenName}
            className="h-[360px]"
          />

          <TokenTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "traits" && properties.length > 0 && (
            <TokenProperties properties={properties} />
          )}

          {activeTab === "activity" && (
            <div className="flex items-center justify-center py-12">
              <p className="text-foreground-300 text-sm">No activity yet</p>
            </div>
          )}
        </div>
      </div>
      <TokenFooterActions
        orders={orders}
        isOwner={isOwner}
        isListed={isListed}
        handleBuy={handleBuy}
        handleSend={handleSend}
        handleList={handleList}
        handleUnlist={handleUnlist}
      />
    </div>
  );
};
