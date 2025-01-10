# Register game

starkli invoke \
    --rpc https://api.cartridge.gg/x/starknet/sepolia \
    --account ./account.json \
    --keystore ./keystore.json \
    0x3af383ca009f2066f44ec9c6e760072b58142468bdf2b2b87053e4ee0012ed2 register_game \
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
    --rpc https://api.cartridge.gg/x/starknet/sepolia \
    --account ./account.json \
    --keystore ./keystore.json \
    0x3af383ca009f2066f44ec9c6e760072b58142468bdf2b2b87053e4ee0012ed2 publish_game \
        0x6a9e4c6f0799160ea8ddc43ff982a5f83d7f633e9732ce42701de1288ff705f \
        str:"s0_eternum"

# Whitelist game

starkli invoke \
    --rpc https://api.cartridge.gg/x/starknet/sepolia \
    --account ./account.json \
    --keystore ./keystore.json \
    0x3af383ca009f2066f44ec9c6e760072b58142468bdf2b2b87053e4ee0012ed2 whitelist_game \
        0x6a9e4c6f0799160ea8ddc43ff982a5f83d7f633e9732ce42701de1288ff705f \
        str:"s0_eternum"

