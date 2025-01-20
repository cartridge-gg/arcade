# Register game

starkli invoke \
    --rpc https://api.cartridge.gg/x/starknet/sepolia \
    --account ./account.json \
    --keystore ./keystore.json \
    0x3af383ca009f2066f44ec9c6e760072b58142468bdf2b2b87053e4ee0012ed2 register_game \
        0x4f3dccb47477c087ad9c76b8067b8aadded57f8df7f2d7543e6066bcb25332c \
        str:"dopewars" \
        str:"ryomainnet" \
        str:"#FF00FF" \
        0 str:"Dope Wars" 0x9 \
        3 str:"Dope Wars is an onchain adaptat" str:"ion of the classic arbitrage ga" str:"me Drug Wars, built by Cartridg" str:"e in partnership with Dope DAO." 0x1f \
        2 str:"https://github.com/cartridge-gg" str:"/presets/blob/main/configs/dope" str:"-wars/icon.png?raw=true" 0x17 \
        2 str:"https://github.com/cartridge-gg" str:"/presets/blob/main/configs/dope" str:"-wars/cover.png?raw=true" 0x18 \
        0 str:"https://discord.gg/dopewars" 0x1b \
        0 0 0 \
        0 str:"https://x.com/TheDopeWars" 0x19 \
        0 0 0 \
        0 str:"https://dopewars.game/" 0x16 \
    / 0x3af383ca009f2066f44ec9c6e760072b58142468bdf2b2b87053e4ee0012ed2 register_game \
        0x6a9e4c6f0799160ea8ddc43ff982a5f83d7f633e9732ce42701de1288ff705f \
        str:"s0_eternum" \
        str:"eternum-prod" \
        str:"#FF00FF" \
        0 str:"Eternum" 0x7 \
        0 str:"Rule the Hex." 0xd \
        2 str:"https://github.com/cartridge-gg" str:"/presets/blob/main/configs/eter" str:"num/icon.png?raw=true" 0x15 \
        2 str:"https://github.com/cartridge-gg" str:"/presets/blob/main/configs/eter" str:"num/cover.png?raw=true" 0x16 \
        0 str:"https://discord.gg/CEXUEJF3" 0x1b \
        0 0 0 \
        0 str:"https://x.com/RealmsEternum" 0x1b \
        0 0 0 \
        0 str:"https://eternum.realms.world/" 0x1d
    / 0x3af383ca009f2066f44ec9c6e760072b58142468bdf2b2b87053e4ee0012ed2 register_game \
        0x44c4ffdf401b1fe8c4b75eb8c8076d28dd91940ea31de93814dc82e1410b86e \
        str:"darkshuffle_s0" \
        str:"darkshuffle-mainnet-2" \
        str:"#F59100" \
        0 str:"Dark Shuffle" 0x7 \
        2 str:"A Provable Roguelike Deck-build" str:"ing Game on Starknet, powered b" str:"y $LORDS." 0x9 \
        2 str:"https://github.com/cartridge-gg" str:"/presets/blob/main/configs/dark" str:"-shuffle/icon.png?raw=true" 0x1a \
        2 str:"https://github.com/cartridge-gg" str:"/presets/blob/main/configs/dark" str:"-shuffle/cover.png?raw=true" 0x1b \
        0 str:"https://discord.gg/CEXUEJF3" 0x1b \
        0 0 0 \
        0 str:"https://x.com/await_0x" 0x16 \
        0 0 0 \
        0 str:"https://darkshuffle.dev/" 0x18
