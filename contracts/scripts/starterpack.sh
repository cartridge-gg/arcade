#!/bin/bash

# Starterpack management script
# Usage: ./starterpack.sh <command> [args...]

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/../.." || exit 1

STARKNET_RPC=http://localhost:8001/x/starknet/mainnet/rpc/v0_9
PROFILE=${PROFILE:-dev}

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
    IMPLEMENTATION=${2:-0x37639cc1b5bfa16f2546a28eb56f0844313529f01f6cde071d3ef930df754af}
    REFERRAL_PCT=${3:-0x0}
    REISSUABLE=${4:-0x1}
    PRICE_LOW=${5:-1000000000000000000}
    PRICE_HIGH=${6:-0}
    PAYMENT_TOKEN=${7:-0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d}
    METADATA=${8:-"{\"name\":\"Test Starterpack\",\"description\":\"Test\",\"image_uri\":\"https://example.com/image.png\",\"items\":[{\"name\":\"Item\",\"description\":\"Test item\",\"image_uri\":\"https://example.com/item.png\"}]}"}
    
    sozo execute --profile $PROFILE ARCADE-StarterpackRegistry register \
      $IMPLEMENTATION $REFERRAL_PCT $REISSUABLE $PRICE_LOW $PRICE_HIGH $PAYMENT_TOKEN \
      str:"$METADATA"
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
    
    sozo execute --profile $PROFILE ARCADE-StarterpackRegistry update \
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
    
    sozo execute --profile $PROFILE ARCADE-StarterpackRegistry update_metadata \
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
    
    RESULT=$(sozo call --profile $PROFILE ARCADE-StarterpackRegistry supply $STARTERPACK_ID 2>&1)
    
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
    
    RESULT=$(sozo call --profile $PROFILE ARCADE-StarterpackRegistry metadata $STARTERPACK_ID 2>&1)
    
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
    
    RESULT=$(sozo call --profile $PROFILE ARCADE-StarterpackRegistry quote $STARTERPACK_ID $AMOUNT $HAS_REFERRAL 2>&1)
    
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
    
    # Convert hex to decimal (assuming high is 0 for simplicity)
    BASE_PRICE_DEC=$(printf "%d" $BASE_PRICE_LOW 2>/dev/null || echo "0")
    REFERRAL_FEE_DEC=$(printf "%d" $REFERRAL_FEE_LOW 2>/dev/null || echo "0")
    PROTOCOL_FEE_DEC=$(printf "%d" $PROTOCOL_FEE_LOW 2>/dev/null || echo "0")
    TOTAL_COST_DEC=$(printf "%d" $TOTAL_COST_LOW 2>/dev/null || echo "0")
    
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