import { useCallback, useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import type { Token } from "@/types/torii";
import type { OrderModel } from "@cartridge/arcade";
import { useMarketBalancesFetcher } from "@/hooks/marketplace-balances-fetcher";
import { DEFAULT_PROJECT } from "@/constants";
import { addAddressPadding, getChecksumAddress } from "starknet";
import { useArcade } from "@/hooks/arcade";
import { useAccountByAddress, useMarketplaceTokens } from "@/effect";
import { collectionOrdersAtom } from "@/effect/atoms";
import { CollectionType } from "@/effect/atoms/tokens";
import { useAtomValue } from "@effect-atom/atom-react";
import { useNavigationManager } from "@/features/navigation/useNavigationManager";
import { VoyagerUrl } from "@cartridge/ui/utils";
import { getChainId } from "@/lib/helpers";
import {
  useHandlePurchaseCallback,
  useHandleListCallback,
  useHandleSendCallback,
  useHandleUnlistCallback,
  useHandleUnlistViewCallback,
} from "@/hooks/marketplace-actions-handlers";
import { useProject } from "@/hooks/project";

interface UseTokenDetailViewModelArgs {
  collectionAddress: string;
  tokenId: string;
}

interface TokenDetailViewModel {
  token: Token | undefined;
  collection: ReturnType<typeof useMarketplaceTokens>["collection"];
  orders: OrderModel[];
  lowestOrder: OrderModel | null;
  isLoading: boolean;
  isListed: boolean;
  isOwner: boolean;
  owner: string;
  ownerUsername: string | null;
  collectible?: {
    // when ERC-1155
    tokenSupply: number;
    ownersCount: number;
    ownedCount: number;
  };
  collectionHref: string;
  ownerHref: string;
  contractHref: string | undefined;
  handlePurchase: () => Promise<void>;
  handleList: () => Promise<void>;
  handleUnlist: () => Promise<void>;
  handleSend: () => Promise<void>;
}

export function useTokenDetailViewModel({
  collectionAddress,
  tokenId,
}: UseTokenDetailViewModelArgs): TokenDetailViewModel {
  const { address } = useAccount();
  const { provider } = useArcade();
  const { edition } = useProject();

  const {
    collection,
    tokens: rawTokens,
    status,
  } = useMarketplaceTokens(DEFAULT_PROJECT, collectionAddress, {
    tokenIds: [tokenId],
  });

  const isERC1155 = useMemo(
    () => collection?.contract_type === CollectionType.ERC1155,
    [collection],
  );

  const { balances } = useMarketBalancesFetcher({
    project: [DEFAULT_PROJECT],
    address: collectionAddress,
    tokenId,
  });

  const collectible = useMemo(() => {
    if (!isERC1155 || !balances) return undefined;
    const tokenSupply = balances.reduce(
      (acc, balance) => acc + Number(BigInt(balance.balance)),
      0,
    );
    const ownersCount = balances.length;
    const ownedBalance = balances.find(
      (b) => address && BigInt(b.account_address) === BigInt(address),
    );
    const ownedCount = Number(BigInt(ownedBalance?.balance ?? 0));
    return {
      tokenSupply,
      ownersCount,
      ownedCount,
    };
  }, [isERC1155, balances, address]);

  const owner = useMemo(() => {
    if (collectible) {
      return collectible.ownedCount > 0
        ? addAddressPadding(address as string)
        : "0x0";
    }
    if (balances && balances.length === 1) {
      return addAddressPadding(balances[0].account_address);
    }
    const addr = balances.find((b) => BigInt(b.balance) > 0n)?.account_address;
    return addr ? addAddressPadding(addr) : "0x0";
  }, [balances, collectible]);

  const isOwner = useMemo(
    () =>
      undefined !== address &&
      getChecksumAddress(addAddressPadding(address)) ===
        getChecksumAddress(addAddressPadding(owner)),
    [address, owner],
  );

  const ownerUsername = useAccountByAddress(owner)?.data?.username || null;

  const token = useMemo(() => {
    if (!rawTokens || rawTokens.length === 0) return undefined;
    return rawTokens.find((t) => {
      const tid = t.token_id?.toString();
      return tid === tokenId || tid === `0x${tokenId}`;
    });
  }, [rawTokens, tokenId]);

  const collectionOrders = useAtomValue(
    collectionOrdersAtom(collectionAddress),
  );

  const orders = useMemo(() => {
    if (!collectionOrders || !tokenId) return [];

    const candidates = new Set<string>();
    candidates.add(tokenId);

    if (tokenId.startsWith("0x")) {
      try {
        const numericId = BigInt(tokenId).toString();
        candidates.add(numericId);
      } catch (error) {
        candidates.add(BigInt(`0x${tokenId}`).toString());
      }
    } else {
      candidates.add(BigInt(`0x${tokenId}`).toString());
    }

    for (const candidate of candidates) {
      const tokenOrders = collectionOrders[candidate];
      if (tokenOrders?.length) {
        return tokenOrders;
      }
    }

    return [];
  }, [collectionOrders, tokenId]);

  const lowestOrder = useMemo(
    () => (orders.length > 0 ? orders[0] : null),
    [orders],
  );

  const isListed = !!lowestOrder;

  const isLoading = status === "loading" || status === "idle";

  const navManager = useNavigationManager();

  const collectionHref = useMemo(
    () => navManager.generateCollectionHref(collectionAddress),
    [navManager, collectionAddress],
  );

  const ownerHref = useMemo(
    () => navManager.generatePlayerHref(owner),
    [navManager, owner],
  );

  const contractHref = useMemo(() => {
    const chainId = getChainId(provider.provider.channel.nodeUrl);
    return chainId
      ? VoyagerUrl(chainId).contract(collectionAddress)
      : undefined;
  }, [navManager, collectionAddress]);

  const handlerParams = useMemo(
    () => ({
      project: edition?.config.project,
      preset: edition?.properties.preset,
    }),
    [edition?.id],
  );

  const handlePurchaseCallback = useHandlePurchaseCallback(handlerParams);
  const handleListCallback = useHandleListCallback(handlerParams);
  const handleUnlistCallback = useHandleUnlistCallback();
  const handleUnlistViewCallback = useHandleUnlistViewCallback(handlerParams);
  const handleSendCallback = useHandleSendCallback(handlerParams);

  const handlePurchase = useCallback(async () => {
    if (lowestOrder) {
      handlePurchaseCallback(collectionAddress, [tokenId], [lowestOrder]);
    }
  }, [handlePurchaseCallback, collectionAddress, tokenId, lowestOrder]);

  const handleList = useCallback(async () => {
    handleListCallback(collectionAddress, [tokenId]);
  }, [handleListCallback, collectionAddress, tokenId]);

  const handleUnlist = useCallback(async () => {
    if (lowestOrder) {
      handleUnlistCallback(collectionAddress, [tokenId], [lowestOrder]);
    } else {
      handleUnlistViewCallback(collectionAddress, [tokenId]);
    }
  }, [handleUnlistCallback, collectionAddress, tokenId]);

  const handleSend = useCallback(async () => {
    handleSendCallback(collectionAddress, [tokenId]);
  }, [handleSendCallback, collectionAddress, tokenId]);

  return {
    token,
    collection,
    orders,
    lowestOrder,
    isLoading,
    isListed,
    isOwner,
    owner,
    ownerUsername,
    collectible,
    collectionHref,
    ownerHref,
    contractHref,
    handlePurchase,
    handleList,
    handleUnlist,
    handleSend,
  };
}
