#!/bin/bash

# Starterpack management script
# Usage: ./starterpack.sh <command> [args...]

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/../.." || exit 1

STARKNET_RPC=https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9
PROFILE=${PROFILE:-dev}
#STARTERPACK_ADDRESS=ARCADE-StarterpackRegistry
STARTERPACK_ADDRESS=0x3eb03b8f2be0ec2aafd186d72f6d8f3dd320dbc89f2b6802bca7465f6ccaa43
REGISTERED_EVENT_KEY=0x562c7a296437394d061d12c6da24a8d8aefaf314290ac9b10c768183390ac5e

strip_hex_zeros() {
  local hex=$1
  local stripped=$(echo "$hex" | sed 's/^0x//' | sed 's/^0*//')
  if [ -z "$stripped" ]; then
    echo "0x0"
  else
    echo "0x$stripped"
  fi
}

COMMAND=$1

case $COMMAND in
  register)
    # Parameters: implementation referral_percentage reissuable price_low price_high payment_token metadata
    IMPLEMENTATION=${2:-0x1a2bd193640e652b5c55c11cbfb4776a739a75ba9a7ed7e0a7733a337f55fb4}
    REFERRAL_PCT=${3:-0x5}
    REISSUABLE=${4:-0x1}
    PRICE_LOW=${5:-1000000000000000000}
    PRICE_HIGH=${6:-0}
    PAYMENT_TOKEN=${7:-0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d}
    METADATA=${8:-"{\"name\":\"Sick Starterpack\",\"description\":\"This starterpack is so sick\",\"image_uri\":\"https://storage.googleapis.com/c7e-prod-static/media/ssp.png\",\"items\":[{\"name\":\"Sick Item\",\"description\":\"This item is so sick\",\"image_uri\":\"https://storage.googleapis.com/c7e-prod-static/media/sick_item.png\"}]}"}
    
    RECEIPT_OUTPUT=$(sozo execute --profile $PROFILE $STARTERPACK_ADDRESS register \
      $IMPLEMENTATION $REFERRAL_PCT $REISSUABLE $PRICE_LOW $PRICE_HIGH $PAYMENT_TOKEN \
      str:"$METADATA" --wait --receipt 2>&1)
    
    # Extract JSON from output - sozo outputs "Receipt: {...}" where JSON may be multiline
    # Find line with "Receipt:" and extract everything from that line onwards, then remove the prefix
    RECEIPT_LINE_START=$(echo "$RECEIPT_OUTPUT" | grep -n "Receipt:" | head -1 | cut -d: -f1)
    if [ -n "$RECEIPT_LINE_START" ]; then
      # Extract from receipt line onwards and remove "Receipt: " prefix from first line
      # Store compact version for parsing
      RECEIPT_JSON=$(echo "$RECEIPT_OUTPUT" | sed -n "${RECEIPT_LINE_START},\$p" | sed '1s/.*Receipt: //' | jq -c . 2>/dev/null)
      # Store formatted version for display
      RECEIPT_FORMATTED=$(echo "$RECEIPT_OUTPUT" | sed -n "${RECEIPT_LINE_START},\$p" | sed '1s/.*Receipt: //' | jq . 2>/dev/null)
    else
      # Fallback: try to parse the whole output as JSON or find JSON object
      RECEIPT_JSON=$(echo "$RECEIPT_OUTPUT" | jq -c . 2>/dev/null || echo "$RECEIPT_OUTPUT")
      RECEIPT_FORMATTED=$(echo "$RECEIPT_OUTPUT" | jq . 2>/dev/null || echo "$RECEIPT_OUTPUT")
    fi
    
    # Parse receipt to find REGISTERED_EVENT_KEY and extract all event data
    # Data array indices: starterpack_id (1), implementation (3), referral_percentage (4), 
    # reissuable (5), owner (6), time (7)
    EVENT_DATA=$(echo "$RECEIPT_JSON" | jq -r --arg key "$REGISTERED_EVENT_KEY" '
      if type == "object" and has("events") then
        .events[]? | 
        select(.keys[]? == $key) | 
        {
          starterpack_id: .data[1],
          implementation: .data[3],
          referral_percentage: .data[4],
          reissuable: .data[5],
          owner: .data[6],
          time: .data[7]
        }
      else
        empty
      end
    ' 2>/dev/null)
    
    if [ -z "$EVENT_DATA" ] || [ "$EVENT_DATA" = "null" ] || [ "$EVENT_DATA" = "{}" ]; then
      echo "Error: Could not find REGISTERED_EVENT_KEY in receipt or extract event data"
      echo "Receipt output:"
      echo "$RECEIPT_OUTPUT"
      exit 1
    fi
    
    # Extract individual fields
    STARTERPACK_ID=$(echo "$EVENT_DATA" | jq -r '.starterpack_id // empty')
    IMPLEMENTATION=$(echo "$EVENT_DATA" | jq -r '.implementation // empty')
    REFERRAL_PCT=$(echo "$EVENT_DATA" | jq -r '.referral_percentage // empty')
    REISSUABLE=$(echo "$EVENT_DATA" | jq -r '.reissuable // empty')
    OWNER=$(echo "$EVENT_DATA" | jq -r '.owner // empty')
    TIME=$(echo "$EVENT_DATA" | jq -r '.time // empty')
    
    # Convert reissuable and referral_percentage to decimal
    REISSUABLE_DEC=$(printf "%d" $REISSUABLE 2>/dev/null || echo "unknown")
    REFERRAL_PCT_DEC=$(printf "%d" $REFERRAL_PCT 2>/dev/null || echo "unknown")
    STARTERPACK_ID_DEC=$(printf "%d" $STARTERPACK_ID 2>/dev/null || echo "unknown")
    
    # Convert time to decimal (it's u64, Unix timestamp)
    TIME_DEC=$(printf "%d" $TIME 2>/dev/null || echo "unknown")
    
    # Format Unix timestamp as human-readable date
    if [ "$TIME_DEC" != "unknown" ] && [ -n "$TIME_DEC" ]; then
      TIME_FORMATTED=$(date -d "@$TIME_DEC" "+%Y-%m-%d %H:%M:%S UTC" 2>/dev/null || \
                       date -r "$TIME_DEC" "+%Y-%m-%d %H:%M:%S UTC" 2>/dev/null || \
                       echo "invalid timestamp")
      # Trim any leading/trailing whitespace
      TIME_FORMATTED=$(echo "$TIME_FORMATTED" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    else
      TIME_FORMATTED="unknown"
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "              STARTERPACK REGISTERED                 "
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  Starterpack ID:     $STARTERPACK_ID_DEC ($(strip_hex_zeros $STARTERPACK_ID))"
    echo "  Implementation:     $(strip_hex_zeros $IMPLEMENTATION)"
    echo "  Referral %:         $REFERRAL_PCT_DEC ($(strip_hex_zeros $REFERRAL_PCT))"
    if [ "$REISSUABLE_DEC" = "1" ]; then
      echo "  Reissuable:         Yes"
    elif [ "$REISSUABLE_DEC" = "0" ]; then
      echo "  Reissuable:         No"
    else
      echo "  Reissuable:         $REISSUABLE ($(strip_hex_zeros $REISSUABLE))"
    fi
    echo "  Owner:              $(strip_hex_zeros $OWNER)"
    echo "  Time Created:       $TIME_FORMATTED ($(strip_hex_zeros $TIME))"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ;;
    
  update)
    # Parameters: starterpack_id implementation referral_percentage reissuable price_low price_high payment_token
    STARTERPACK_ID=${2:-}
    IMPLEMENTATION=${3:-}
    REFERRAL_PCT=${4:-}
    REISSUABLE=${5:-}
    PRICE_LOW=${6:-}
    PRICE_HIGH=${7:-}
    PAYMENT_TOKEN=${8:-}
    
    if [ -z "$STARTERPACK_ID" ] || [ -z "$IMPLEMENTATION" ] || [ -z "$REFERRAL_PCT" ] || [ -z "$REISSUABLE" ] || [ -z "$PRICE_LOW" ] || [ -z "$PRICE_HIGH" ] || [ -z "$PAYMENT_TOKEN" ]; then
      echo "Error: All parameters are required"
      echo "Usage: $0 update <starterpack_id> <implementation> <referral_percentage> <reissuable> <price_low> <price_high> <payment_token>"
      exit 1
    fi
    
    sozo execute --profile $PROFILE $STARTERPACK_ADDRESS update \
      $STARTERPACK_ID $IMPLEMENTATION $REFERRAL_PCT $REISSUABLE $PRICE_LOW $PRICE_HIGH $PAYMENT_TOKEN
    ;;
    
  update_metadata)
    # Parameters: starterpack_id metadata
    STARTERPACK_ID=${2:-}
    METADATA=${3:-}
    
    if [ -z "$STARTERPACK_ID" ] || [ -z "$METADATA" ]; then
      echo "Error: starterpack_id and metadata are required"
      echo "Usage: $0 update_metadata <starterpack_id> <metadata_json>"
      exit 1
    fi
    
    sozo execute --profile $PROFILE $STARTERPACK_ADDRESS update_metadata \
      $STARTERPACK_ID str:"$METADATA"
    ;;
    
  supply)
    # Parameters: starterpack_id
    STARTERPACK_ID=${2:-}
    
    if [ -z "$STARTERPACK_ID" ]; then
      echo "Error: starterpack_id is required"
      echo "Usage: $0 supply <starterpack_id>"
      exit 1
    fi
    
    echo "Getting supply for Starterpack ID: $STARTERPACK_ID"
    echo ""
    
    RESULT=$(sozo call --profile $PROFILE $STARTERPACK_ADDRESS supply $STARTERPACK_ID 2>&1)
    
    # Extract values from the array
    VALUES=$(echo "$RESULT" | grep -oP '\[.*\]' | sed 's/\[//g' | sed 's/\]//g' | sed 's/0x0x/0x/g' | tr ' ' '\n' | grep '^0x')
    
    if [ -z "$VALUES" ]; then
      echo "Error: Could not parse supply result"
      echo "$RESULT"
      exit 1
    fi
    
    # Get the variant (first value): 0 = Some, 1 = None (Cairo Option enum order)
    VARIANT=$(echo "$VALUES" | sed -n '1p')
    VARIANT_DEC=$(printf "%d" $VARIANT 2>/dev/null || echo "-1")
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "              STARTERPACK SUPPLY                    "
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    if [ "$VARIANT_DEC" -eq 1 ]; then
      echo "  Supply Limit:     Unlimited (None)"
    elif [ "$VARIANT_DEC" -eq 0 ]; then
      # Some(value) - get the second element
      SUPPLY_HEX=$(echo "$VALUES" | sed -n '2p')
      if [ -n "$SUPPLY_HEX" ]; then
        SUPPLY=$(printf "%d" $SUPPLY_HEX 2>/dev/null || echo "unknown")
        echo "  Supply Limit:     $SUPPLY (Limited Supply)"
      else
        echo "  Supply Limit:     Error parsing value"
      fi
    else
      echo "  Supply Limit:     Unknown variant ($VARIANT_DEC)"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ;;
    
  metadata)
    # Parameters: starterpack_id
    STARTERPACK_ID=${2:-}
    
    if [ -z "$STARTERPACK_ID" ]; then
      echo "Error: starterpack_id is required"
      echo "Usage: $0 metadata <starterpack_id>"
      exit 1
    fi
    
    echo "Getting metadata for Starterpack ID: $STARTERPACK_ID"
    echo ""
    
    RESULT=$(sozo call --profile $PROFILE $STARTERPACK_ADDRESS metadata $STARTERPACK_ID 2>&1)
    
    # Extract the values from the array
    VALUES=$(echo "$RESULT" | grep -oP '\[.*\]' | sed 's/\[//g' | sed 's/\]//g' | sed 's/0x0x/0x/g' | tr ' ' '\n' | grep '^0x')
    
    if [ -z "$VALUES" ]; then
      echo "Error: Could not parse metadata result"
      echo "$RESULT"
      exit 1
    fi
    
    # ByteArray format: [num_full_words, word1, word2, ..., wordN, pending_word, pending_len]
    NUM_WORDS=$(echo "$VALUES" | sed -n '1p')
    NUM_WORDS_DEC=$(printf "%d" $NUM_WORDS 2>/dev/null || echo "0")
    
    TOTAL_LINES=$(echo "$VALUES" | wc -l)
    PENDING_WORD_IDX=$((TOTAL_LINES - 1))
    PENDING_LEN_IDX=$TOTAL_LINES
    
    # Extract hex data and convert to ASCII
    DECODED=""
    
    # Process full words (from index 2 to 1+NUM_WORDS_DEC)
    FULL_WORDS_END=$((1 + NUM_WORDS_DEC))
    for i in $(seq 2 $FULL_WORDS_END); do
      HEX_WORD=$(echo "$VALUES" | sed -n "${i}p")
      # Convert hex to ASCII (remove 0x prefix and convert)
      ASCII=$(echo "$HEX_WORD" | sed 's/^0x//' | xxd -r -p 2>/dev/null || echo "")
      DECODED="${DECODED}${ASCII}"
    done
    
    # Process pending word (second to last element)
    PENDING_WORD=$(echo "$VALUES" | sed -n "${PENDING_WORD_IDX}p")
    if [ -n "$PENDING_WORD" ] && [ "$PENDING_WORD" != "0x0" ]; then
      PENDING_ASCII=$(echo "$PENDING_WORD" | sed 's/^0x//' | xxd -r -p 2>/dev/null || echo "")
      DECODED="${DECODED}${PENDING_ASCII}"
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "              STARTERPACK METADATA                  "
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "$DECODED" | jq '.' 2>/dev/null || echo "$DECODED"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ;;
    
  quote)
    # Parameters: starterpack_id [amount] [has_referral]
    STARTERPACK_ID=${2:-}
    AMOUNT=${3:-1}
    HAS_REFERRAL=${4:-1}
    
    if [ -z "$STARTERPACK_ID" ]; then
      echo "Error: starterpack_id is required"
      echo "Usage: $0 quote <starterpack_id> [amount] [has_referral]"
      exit 1
    fi
    
    echo "Getting quote for Starterpack ID: $STARTERPACK_ID (Amount: $AMOUNT, Has Referral: $HAS_REFERRAL)"
    echo ""
    
    RESULT=$(sozo call --profile $PROFILE $STARTERPACK_ADDRESS quote $STARTERPACK_ID $AMOUNT $HAS_REFERRAL 2>&1)
    
    # Extract the values from the array - split by spaces and filter for 0x values
    VALUES=$(echo "$RESULT" | grep -oP '\[.*\]' | sed 's/\[//g' | sed 's/\]//g' | sed 's/0x0x/0x/g' | tr ' ' '\n' | grep '^0x')
    
    if [ -z "$VALUES" ]; then
      echo "Error: Could not parse quote result"
      echo "$RESULT"
      exit 1
    fi
    
    # Parse the values (u256 values are 2 felts each: low, high)
    BASE_PRICE_LOW=$(echo "$VALUES" | sed -n '1p')
    BASE_PRICE_HIGH=$(echo "$VALUES" | sed -n '2p')
    REFERRAL_FEE_LOW=$(echo "$VALUES" | sed -n '3p')
    REFERRAL_FEE_HIGH=$(echo "$VALUES" | sed -n '4p')
    PROTOCOL_FEE_LOW=$(echo "$VALUES" | sed -n '5p')
    PROTOCOL_FEE_HIGH=$(echo "$VALUES" | sed -n '6p')
    TOTAL_COST_LOW=$(echo "$VALUES" | sed -n '7p')
    TOTAL_COST_HIGH=$(echo "$VALUES" | sed -n '8p')
    PAYMENT_TOKEN=$(echo "$VALUES" | sed -n '9p')
    
    # Convert hex to decimal using Python for arbitrary precision (bash printf overflows at 2^63)
    BASE_PRICE_DEC=$(python3 -c "print(int('$BASE_PRICE_LOW', 16))" 2>/dev/null || echo "0")
    REFERRAL_FEE_DEC=$(python3 -c "print(int('$REFERRAL_FEE_LOW', 16))" 2>/dev/null || echo "0")
    PROTOCOL_FEE_DEC=$(python3 -c "print(int('$PROTOCOL_FEE_LOW', 16))" 2>/dev/null || echo "0")
    TOTAL_COST_DEC=$(python3 -c "print(int('$TOTAL_COST_LOW', 16))" 2>/dev/null || echo "0")
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "                 STARTERPACK QUOTE                  "
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  Base Price:       $BASE_PRICE_DEC ($(strip_hex_zeros $BASE_PRICE_LOW))"
    echo "  Referral Fee:     $REFERRAL_FEE_DEC ($(strip_hex_zeros $REFERRAL_FEE_LOW))"
    echo "  Protocol Fee:     $PROTOCOL_FEE_DEC ($(strip_hex_zeros $PROTOCOL_FEE_LOW))"
    echo "  ────────────────────────────────────────────────────"
    echo "  Total Cost:       $TOTAL_COST_DEC ($(strip_hex_zeros $TOTAL_COST_LOW))"
    echo ""
    echo "  Payment Token:    $(strip_hex_zeros $PAYMENT_TOKEN)"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ;;
    
  deploy_impl)
    # Deploy a new starterpack implementation contract via UDC
    # Parameters: [class_hash] [salt] [unique]
    CLASS_HASH=${2:-0x5496ebd8eb6ff8d40fb17945931bf62b167fcd30669271a716c4ad49d87aaf5}
    SALT=${3:-0x0}
    UNIQUE=${4:-0x1}
    CALLDATA_LEN=${5:-0x0}
    
    if [ -z "$CLASS_HASH" ]; then
      echo "Error: class_hash is required"
      echo "Usage: $0 deploy_impl [class_hash] [salt] [unique]"
      exit 1
    fi
    
    echo "Deploying implementation contract with class hash: $CLASS_HASH"
    starkli declare target/dev/arcade_StarterpackImplementation.contract_class.json
    starkli invoke 0x41a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf \
      deployContract $CLASS_HASH $SALT $UNIQUE $CALLDATA_LEN
    ;;
    
  transfer)
    # Transfer tokens to an address
    # Parameters: recipient [token_address] [amount_low] [amount_high]
    RECIPIENT=${2:-}
    TOKEN_ADDRESS=${3:-0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d}
    AMOUNT_LOW=${4:-1000000000000000000000}
    AMOUNT_HIGH=${5:-0}
    
    if [ -z "$RECIPIENT" ]; then
      echo "Error: recipient address is required"
      echo "Usage: $0 transfer <recipient> [token_address] [amount_low] [amount_high]"
      exit 1
    fi
    
    echo "Transferring tokens..."
    echo "  Token:      $(strip_hex_zeros $TOKEN_ADDRESS)"
    echo "  Recipient:  $(strip_hex_zeros $RECIPIENT)"
    echo "  Amount:     $AMOUNT_LOW (low) $AMOUNT_HIGH (high)"
    echo ""
    
    starkli invoke $TOKEN_ADDRESS transfer $RECIPIENT $AMOUNT_LOW $AMOUNT_HIGH
    ;;
    
  *)
    echo "Usage: $0 <command> [args...]"
    echo ""
    echo "Environment Variables:"
    echo "  PROFILE - Sozo profile to use (default: dev)"
    echo "            Example: PROFILE=mainnet $0 quote 0"
    echo ""
    echo "Commands:"
    echo "  register <implementation> <referral_percentage> <reissuable> <price_low> <price_high> <payment_token> <metadata_json>"
    echo "    Register a new starterpack"
    echo ""
    echo "  update <starterpack_id> <implementation> <referral_percentage> <reissuable> <price_low> <price_high> <payment_token>"
    echo "    Update an existing starterpack"
    echo ""
    echo "  update_metadata <starterpack_id> <metadata_json>"
    echo "    Update metadata for an existing starterpack"
    echo ""
    echo "  supply <starterpack_id>"
    echo "    Get supply limit for a starterpack (None = unlimited)"
    echo ""
    echo "  metadata <starterpack_id>"
    echo "    Get metadata for a starterpack"
    echo ""
    echo "  quote <starterpack_id> [amount] [has_referral]"
    echo "    Get a price quote for a starterpack (amount defaults to 1, has_referral defaults to 1/true)"
    echo ""
    echo "  deploy_impl <class_hash> [salt] [unique]"
    echo "    Deploy a new starterpack implementation contract via UDC"
    echo ""
    echo "  transfer <recipient> [token_address] [amount_low] [amount_high]"
    echo "    Transfer tokens to a recipient address (uses default token and amount if not specified)"
    exit 1
    ;;
esac