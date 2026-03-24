use core::hash::{HashStateExTrait, HashStateTrait};
use core::poseidon::PoseidonTrait;
use openzeppelin::utils::snip12::{SNIP12Metadata, StructHash};
use starknet::ContractAddress;

const MESSAGE_TYPE_HASH: felt252 =
    0x167C047B875B239F26D56026FCF3631416FD02D0686053AA6AD7DB8BF56669B;
// const MESSAGE_TYPE_HASH: felt252 = selector!(
//     "\"Claim\"(\"bundle_id\":\"u32\",\"voucher_key\":\"felt\",\"recipient\":\"ContractAddress\")",
// );

#[derive(Copy, Drop, Hash)]
pub struct Message {
    pub bundle_id: u32,
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
