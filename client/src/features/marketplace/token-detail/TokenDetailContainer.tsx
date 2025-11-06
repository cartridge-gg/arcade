import { useTokenDetailViewModel } from "./useTokenDetailViewModel";

interface TokenDetailContainerProps {
  collectionAddress: string;
  tokenId: string;
}

export const TokenDetailContainer = ({
  collectionAddress,
  tokenId,
}: TokenDetailContainerProps) => {
  const {
    token,
    collection,
    isLoading,
    isOwner,
    isListed,
    handleBuy,
    handleList,
    handleUnlist,
    handleSend,
  } = useTokenDetailViewModel({ collectionAddress, tokenId });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <div>Token not found</div>;
  }

  return (
    <div>
      <h1>Token Detail Page</h1>
      <p>Collection: {collectionAddress}</p>
      <p>Token ID: {tokenId}</p>
      <p>Token Name: {token.name || "Untitled"}</p>
      {collection && <p>Collection Name: {collection.name}</p>}

      <div>
        {isOwner && !isListed && (
          <>
            <button onClick={handleList}>List</button>
            <button onClick={handleSend}>Send</button>
          </>
        )}
        {isOwner && isListed && <button onClick={handleUnlist}>Unlist</button>}
        {!isOwner && isListed && <button onClick={handleBuy}>Buy</button>}
      </div>
    </div>
  );
};
