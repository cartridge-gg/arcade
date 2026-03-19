//! Models

use starknet::ContractAddress;

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct MerkleTree {
    #[key]
    pub root: felt252,
    pub implementation: ContractAddress,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct MerkleClaim {
    #[key]
    pub root: felt252,
    #[key]
    pub leaf: felt252,
    pub claimed: u64,
}
