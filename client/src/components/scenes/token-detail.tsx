import { TokenDetailContainer } from "@/features/marketplace/token-detail";
import { useProject } from "@/hooks/project";

export const TokenDetailScene = () => {
  const { collection, tokenId } = useProject();

  if (!collection || !tokenId) return null;

  return (
    <TokenDetailContainer collectionAddress={collection} tokenId={tokenId} />
  );
};
