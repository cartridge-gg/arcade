import { Collections } from "./collections";
import { Tokens } from "./tokens";
import { useTokens } from "@/hooks/tokens";
import { useTokenContracts } from "@/collections";

export const Inventory = () => {
  const { tokens, credits, status: tokensStatus } = useTokens();
  const { data: collections, status: collectionsStatus } = useTokenContracts();

  return (
    <div className="w-full flex flex-col gap-4 py-3 lg:py-6 rounded">
      <Tokens tokens={tokens} credits={credits} status={tokensStatus} />
      <Collections collections={collections} status={collectionsStatus} />
    </div>
  );
};
