# Register game

starkli invoke \
    --rpc https://api.cartridge.gg/x/starknet/mainnet \
    --account ./account_mainnet.json \
    --keystore ./keystore_mainnet.json \
    0xc46f7e578f31c3fa6bb669164f04d696427818ba69f177ddc152f31ed5f119 update_game \
        0x44c4ffdf401b1fe8c4b75eb8c8076d28dd91940ea31de93814dc82e1410b86e \
        str:"darkshuffle_s0" \
        str:"darkshuffle-mainnet-3" \
        str:"dark-shuffle" \
        str:"#F59100" \
        0 str:"Dark Shuffle" 0xc \
        2 str:"A Provable Roguelike Deck-build" str:"ing Game on Starknet, powered b" str:"y LORDS." 0x8 \
        2 str:"https://github.com/cartridge-gg" str:"/presets/blob/main/configs/dark" str:"-shuffle/icon.svg?raw=true" 0x1a \
        2 str:"https://github.com/cartridge-gg" str:"/presets/blob/main/configs/dark" str:"-shuffle/cover.png?raw=true" 0x1b \
        0 str:"https://discord.gg/CEXUEJF3" 0x1b \
        0 0 0 \
        0 str:"https://x.com/await_0x" 0x16 \
        0 0 0 \
        0 str:"https://darkshuffle.dev/" 0x18
