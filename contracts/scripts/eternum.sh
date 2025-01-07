# Register game

starkli invoke \
    --rpc https://api.cartridge.gg/x/arcade/katana \
    --account ./account.json \
    --keystore ./keystore.json \
    0x1b6ffe59b903e633e87ef0f22aa59902efe6c3cea2b45a9543e4bc6329effda register_game \
        0x6a9e4c6f0799160ea8ddc43ff982a5f83d7f633e9732ce42701de1288ff705f \
        str:"s0_eternum" \
        str:"eternum-prod" \
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
        0x6a9e4c6f0799160ea8ddc43ff982a5f83d7f633e9732ce42701de1288ff705f \
        str:"s0_eternum"

# Whitelist game

starkli invoke \
    --rpc https://api.cartridge.gg/x/arcade/katana \
    --account ./account.json \
    --keystore ./keystore.json \
    0x1b6ffe59b903e633e87ef0f22aa59902efe6c3cea2b45a9543e4bc6329effda whitelist_game \
        0x6a9e4c6f0799160ea8ddc43ff982a5f83d7f633e9732ce42701de1288ff705f \
        str:"s0_eternum"

