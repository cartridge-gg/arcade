import { useCollections } from "@/hooks/collections";
import { Collections } from "./collections";
import { Tokens } from "./tokens";
import { useTokens } from "@/hooks/tokens";

export const Inventory = () => {
  const { tokens, credits, status: tokensStatus } = useTokens();
  const { collections, status: collectionsStatus } = useCollections();

  return (
    <div className="w-full flex flex-col gap-4 py-3 lg:py-6 rounded">
      <Tokens tokens={tokens} credits={credits} status={tokensStatus} />
      <Collections collections={collections} status={collectionsStatus} />
    </div>
  );
};
