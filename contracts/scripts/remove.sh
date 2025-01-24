# Register game

starkli invoke \
    --rpc https://api.cartridge.gg/x/starknet/mainnet \
    --account ./account_mainnet.json \
    --keystore ./keystore_mainnet.json \
    0xc46f7e578f31c3fa6bb669164f04d696427818ba69f177ddc152f31ed5f119 remove_game \
        0x44c4ffdf401b1fe8c4b75eb8c8076d28dd91940ea31de93814dc82e1410b86e \
        str:"darkshuffle_s0"
