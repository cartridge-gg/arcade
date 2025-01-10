# Register game

starkli invoke \
    --rpc https://api.cartridge.gg/x/starknet/sepolia \
    --account ./account.json \
    --keystore ./keystore.json \
    0x3af383ca009f2066f44ec9c6e760072b58142468bdf2b2b87053e4ee0012ed2 update_game \
        0x4f3dccb47477c087ad9c76b8067b8aadded57f8df7f2d7543e6066bcb25332c \
        str:"dopewars" \
        str:"#FF00FF" \
        0 str:"Dope Wars" 0x9 \
        3 str:"Dope Wars is an onchain adaptat" str:"ion of the classic arbitrage ga" str:"me Drug Wars, built by Cartridg" str:"e in partnership with Dope DAO." 0x1f \
        2 str:"https://github.com/cartridge-gg" str:"/presets/blob/main/configs/dope" str:"-wars/icon.png?raw=true" 0x17 \
        2 str:"https://github.com/cartridge-gg" str:"/presets/blob/main/configs/dope" str:"-wars/cover.png?raw=true" 0x18 \
        0 str:"https://discord.gg/dopewars" 0x1b \
        0 0 0 \
        0 str:"https://x.com/TheDopeWars" 0x19\
        0 0 0 \
        0 str:"https://dopewars.game/" 0x16
