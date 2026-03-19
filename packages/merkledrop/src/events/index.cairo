//! Events

#[derive(Drop, Serde)]
#[dojo::event]
pub struct MerkleProofs {
    #[key]
    pub root: felt252,
    pub proofs: Span<felt252>,
    pub data: Span<felt252>,
    pub leaf: felt252,
}
