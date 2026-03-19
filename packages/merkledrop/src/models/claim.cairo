// Internal imports

use crate::models::index::MerkleClaim;

// Errors

pub mod errors {
    pub const MERKLE_CLAIM_ALREADY_CLAIMED: felt252 = 'MerkleClaim: already claimed';
    pub const MERKLE_CLAIM_INVALID_ROOT: felt252 = 'MerkleClaim: invalid root';
    pub const MERKLE_CLAIM_INVALID_LEAF: felt252 = 'MerkleClaim: invalid leaf';
}

// Implementations

#[generate_trait]
pub impl MerkleClaimImpl of MerkleClaimTrait {
    #[inline]
    fn new(root: felt252, leaf: felt252) -> MerkleClaim {
        // [Check] Inputs
        MerkleClaimAssert::assert_valid_inputs(root, leaf);
        // [Return] MerkleClaim
        MerkleClaim { root, leaf, claimed: 0 }
    }

    #[inline]
    fn claim(ref self: MerkleClaim, time: u64) {
        self.claimed = time;
    }
}

// Asserts

#[generate_trait]
pub impl MerkleClaimAssert of MerkleClaimAssertTrait {
    #[inline]
    fn assert_valid_inputs(tree_id: felt252, leaf: felt252) {
        assert(tree_id != 0, errors::MERKLE_CLAIM_INVALID_ROOT);
        assert(leaf != 0, errors::MERKLE_CLAIM_INVALID_LEAF);
    }

    #[inline]
    fn assert_not_claimed(self: @MerkleClaim) {
        assert(*self.claimed == 0, errors::MERKLE_CLAIM_ALREADY_CLAIMED);
    }
}
