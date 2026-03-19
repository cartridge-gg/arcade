// Internal imports

pub use crate::events::index::MerkleProofs;

// Implementations

#[generate_trait]
pub impl MerkleProofsImpl of MerkleProofsTrait {
    #[inline]
    fn new(
        root: felt252, proofs: Span<felt252>, data: Span<felt252>, leaf: felt252,
    ) -> MerkleProofs {
        MerkleProofs { root, proofs, data, leaf }
    }
}
