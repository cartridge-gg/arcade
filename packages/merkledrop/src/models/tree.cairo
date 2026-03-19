// Starknet imports

use core::num::traits::Zero;

// Internal imports

use crate::models::index::MerkleTree;

// Errors

pub mod errors {
    pub const MERKLE_TREE_ALREADY_EXISTS: felt252 = 'MerkleTree: already exists';
    pub const MERKLE_TREE_NOT_FOUND: felt252 = 'MerkleTree: not found';
    pub const MERKLE_TREE_INVALID_ROOT: felt252 = 'MerkleTree: invalid root';
    pub const MERKLE_TREE_INVALID_TIME: felt252 = 'MerkleTree: invalid time';
}

// Implementations

#[generate_trait]
pub impl MerkleTreeImpl of MerkleTreeTrait {
    #[inline]
    fn new(root: felt252, time: u64) -> MerkleTree {
        // [Check] Inputs
        MerkleTreeAssert::assert_valid_inputs(root, time);
        // [Return] MerkleTree
        MerkleTree { root, time }
    }
}

// Asserts

#[generate_trait]
pub impl MerkleTreeAssert of MerkleTreeAssertTrait {
    #[inline]
    fn assert_valid_inputs(root: felt252, time: u64) {
        assert(root != 0, errors::MERKLE_TREE_INVALID_ROOT);
        assert(time != 0, errors::MERKLE_TREE_INVALID_TIME);
    }

    #[inline]
    fn assert_does_exist(self: @MerkleTree) {
        assert((*self.time).is_non_zero(), errors::MERKLE_TREE_NOT_FOUND);
    }

    #[inline]
    fn assert_does_not_exist(self: @MerkleTree) {
        assert((*self.time).is_zero(), errors::MERKLE_TREE_ALREADY_EXISTS);
    }
}
