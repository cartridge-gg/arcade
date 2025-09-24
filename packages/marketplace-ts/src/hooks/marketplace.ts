import { useContext, useState, useEffect } from "react";
import { MarketplaceContext } from "../contexts/marketplace";
import type { Account, AccountInterface, BigNumberish } from "starknet";
import { CallData, constants } from "starknet";
import { getContractByName } from "@dojoengine/core";
import { NAMESPACE } from "../constants";
import type { OrderModel } from "../modules/marketplace";
import { cairo } from "starknet";
import { useConfig } from ".";

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (ctx === null) {
    throw new Error(
      "useMarketplaceActions must be used within a MarketplaceProvider",
    );
  }

  return ctx;
}

export function useOrderValidity(order: OrderModel) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { getValidity } = useMarketplaceActions();

  useEffect(() => {
    const checkValidity = async () => {
      try {
        const validity = await getValidity(
          order.id,
          order.collection,
          order.tokenId,
        );
        setIsValid(Boolean(validity));
      } catch (error) {
        console.error("Error checking order validity:", error);
        setIsValid(false);
      }
    };
    checkValidity();
  }, [order, getValidity]);

  return isValid;
}

export function useMarketplaceActions() {
  const config = useConfig(constants.StarknetChainId.SN_MAIN);
  const ctx = useMarketplace();

  const {
    cancel,
    remove,
    grantRole,
    pause,
    resume,
    revokeRole,
    setFee,
    buildListCalldata,
    buildOfferCalldata,
    buildExecuteCalldata,
    getValidity,
  } = ctx.provider.marketplace;
  // Overidding offer action with approve to currency contract first
  const offer = async (
    snAccount: Account | AccountInterface,
    collection: string,
    tokenId: BigNumberish,
    quantity: BigNumberish,
    price: BigNumberish,
    currency: string,
    expiration: BigNumberish,
  ) => {
    try {
      const calls = buildOfferCalls(
        collection,
        tokenId,
        quantity,
        price,
        currency,
        expiration,
      );
      return await ctx.provider.execute(snAccount, calls, "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const buildOfferCalls = (
    collection: string,
    tokenId: BigNumberish,
    quantity: BigNumberish,
    price: BigNumberish,
    currency: string,
    expiration: BigNumberish,
  ) => {
    return [
      {
        contractAddress: currency,
        entrypoint: "approve",
        calldata: CallData.compile({
          spender: getContractByName(config.manifest, NAMESPACE, "Marketplace")
            .address,
          amount: cairo.uint256(price),
        }),
      },
      buildOfferCalldata(
        collection,
        tokenId,
        quantity,
        price,
        currency,
        expiration,
      ),
    ];
  };

  // Overidding list action with set_approval_for_all to marketplace contract first
  const list = async (
    snAccount: Account | AccountInterface,
    collection: string,
    tokenId: BigNumberish,
    quantity: BigNumberish,
    price: BigNumberish,
    currency: string,
    expiration: BigNumberish,
  ) => {
    try {
      const calls = buildListCalls(
        collection,
        tokenId,
        quantity,
        price,
        currency,
        expiration,
      );
      return await ctx.provider.execute(snAccount, calls, "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const buildListCalls = (
    collection: string,
    tokenId: BigNumberish,
    quantity: BigNumberish,
    price: BigNumberish,
    currency: string,
    expiration: BigNumberish,
  ) => {
    return [
      {
        contractAddress: collection,
        entrypoint: "set_approval_for_all",
        calldata: CallData.compile({
          operator: getContractByName(config.manifest, NAMESPACE, "Marketplace")
            .address,
          approved: true,
        }),
      },
      buildListCalldata(
        collection,
        tokenId,
        quantity,
        price,
        currency,
        expiration,
        true, // royalties
      ),
    ];
  };

  // Overidding list action with set_approval_for_all to marketplace contract first
  const executeOffer = async (
    snAccount: Account | AccountInterface,
    orderId: BigNumberish,
    collection: string,
    tokenId: BigNumberish,
    quantity: BigNumberish,
    royalties: boolean,
    currency: string,
    price: BigNumberish,
    clientFee: BigNumberish,
    clientReceiver: string,
  ) => {
    try {
      const calls = buildExecuteOfferCalls(
        orderId,
        collection,
        tokenId,
        quantity,
        royalties,
        currency,
        price,
        clientFee,
        clientReceiver,
      );
      return await ctx.provider.execute(snAccount, calls, "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const buildExecuteOfferCalls = (
    orderId: BigNumberish,
    collection: string,
    tokenId: BigNumberish,
    quantity: BigNumberish,
    royalties: boolean,
    currency: string,
    price: BigNumberish,
    clientFee: BigNumberish,
    clientReceiver: string,
  ) => {
    return [
      {
        contractAddress: currency,
        entrypoint: "approve",
        calldata: CallData.compile({
          spender: getContractByName(config.manifest, NAMESPACE, "Marketplace")
            .address,
          amount: cairo.uint256(price),
        }),
      },
      buildExecuteCalldata(
        orderId,
        collection,
        tokenId,
        tokenId,
        quantity,
        royalties,
        clientFee,
        clientReceiver,
      ),
    ];
  };

  // Overidding list action with set_approval_for_all to marketplace contract first
  const executeListing = async (
    snAccount: Account | AccountInterface,
    orderId: BigNumberish,
    collection: string,
    tokenId: BigNumberish,
    quantity: BigNumberish,
    royalties: boolean,
    currency: string,
    price: BigNumberish,
    clientFee: BigNumberish,
    clientReceiver: string,
  ) => {
    try {
      const calls = buildExecuteListingCalls(
        orderId,
        collection,
        tokenId,
        quantity,
        royalties,
        currency,
        price,
        clientFee,
        clientReceiver,
      );
      return await ctx.provider.execute(snAccount, calls, "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const buildExecuteListingCalls = (
    orderId: BigNumberish,
    collection: string,
    tokenId: BigNumberish,
    quantity: BigNumberish,
    royalties: boolean,
    currency: string,
    price: BigNumberish,
    clientFee: BigNumberish,
    clientReceiver: string,
  ) => {
    return [
      {
        contractAddress: currency,
        entrypoint: "approve",
        calldata: CallData.compile({
          spender: getContractByName(config.manifest, NAMESPACE, "Marketplace")
            .address,
          amount: cairo.uint256(price),
        }),
      },
      buildExecuteCalldata(
        orderId,
        collection,
        tokenId,
        tokenId,
        quantity,
        royalties,
        clientFee,
        clientReceiver,
      ),
    ];
  };

  return {
    cancel,
    remove,
    executeListing,
    executeOffer,
    grantRole,
    list,
    offer,
    pause,
    resume,
    revokeRole,
    setFee,
    getValidity,
    buildOfferCalls,
    buildListCalls,
    buildExecuteOfferCalls,
    buildExecuteListingCalls,
  };
}

export function useOrders() {
  const ctx = useMarketplace();
  return ctx.orders;
}
