// Starknet imports

use core::num::traits::Zero;

// Internal imports

use crate::models::index::MerkleTree;

// Errors

pub mod errors {
    pub const MERKLE_TREE_ALREADY_EXISTS: felt252 = 'MerkleTree: already exists';
    pub const MERKLE_TREE_NOT_FOUND: felt252 = 'MerkleTree: not found';
    pub const MERKLE_TREE_INVALID_ROOT: felt252 = 'MerkleTree: invalid root';
    pub const MERKLE_TREE_INVALID_TIME: felt252 = 'MerkleTree: invalid end';
    pub const MERKLE_TREE_EXPIRED: felt252 = 'MerkleTree: expired';
}

// Implementations

#[generate_trait]
pub impl MerkleTreeImpl of MerkleTreeTrait {
    #[inline]
    fn new(root: felt252, end: u64) -> MerkleTree {
        // [Check] Inputs
        MerkleTreeAssert::assert_valid_inputs(root, end);
        // [Return] MerkleTree
        MerkleTree { root, end }
    }
}

// Asserts

#[generate_trait]
pub impl MerkleTreeAssert of MerkleTreeAssertTrait {
    #[inline]
    fn assert_valid_inputs(root: felt252, end: u64) {
        assert(root != 0, errors::MERKLE_TREE_INVALID_ROOT);
        assert(end != 0, errors::MERKLE_TREE_INVALID_TIME);
    }

    #[inline]
    fn assert_does_exist(self: @MerkleTree) {
        assert((*self.end).is_non_zero(), errors::MERKLE_TREE_NOT_FOUND);
    }

    #[inline]
    fn assert_does_not_exist(self: @MerkleTree) {
        assert((*self.end).is_zero(), errors::MERKLE_TREE_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_not_expired(self: @MerkleTree, now: u64) {
        assert(*self.end >= now, errors::MERKLE_TREE_EXPIRED);
    }
}
