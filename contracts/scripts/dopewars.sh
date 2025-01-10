# Register game

starkli invoke \
    --rpc https://api.cartridge.gg/x/starknet/sepolia \
    --account ./account.json \
    --keystore ./keystore.json \
    0x3af383ca009f2066f44ec9c6e760072b58142468bdf2b2b87053e4ee0012ed2 register_game \
        0x4f3dccb47477c087ad9c76b8067b8aadded57f8df7f2d7543e6066bcb25332c \
        str:"dopewars" \
        str:"ryomainnet" \
        0 \
        bytearray:"" \
        0 0 0 \
        0 0 0 \
        0 0 0 \
        0 0 0 \
        0 0 0 \
        0 0 0 \
        0 0 0 \
        0 0 0

# Publish game

starkli invoke \
    --rpc https://api.cartridge.gg/x/starknet/sepolia \
    --account ./account.json \
    --keystore ./keystore.json \
    0x3af383ca009f2066f44ec9c6e760072b58142468bdf2b2b87053e4ee0012ed2 publish_game \
        0x4f3dccb47477c087ad9c76b8067b8aadded57f8df7f2d7543e6066bcb25332c \
        str:"dopewars"

# Whitelist game

starkli invoke \
    --rpc https://api.cartridge.gg/x/starknet/sepolia \
    --account ./account.json \
    --keystore ./keystore.json \
    0x3af383ca009f2066f44ec9c6e760072b58142468bdf2b2b87053e4ee0012ed2 whitelist_game \
        0x4f3dccb47477c087ad9c76b8067b8aadded57f8df7f2d7543e6066bcb25332c \
        str:"dopewars"

