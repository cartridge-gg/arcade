import { TokenDetailTemplate } from "@/components/token-detail-template";
import { TokenDetailContainer } from "@/features/marketplace/token-detail";
import { useProject } from "@/hooks/project";

export const TokenDetailPage = () => {
  const { collection, tokenId } = useProject();

  if (!collection || !tokenId) return null;

  return (
    <TokenDetailTemplate>
      <TokenDetailContainer collectionAddress={collection} tokenId={tokenId} />
    </TokenDetailTemplate>
  );
};
