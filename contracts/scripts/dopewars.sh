# Register game

starkli invoke \
    --rpc https://api.cartridge.gg/x/arcade/katana \
    --account ./account.json \
    --keystore ./keystore.json \
    0x1b6ffe59b903e633e87ef0f22aa59902efe6c3cea2b45a9543e4bc6329effda register_game \
        0x4f3dccb47477c087ad9c76b8067b8aadded57f8df7f2d7543e6066bcb25332c \
        str:"dopewars" \
        str:"ryomainnet" \
        0 \
        0 0 0 \
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
    --rpc https://api.cartridge.gg/x/arcade/katana \
    --account ./account.json \
    --keystore ./keystore.json \
    0x1b6ffe59b903e633e87ef0f22aa59902efe6c3cea2b45a9543e4bc6329effda publish_game \
        0x4f3dccb47477c087ad9c76b8067b8aadded57f8df7f2d7543e6066bcb25332c \
        str:"dopewars"

# Whitelist game

starkli invoke \
    --rpc https://api.cartridge.gg/x/arcade/katana \
    --account ./account.json \
    --keystore ./keystore.json \
    0x1b6ffe59b903e633e87ef0f22aa59902efe6c3cea2b45a9543e4bc6329effda whitelist_game \
        0x4f3dccb47477c087ad9c76b8067b8aadded57f8df7f2d7543e6066bcb25332c \
        str:"dopewars"

