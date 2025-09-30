import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish } from "starknet";

export function setupWorld(provider: DojoProvider) {
  const build_Marketplace_cancel_calldata = (
    orderId: BigNumberish,
    collection: string,
    tokenId: BigNumberish,
  ): DojoCall => {
    return {
      contractName: "Marketplace",
      entrypoint: "cancel",
      calldata: [orderId, collection, tokenId],
    };
  };

  const Marketplace_cancel = async (
    snAccount: Account | AccountInterface,
    orderId: BigNumberish,
    collection: string,
    tokenId: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_Marketplace_cancel_calldata(orderId, collection, tokenId),
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Marketplace_execute_calldata = (
    orderId: BigNumberish,
    collection: string,
    tokenId: BigNumberish,
    assetId: BigNumberish,
    quantity: BigNumberish,
    royalties: boolean,
    clientFee: BigNumberish,
    clientReceiver: string,
  ): DojoCall => {
    return {
      contractName: "Marketplace",
      entrypoint: "execute",
      calldata: [orderId, collection, tokenId, assetId, quantity, royalties, clientFee, clientReceiver],
    };
  };

  const Marketplace_execute = async (
    snAccount: Account | AccountInterface,
    orderId: BigNumberish,
    collection: string,
    tokenId: BigNumberish,
    assetId: BigNumberish,
    quantity: BigNumberish,
    royalties: boolean,
    clientFee: BigNumberish,
    clientReceiver: string,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_Marketplace_execute_calldata(
          orderId,
          collection,
          tokenId,
          assetId,
          quantity,
          royalties,
          clientFee,
          clientReceiver,
        ),
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Marketplace_getValidities_calldata = (orders: Array<[BigNumberish, string, BigNumberish]>): DojoCall => {
    return {
      contractName: "Marketplace",
      entrypoint: "get_validities",
      calldata: [orders],
    };
  };

  const Marketplace_getValidities = async (orders: Array<[BigNumberish, string, BigNumberish]>) => {
    try {
      return await provider.call("ARCADE", build_Marketplace_getValidities_calldata(orders));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Marketplace_getValidity_calldata = (
    orderId: BigNumberish,
    collection: string,
    tokenId: BigNumberish,
  ): DojoCall => {
    return {
      contractName: "Marketplace",
      entrypoint: "get_validity",
      calldata: [orderId, collection, tokenId],
    };
  };

  const Marketplace_getValidity = async (orderId: BigNumberish, collection: string, tokenId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", build_Marketplace_getValidity_calldata(orderId, collection, tokenId));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Marketplace_grantRole_calldata = (account: string, roleId: BigNumberish): DojoCall => {
    return {
      contractName: "Marketplace",
      entrypoint: "grant_role",
      calldata: [account, roleId],
    };
  };

  const Marketplace_grantRole = async (
    snAccount: Account | AccountInterface,
    account: string,
    roleId: BigNumberish,
  ) => {
    try {
      return await provider.execute(snAccount, build_Marketplace_grantRole_calldata(account, roleId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Marketplace_intent_calldata = (
    collection: string,
    quantity: BigNumberish,
    price: BigNumberish,
    currency: string,
    expiration: BigNumberish,
  ): DojoCall => {
    return {
      contractName: "Marketplace",
      entrypoint: "intent",
      calldata: [collection, quantity, price, currency, expiration],
    };
  };

  const Marketplace_intent = async (
    snAccount: Account | AccountInterface,
    collection: string,
    quantity: BigNumberish,
    price: BigNumberish,
    currency: string,
    expiration: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_Marketplace_intent_calldata(collection, quantity, price, currency, expiration),
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Marketplace_list_calldata = (
    collection: string,
    tokenId: BigNumberish,
    quantity: BigNumberish,
    price: BigNumberish,
    currency: string,
    expiration: BigNumberish,
    royalties: boolean,
  ): DojoCall => {
    return {
      contractName: "Marketplace",
      entrypoint: "list",
      calldata: [collection, tokenId, quantity, price, currency, expiration, royalties],
    };
  };

  const Marketplace_list = async (
    snAccount: Account | AccountInterface,
    collection: string,
    tokenId: BigNumberish,
    quantity: BigNumberish,
    price: BigNumberish,
    currency: string,
    expiration: BigNumberish,
    royalties: boolean,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_Marketplace_list_calldata(collection, tokenId, quantity, price, currency, expiration, royalties),
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Marketplace_offer_calldata = (
    collection: string,
    tokenId: BigNumberish,
    quantity: BigNumberish,
    price: BigNumberish,
    currency: string,
    expiration: BigNumberish,
  ): DojoCall => {
    return {
      contractName: "Marketplace",
      entrypoint: "offer",
      calldata: [collection, tokenId, quantity, price, currency, expiration],
    };
  };

  const Marketplace_offer = async (
    snAccount: Account | AccountInterface,
    collection: string,
    tokenId: BigNumberish,
    quantity: BigNumberish,
    price: BigNumberish,
    currency: string,
    expiration: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_Marketplace_offer_calldata(collection, tokenId, quantity, price, currency, expiration),
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Marketplace_pause_calldata = (): DojoCall => {
    return {
      contractName: "Marketplace",
      entrypoint: "pause",
      calldata: [],
    };
  };

  const Marketplace_pause = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(snAccount, build_Marketplace_pause_calldata(), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Marketplace_remove_calldata = (
    orderId: BigNumberish,
    collection: string,
    tokenId: BigNumberish,
  ): DojoCall => {
    return {
      contractName: "Marketplace",
      entrypoint: "remove",
      calldata: [orderId, collection, tokenId],
    };
  };

  const Marketplace_remove = async (
    snAccount: Account | AccountInterface,
    orderId: BigNumberish,
    collection: string,
    tokenId: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_Marketplace_remove_calldata(orderId, collection, tokenId),
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Marketplace_resume_calldata = (): DojoCall => {
    return {
      contractName: "Marketplace",
      entrypoint: "resume",
      calldata: [],
    };
  };

  const Marketplace_resume = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(snAccount, build_Marketplace_resume_calldata(), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Marketplace_revokeRole_calldata = (account: string): DojoCall => {
    return {
      contractName: "Marketplace",
      entrypoint: "revoke_role",
      calldata: [account],
    };
  };

  const Marketplace_revokeRole = async (snAccount: Account | AccountInterface, account: string) => {
    try {
      return await provider.execute(snAccount, build_Marketplace_revokeRole_calldata(account), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Marketplace_setFee_calldata = (feeNum: BigNumberish, feeReceiver: string): DojoCall => {
    return {
      contractName: "Marketplace",
      entrypoint: "set_fee",
      calldata: [feeNum, feeReceiver],
    };
  };

  const Marketplace_setFee = async (
    snAccount: Account | AccountInterface,
    feeNum: BigNumberish,
    feeReceiver: string,
  ) => {
    try {
      return await provider.execute(snAccount, build_Marketplace_setFee_calldata(feeNum, feeReceiver), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Marketplace_setRoyalties_calldata = (enabled: boolean): DojoCall => {
    return {
      contractName: "Marketplace",
      entrypoint: "set_royalties",
      calldata: [enabled],
    };
  };

  const Marketplace_setRoyalties = async (snAccount: Account | AccountInterface, enabled: boolean) => {
    try {
      return await provider.execute(snAccount, build_Marketplace_setRoyalties_calldata(enabled), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_associateCollection_calldata = (
    collectionAddress: string,
    editionId: BigNumberish,
  ): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "associate_collection",
      calldata: [collectionAddress, editionId],
    };
  };

  const Registry_associateCollection = async (
    snAccount: Account | AccountInterface,
    collectionAddress: string,
    editionId: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_Registry_associateCollection_calldata(collectionAddress, editionId),
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_blacklistEdition_calldata = (editionId: BigNumberish): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "blacklist_edition",
      calldata: [editionId],
    };
  };

  const Registry_blacklistEdition = async (snAccount: Account | AccountInterface, editionId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Registry_blacklistEdition_calldata(editionId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_blacklistGame_calldata = (gameId: BigNumberish): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "blacklist_game",
      calldata: [gameId],
    };
  };

  const Registry_blacklistGame = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Registry_blacklistGame_calldata(gameId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_dissociateCollection_calldata = (
    collectionAddress: string,
    editionId: BigNumberish,
  ): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "dissociate_collection",
      calldata: [collectionAddress, editionId],
    };
  };

  const Registry_dissociateCollection = async (
    snAccount: Account | AccountInterface,
    collectionAddress: string,
    editionId: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_Registry_dissociateCollection_calldata(collectionAddress, editionId),
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_grant_calldata = (account: string, roleId: BigNumberish): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "grant",
      calldata: [account, roleId],
    };
  };

  const Registry_grant = async (snAccount: Account | AccountInterface, account: string, roleId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Registry_grant_calldata(account, roleId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_hideEdition_calldata = (editionId: BigNumberish): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "hide_edition",
      calldata: [editionId],
    };
  };

  const Registry_hideEdition = async (snAccount: Account | AccountInterface, editionId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Registry_hideEdition_calldata(editionId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_hideGame_calldata = (gameId: BigNumberish): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "hide_game",
      calldata: [gameId],
    };
  };

  const Registry_hideGame = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Registry_hideGame_calldata(gameId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_prioritizeEdition_calldata = (editionId: BigNumberish, priority: BigNumberish): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "prioritize_edition",
      calldata: [editionId, priority],
    };
  };

  const Registry_prioritizeEdition = async (
    snAccount: Account | AccountInterface,
    editionId: BigNumberish,
    priority: BigNumberish,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_Registry_prioritizeEdition_calldata(editionId, priority),
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_publishEdition_calldata = (editionId: BigNumberish): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "publish_edition",
      calldata: [editionId],
    };
  };

  const Registry_publishEdition = async (snAccount: Account | AccountInterface, editionId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Registry_publishEdition_calldata(editionId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_publishGame_calldata = (gameId: BigNumberish): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "publish_game",
      calldata: [gameId],
    };
  };

  const Registry_publishGame = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Registry_publishGame_calldata(gameId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_registerCollection_calldata = (collectionAddress: string): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "register_collection",
      calldata: [collectionAddress],
    };
  };

  const Registry_registerCollection = async (snAccount: Account | AccountInterface, collectionAddress: string) => {
    try {
      return await provider.execute(snAccount, build_Registry_registerCollection_calldata(collectionAddress), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_registerEdition_calldata = (
    worldAddress: string,
    namespace: BigNumberish,
    gameId: BigNumberish,
    project: string,
    rpc: string,
    policies: string,
    color: string,
    image: string,
    imageData: string,
    externalUrl: string,
    description: string,
    name: string,
    attributes: string,
    animationUrl: string,
    youtubeUrl: string,
    properties: string,
    socials: string,
  ): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "register_edition",
      calldata: [
        worldAddress,
        namespace,
        gameId,
        project,
        rpc,
        policies,
        color,
        image,
        imageData,
        externalUrl,
        description,
        name,
        attributes,
        animationUrl,
        youtubeUrl,
        properties,
        socials,
      ],
    };
  };

  const Registry_registerEdition = async (
    snAccount: Account | AccountInterface,
    worldAddress: string,
    namespace: BigNumberish,
    gameId: BigNumberish,
    project: string,
    rpc: string,
    policies: string,
    color: string,
    image: string,
    imageData: string,
    externalUrl: string,
    description: string,
    name: string,
    attributes: string,
    animationUrl: string,
    youtubeUrl: string,
    properties: string,
    socials: string,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_Registry_registerEdition_calldata(
          worldAddress,
          namespace,
          gameId,
          project,
          rpc,
          policies,
          color,
          image,
          imageData,
          externalUrl,
          description,
          name,
          attributes,
          animationUrl,
          youtubeUrl,
          properties,
          socials,
        ),
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_registerGame_calldata = (
    worldAddress: string,
    namespace: BigNumberish,
    project: string,
    rpc: string,
    policies: string,
    color: string,
    gameImage: string,
    editionImage: string,
    externalUrl: string,
    description: string,
    gameName: string,
    editionName: string,
    gameAttributes: string,
    editionAttributes: string,
    animationUrl: string,
    youtubeUrl: string,
    properties: string,
    gameSocials: string,
    editionSocials: string,
  ): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "register_game",
      calldata: [
        worldAddress,
        namespace,
        project,
        rpc,
        policies,
        color,
        gameImage,
        editionImage,
        externalUrl,
        description,
        gameName,
        editionName,
        gameAttributes,
        editionAttributes,
        animationUrl,
        youtubeUrl,
        properties,
        gameSocials,
        editionSocials,
      ],
    };
  };

  const Registry_registerGame = async (
    snAccount: Account | AccountInterface,
    worldAddress: string,
    namespace: BigNumberish,
    project: string,
    rpc: string,
    policies: string,
    color: string,
    gameImage: string,
    editionImage: string,
    externalUrl: string,
    description: string,
    gameName: string,
    editionName: string,
    gameAttributes: string,
    editionAttributes: string,
    animationUrl: string,
    youtubeUrl: string,
    properties: string,
    gameSocials: string,
    editionSocials: string,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_Registry_registerGame_calldata(
          worldAddress,
          namespace,
          project,
          rpc,
          policies,
          color,
          gameImage,
          editionImage,
          externalUrl,
          description,
          gameName,
          editionName,
          gameAttributes,
          editionAttributes,
          animationUrl,
          youtubeUrl,
          properties,
          gameSocials,
          editionSocials,
        ),
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_removeEdition_calldata = (editionId: BigNumberish): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "remove_edition",
      calldata: [editionId],
    };
  };

  const Registry_removeEdition = async (snAccount: Account | AccountInterface, editionId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Registry_removeEdition_calldata(editionId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_removeGame_calldata = (gameId: BigNumberish): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "remove_game",
      calldata: [gameId],
    };
  };

  const Registry_removeGame = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Registry_removeGame_calldata(gameId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_revoke_calldata = (account: string): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "revoke",
      calldata: [account],
    };
  };

  const Registry_revoke = async (snAccount: Account | AccountInterface, account: string) => {
    try {
      return await provider.execute(snAccount, build_Registry_revoke_calldata(account), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_tokenUri_calldata = (tokenId: BigNumberish): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "token_uri",
      calldata: [tokenId],
    };
  };

  const Registry_tokenUri = async (tokenId: BigNumberish) => {
    try {
      return await provider.call("ARCADE", build_Registry_tokenUri_calldata(tokenId));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_updateEdition_calldata = (
    editionId: BigNumberish,
    project: string,
    rpc: string,
    policies: string,
    color: string,
    image: string,
    imageData: string,
    externalUrl: string,
    description: string,
    name: string,
    attributes: string,
    animationUrl: string,
    youtubeUrl: string,
    properties: string,
    socials: string,
  ): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "update_edition",
      calldata: [
        editionId,
        project,
        rpc,
        policies,
        color,
        image,
        imageData,
        externalUrl,
        description,
        name,
        attributes,
        animationUrl,
        youtubeUrl,
        properties,
        socials,
      ],
    };
  };

  const Registry_updateEdition = async (
    snAccount: Account | AccountInterface,
    editionId: BigNumberish,
    project: string,
    rpc: string,
    policies: string,
    color: string,
    image: string,
    imageData: string,
    externalUrl: string,
    description: string,
    name: string,
    attributes: string,
    animationUrl: string,
    youtubeUrl: string,
    properties: string,
    socials: string,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_Registry_updateEdition_calldata(
          editionId,
          project,
          rpc,
          policies,
          color,
          image,
          imageData,
          externalUrl,
          description,
          name,
          attributes,
          animationUrl,
          youtubeUrl,
          properties,
          socials,
        ),
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_updateGame_calldata = (
    gameId: BigNumberish,
    color: string,
    image: string,
    imageData: string,
    externalUrl: string,
    description: string,
    name: string,
    attributes: string,
    animationUrl: string,
    youtubeUrl: string,
    properties: string,
    socials: string,
  ): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "update_game",
      calldata: [
        gameId,
        color,
        image,
        imageData,
        externalUrl,
        description,
        name,
        attributes,
        animationUrl,
        youtubeUrl,
        properties,
        socials,
      ],
    };
  };

  const Registry_updateGame = async (
    snAccount: Account | AccountInterface,
    gameId: BigNumberish,
    color: string,
    image: string,
    imageData: string,
    externalUrl: string,
    description: string,
    name: string,
    attributes: string,
    animationUrl: string,
    youtubeUrl: string,
    properties: string,
    socials: string,
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_Registry_updateGame_calldata(
          gameId,
          color,
          image,
          imageData,
          externalUrl,
          description,
          name,
          attributes,
          animationUrl,
          youtubeUrl,
          properties,
          socials,
        ),
        "ARCADE",
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_whitelistEdition_calldata = (editionId: BigNumberish): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "whitelist_edition",
      calldata: [editionId],
    };
  };

  const Registry_whitelistEdition = async (snAccount: Account | AccountInterface, editionId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Registry_whitelistEdition_calldata(editionId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Registry_whitelistGame_calldata = (gameId: BigNumberish): DojoCall => {
    return {
      contractName: "Registry",
      entrypoint: "whitelist_game",
      calldata: [gameId],
    };
  };

  const Registry_whitelistGame = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Registry_whitelistGame_calldata(gameId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Slot_deploy_calldata = (service: BigNumberish, project: BigNumberish, tier: BigNumberish): DojoCall => {
    return {
      contractName: "Slot",
      entrypoint: "deploy",
      calldata: [service, project, tier],
    };
  };

  const Slot_deploy = async (
    snAccount: Account | AccountInterface,
    service: BigNumberish,
    project: BigNumberish,
    tier: BigNumberish,
  ) => {
    try {
      return await provider.execute(snAccount, build_Slot_deploy_calldata(service, project, tier), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Slot_fire_calldata = (project: BigNumberish, accountId: BigNumberish): DojoCall => {
    return {
      contractName: "Slot",
      entrypoint: "fire",
      calldata: [project, accountId],
    };
  };

  const Slot_fire = async (snAccount: Account | AccountInterface, project: BigNumberish, accountId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Slot_fire_calldata(project, accountId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Slot_hire_calldata = (project: BigNumberish, accountId: BigNumberish, role: BigNumberish): DojoCall => {
    return {
      contractName: "Slot",
      entrypoint: "hire",
      calldata: [project, accountId, role],
    };
  };

  const Slot_hire = async (
    snAccount: Account | AccountInterface,
    project: BigNumberish,
    accountId: BigNumberish,
    role: BigNumberish,
  ) => {
    try {
      return await provider.execute(snAccount, build_Slot_hire_calldata(project, accountId, role), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Slot_remove_calldata = (service: BigNumberish, project: BigNumberish): DojoCall => {
    return {
      contractName: "Slot",
      entrypoint: "remove",
      calldata: [service, project],
    };
  };

  const Slot_remove = async (snAccount: Account | AccountInterface, service: BigNumberish, project: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Slot_remove_calldata(service, project), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_cancelAlliance_calldata = (): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "cancel_alliance",
      calldata: [],
    };
  };

  const Social_cancelAlliance = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(snAccount, build_Social_cancelAlliance_calldata(), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_cancelGuild_calldata = (): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "cancel_guild",
      calldata: [],
    };
  };

  const Social_cancelGuild = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(snAccount, build_Social_cancelGuild_calldata(), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_closeAlliance_calldata = (): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "close_alliance",
      calldata: [],
    };
  };

  const Social_closeAlliance = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(snAccount, build_Social_closeAlliance_calldata(), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_closeGuild_calldata = (): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "close_guild",
      calldata: [],
    };
  };

  const Social_closeGuild = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(snAccount, build_Social_closeGuild_calldata(), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_createAlliance_calldata = (metadata: string, socials: string): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "create_alliance",
      calldata: [metadata, socials],
    };
  };

  const Social_createAlliance = async (snAccount: Account | AccountInterface, metadata: string, socials: string) => {
    try {
      return await provider.execute(snAccount, build_Social_createAlliance_calldata(metadata, socials), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_createGuild_calldata = (metadata: string, socials: string): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "create_guild",
      calldata: [metadata, socials],
    };
  };

  const Social_createGuild = async (snAccount: Account | AccountInterface, metadata: string, socials: string) => {
    try {
      return await provider.execute(snAccount, build_Social_createGuild_calldata(metadata, socials), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_crownGuild_calldata = (guildId: BigNumberish): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "crown_guild",
      calldata: [guildId],
    };
  };

  const Social_crownGuild = async (snAccount: Account | AccountInterface, guildId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Social_crownGuild_calldata(guildId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_crownMember_calldata = (memberId: BigNumberish): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "crown_member",
      calldata: [memberId],
    };
  };

  const Social_crownMember = async (snAccount: Account | AccountInterface, memberId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Social_crownMember_calldata(memberId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_demoteMember_calldata = (memberId: BigNumberish): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "demote_member",
      calldata: [memberId],
    };
  };

  const Social_demoteMember = async (snAccount: Account | AccountInterface, memberId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Social_demoteMember_calldata(memberId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_fireGuild_calldata = (guildId: BigNumberish): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "fire_guild",
      calldata: [guildId],
    };
  };

  const Social_fireGuild = async (snAccount: Account | AccountInterface, guildId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Social_fireGuild_calldata(guildId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_fireMember_calldata = (memberId: BigNumberish): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "fire_member",
      calldata: [memberId],
    };
  };

  const Social_fireMember = async (snAccount: Account | AccountInterface, memberId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Social_fireMember_calldata(memberId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_follow_calldata = (target: BigNumberish): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "follow",
      calldata: [target],
    };
  };

  const Social_follow = async (snAccount: Account | AccountInterface, target: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Social_follow_calldata(target), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_hireGuild_calldata = (guildId: BigNumberish): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "hire_guild",
      calldata: [guildId],
    };
  };

  const Social_hireGuild = async (snAccount: Account | AccountInterface, guildId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Social_hireGuild_calldata(guildId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_hireMember_calldata = (memberId: BigNumberish): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "hire_member",
      calldata: [memberId],
    };
  };

  const Social_hireMember = async (snAccount: Account | AccountInterface, memberId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Social_hireMember_calldata(memberId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_leaveAlliance_calldata = (): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "leave_alliance",
      calldata: [],
    };
  };

  const Social_leaveAlliance = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(snAccount, build_Social_leaveAlliance_calldata(), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_leaveGuild_calldata = (): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "leave_guild",
      calldata: [],
    };
  };

  const Social_leaveGuild = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(snAccount, build_Social_leaveGuild_calldata(), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_openAlliance_calldata = (free: boolean): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "open_alliance",
      calldata: [free],
    };
  };

  const Social_openAlliance = async (snAccount: Account | AccountInterface, free: boolean) => {
    try {
      return await provider.execute(snAccount, build_Social_openAlliance_calldata(free), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_openGuild_calldata = (free: boolean): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "open_guild",
      calldata: [free],
    };
  };

  const Social_openGuild = async (snAccount: Account | AccountInterface, free: boolean) => {
    try {
      return await provider.execute(snAccount, build_Social_openGuild_calldata(free), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_pin_calldata = (achievementId: BigNumberish): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "pin",
      calldata: [achievementId],
    };
  };

  const Social_pin = async (snAccount: Account | AccountInterface, achievementId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Social_pin_calldata(achievementId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_promoteMember_calldata = (memberId: BigNumberish): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "promote_member",
      calldata: [memberId],
    };
  };

  const Social_promoteMember = async (snAccount: Account | AccountInterface, memberId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Social_promoteMember_calldata(memberId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_requestAlliance_calldata = (allianceId: BigNumberish): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "request_alliance",
      calldata: [allianceId],
    };
  };

  const Social_requestAlliance = async (snAccount: Account | AccountInterface, allianceId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Social_requestAlliance_calldata(allianceId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_requestGuild_calldata = (guildId: BigNumberish): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "request_guild",
      calldata: [guildId],
    };
  };

  const Social_requestGuild = async (snAccount: Account | AccountInterface, guildId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Social_requestGuild_calldata(guildId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_unfollow_calldata = (target: BigNumberish): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "unfollow",
      calldata: [target],
    };
  };

  const Social_unfollow = async (snAccount: Account | AccountInterface, target: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Social_unfollow_calldata(target), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_Social_unpin_calldata = (achievementId: BigNumberish): DojoCall => {
    return {
      contractName: "Social",
      entrypoint: "unpin",
      calldata: [achievementId],
    };
  };

  const Social_unpin = async (snAccount: Account | AccountInterface, achievementId: BigNumberish) => {
    try {
      return await provider.execute(snAccount, build_Social_unpin_calldata(achievementId), "ARCADE");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    Marketplace: {
      cancel: Marketplace_cancel,
      buildCancelCalldata: build_Marketplace_cancel_calldata,
      execute: Marketplace_execute,
      buildExecuteCalldata: build_Marketplace_execute_calldata,
      getValidities: Marketplace_getValidities,
      buildGetValiditiesCalldata: build_Marketplace_getValidities_calldata,
      getValidity: Marketplace_getValidity,
      buildGetValidityCalldata: build_Marketplace_getValidity_calldata,
      grantRole: Marketplace_grantRole,
      buildGrantRoleCalldata: build_Marketplace_grantRole_calldata,
      intent: Marketplace_intent,
      buildIntentCalldata: build_Marketplace_intent_calldata,
      list: Marketplace_list,
      buildListCalldata: build_Marketplace_list_calldata,
      offer: Marketplace_offer,
      buildOfferCalldata: build_Marketplace_offer_calldata,
      pause: Marketplace_pause,
      buildPauseCalldata: build_Marketplace_pause_calldata,
      remove: Marketplace_remove,
      buildRemoveCalldata: build_Marketplace_remove_calldata,
      resume: Marketplace_resume,
      buildResumeCalldata: build_Marketplace_resume_calldata,
      revokeRole: Marketplace_revokeRole,
      buildRevokeRoleCalldata: build_Marketplace_revokeRole_calldata,
      setFee: Marketplace_setFee,
      buildSetFeeCalldata: build_Marketplace_setFee_calldata,
      setRoyalties: Marketplace_setRoyalties,
      buildSetRoyaltiesCalldata: build_Marketplace_setRoyalties_calldata,
    },
    Registry: {
      associateCollection: Registry_associateCollection,
      buildAssociateCollectionCalldata: build_Registry_associateCollection_calldata,
      blacklistEdition: Registry_blacklistEdition,
      buildBlacklistEditionCalldata: build_Registry_blacklistEdition_calldata,
      blacklistGame: Registry_blacklistGame,
      buildBlacklistGameCalldata: build_Registry_blacklistGame_calldata,
      dissociateCollection: Registry_dissociateCollection,
      buildDissociateCollectionCalldata: build_Registry_dissociateCollection_calldata,
      grant: Registry_grant,
      buildGrantCalldata: build_Registry_grant_calldata,
      hideEdition: Registry_hideEdition,
      buildHideEditionCalldata: build_Registry_hideEdition_calldata,
      hideGame: Registry_hideGame,
      buildHideGameCalldata: build_Registry_hideGame_calldata,
      prioritizeEdition: Registry_prioritizeEdition,
      buildPrioritizeEditionCalldata: build_Registry_prioritizeEdition_calldata,
      publishEdition: Registry_publishEdition,
      buildPublishEditionCalldata: build_Registry_publishEdition_calldata,
      publishGame: Registry_publishGame,
      buildPublishGameCalldata: build_Registry_publishGame_calldata,
      registerCollection: Registry_registerCollection,
      buildRegisterCollectionCalldata: build_Registry_registerCollection_calldata,
      registerEdition: Registry_registerEdition,
      buildRegisterEditionCalldata: build_Registry_registerEdition_calldata,
      registerGame: Registry_registerGame,
      buildRegisterGameCalldata: build_Registry_registerGame_calldata,
      removeEdition: Registry_removeEdition,
      buildRemoveEditionCalldata: build_Registry_removeEdition_calldata,
      removeGame: Registry_removeGame,
      buildRemoveGameCalldata: build_Registry_removeGame_calldata,
      revoke: Registry_revoke,
      buildRevokeCalldata: build_Registry_revoke_calldata,
      tokenUri: Registry_tokenUri,
      buildTokenUriCalldata: build_Registry_tokenUri_calldata,
      updateEdition: Registry_updateEdition,
      buildUpdateEditionCalldata: build_Registry_updateEdition_calldata,
      updateGame: Registry_updateGame,
      buildUpdateGameCalldata: build_Registry_updateGame_calldata,
      whitelistEdition: Registry_whitelistEdition,
      buildWhitelistEditionCalldata: build_Registry_whitelistEdition_calldata,
      whitelistGame: Registry_whitelistGame,
      buildWhitelistGameCalldata: build_Registry_whitelistGame_calldata,
    },
    Slot: {
      deploy: Slot_deploy,
      buildDeployCalldata: build_Slot_deploy_calldata,
      fire: Slot_fire,
      buildFireCalldata: build_Slot_fire_calldata,
      hire: Slot_hire,
      buildHireCalldata: build_Slot_hire_calldata,
      remove: Slot_remove,
      buildRemoveCalldata: build_Slot_remove_calldata,
    },
    Social: {
      cancelAlliance: Social_cancelAlliance,
      buildCancelAllianceCalldata: build_Social_cancelAlliance_calldata,
      cancelGuild: Social_cancelGuild,
      buildCancelGuildCalldata: build_Social_cancelGuild_calldata,
      closeAlliance: Social_closeAlliance,
      buildCloseAllianceCalldata: build_Social_closeAlliance_calldata,
      closeGuild: Social_closeGuild,
      buildCloseGuildCalldata: build_Social_closeGuild_calldata,
      createAlliance: Social_createAlliance,
      buildCreateAllianceCalldata: build_Social_createAlliance_calldata,
      createGuild: Social_createGuild,
      buildCreateGuildCalldata: build_Social_createGuild_calldata,
      crownGuild: Social_crownGuild,
      buildCrownGuildCalldata: build_Social_crownGuild_calldata,
      crownMember: Social_crownMember,
      buildCrownMemberCalldata: build_Social_crownMember_calldata,
      demoteMember: Social_demoteMember,
      buildDemoteMemberCalldata: build_Social_demoteMember_calldata,
      fireGuild: Social_fireGuild,
      buildFireGuildCalldata: build_Social_fireGuild_calldata,
      fireMember: Social_fireMember,
      buildFireMemberCalldata: build_Social_fireMember_calldata,
      follow: Social_follow,
      buildFollowCalldata: build_Social_follow_calldata,
      hireGuild: Social_hireGuild,
      buildHireGuildCalldata: build_Social_hireGuild_calldata,
      hireMember: Social_hireMember,
      buildHireMemberCalldata: build_Social_hireMember_calldata,
      leaveAlliance: Social_leaveAlliance,
      buildLeaveAllianceCalldata: build_Social_leaveAlliance_calldata,
      leaveGuild: Social_leaveGuild,
      buildLeaveGuildCalldata: build_Social_leaveGuild_calldata,
      openAlliance: Social_openAlliance,
      buildOpenAllianceCalldata: build_Social_openAlliance_calldata,
      openGuild: Social_openGuild,
      buildOpenGuildCalldata: build_Social_openGuild_calldata,
      pin: Social_pin,
      buildPinCalldata: build_Social_pin_calldata,
      promoteMember: Social_promoteMember,
      buildPromoteMemberCalldata: build_Social_promoteMember_calldata,
      requestAlliance: Social_requestAlliance,
      buildRequestAllianceCalldata: build_Social_requestAlliance_calldata,
      requestGuild: Social_requestGuild,
      buildRequestGuildCalldata: build_Social_requestGuild_calldata,
      unfollow: Social_unfollow,
      buildUnfollowCalldata: build_Social_unfollow_calldata,
      unpin: Social_unpin,
      buildUnpinCalldata: build_Social_unpin_calldata,
    },
  };
}
