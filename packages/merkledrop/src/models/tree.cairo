// Starknet imports

use core::num::traits::Zero;
use starknet::ContractAddress;

// Internal imports

use crate::models::index::MerkleTree;

// Errors

pub mod errors {
    pub const MERKLE_TREE_ALREADY_EXISTS: felt252 = 'MerkleTree: already exists';
    pub const MERKLE_TREE_NOT_FOUND: felt252 = 'MerkleTree: not found';
    pub const MERKLE_TREE_INVALID_ROOT: felt252 = 'MerkleTree: invalid root';
    pub const MERKLE_TREE_INVALID_IMPLEMENTATION: felt252 = 'MerkleTree: invalid implem';
}

// Implementations

#[generate_trait]
pub impl MerkleTreeImpl of MerkleTreeTrait {
    #[inline]
    fn new(root: felt252, implementation: ContractAddress) -> MerkleTree {
        // [Check] Inputs
        MerkleTreeAssert::assert_valid_inputs(root, implementation);
        // [Return] MerkleTree
        MerkleTree { root, implementation }
    }
}

// Asserts

#[generate_trait]
pub impl MerkleTreeAssert of MerkleTreeAssertTrait {
    #[inline]
    fn assert_valid_inputs(root: felt252, implementation: ContractAddress) {
        assert(root != 0, errors::MERKLE_TREE_INVALID_ROOT);
        assert(implementation != 0.try_into().unwrap(), errors::MERKLE_TREE_INVALID_IMPLEMENTATION);
    }

    #[inline]
    fn assert_does_exist(self: @MerkleTree) {
        assert((*self.implementation).is_non_zero(), errors::MERKLE_TREE_NOT_FOUND);
    }

    #[inline]
    fn assert_does_not_exist(self: @MerkleTree) {
        assert((*self.implementation).is_zero(), errors::MERKLE_TREE_ALREADY_EXISTS);
    }
}
