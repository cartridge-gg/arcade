import { useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import { TokenDetailContainer } from "@/features/marketplace/token-detail";
import { useProject } from "@/hooks/project";

export const TokenDetailScene = () => {
  const { collection } = useProject();
  const routerState = useRouterState();

  const tokenId = useMemo(() => {
    const segments = routerState.location.pathname.split("/").filter(Boolean);
    const collectionIndex = segments.findIndex((s) => s === "collection");
    if (collectionIndex >= 0 && segments.length > collectionIndex + 2) {
      return segments[collectionIndex + 2];
    }
    return undefined;
  }, [routerState.location.pathname]);

  if (!collection || !tokenId) return null;

  return (
    <TokenDetailContainer
      collectionAddress={collection}
      tokenId={tokenId}
    />
  );
};
