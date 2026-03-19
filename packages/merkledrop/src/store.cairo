//! Store struct and component management methods.

// Dojo imports

use dojo::event::EventStorage;
use dojo::model::ModelStorage;
use dojo::world::WorldStorage;

// Internal imports

use crate::events::proofs::MerkleProofsTrait;
use crate::models::index::{MerkleClaim, MerkleTree};

// Structs

#[derive(Copy, Drop)]
pub struct Store {
    world: WorldStorage,
}

// Implementations

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    #[inline]
    fn new(world: WorldStorage) -> Store {
        Store { world: world }
    }
}

// MerkleTree getters/setters

#[generate_trait]
pub impl MerkleTreeStoreImpl of MerkleTreeStoreTrait {
    #[inline]
    fn get_merkle_tree(self: Store, root: felt252) -> MerkleTree {
        self.world.read_model(root)
    }

    #[inline]
    fn set_merkle_tree(mut self: Store, tree: @MerkleTree) {
        self.world.write_model(tree);
    }
}

// MerkleClaim getters/setters

#[generate_trait]
pub impl MerkleClaimStoreImpl of MerkleClaimStoreTrait {
    #[inline]
    fn get_merkle_claim(self: Store, root: felt252, leaf: felt252) -> MerkleClaim {
        self.world.read_model((root, leaf))
    }

    #[inline]
    fn set_merkle_claim(mut self: Store, claim: @MerkleClaim) {
        self.world.write_model(claim);
    }
}

// MerkleProofs event emission

#[generate_trait]
pub impl MerkleProofsStoreImpl of MerkleProofsStoreTrait {
    #[inline]
    fn emit_proofs(
        mut self: Store,
        root: felt252,
        leaf: felt252,
        recipient: felt252,
        proofs: Span<felt252>,
        data: Span<felt252>,
    ) {
        let event = MerkleProofsTrait::new(root, leaf, recipient, proofs, data);
        self.world.emit_event(@event);
    }
}
