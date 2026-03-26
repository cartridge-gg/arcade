use core::hash::{HashStateExTrait, HashStateTrait};
use core::poseidon::PoseidonTrait;
use openzeppelin::utils::snip12::{SNIP12Metadata, StructHash};
use starknet::ContractAddress;

// selector!(
//   "\"Claim\"(
//    \"bundle_id\":\"felt\",
//    \"voucher_key\":\"felt\",
//    \"recipient\":\"ContractAddress\"
//   )"
// );
const MESSAGE_TYPE_HASH: felt252 =
    0x2E32FE07D207F80C6F19335B5F2352FD4A11C40BEC0D1CC57586BD1C67FFCC6;

#[derive(Copy, Drop, Hash)]
pub struct Message {
    pub bundle_id: felt252,
    pub voucher_key: felt252,
    pub recipient: ContractAddress,
}

impl StructHashImpl of StructHash<Message> {
    fn hash_struct(self: @Message) -> felt252 {
        let hash_state = PoseidonTrait::new();
        hash_state.update_with(MESSAGE_TYPE_HASH).update_with(*self).finalize()
    }
}

impl SNIP12MetadataImpl of SNIP12Metadata {
    fn name() -> felt252 {
        'Bundle'
    }

    fn version() -> felt252 {
        1
    }
}
