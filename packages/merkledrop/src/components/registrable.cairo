#[starknet::component]
pub mod RegistrableComponent {
    use alexandria_merkle_tree::merkle_tree::poseidon::PoseidonHasherImpl;
    use alexandria_merkle_tree::merkle_tree::{
        Hasher, MerkleTree, MerkleTreeImpl, StoredMerkleTreeImpl,
    };
    use core::poseidon::poseidon_hash_span;
    use dojo::world::WorldStorage;
    use starknet::{ContractAddress, get_caller_address};
    use crate::interfaces::{
        IMerkleDropImplementationDispatcher as ImplementationDispatcher,
        IMerkleDropImplementationDispatcherTrait,
    };
    use crate::models::claim::{MerkleClaimAssert, MerkleClaimTrait};
    use crate::models::tree::{MerkleTreeAssert, MerkleTreeTrait};
    use crate::store::{
        MerkleClaimStoreTrait, MerkleProofsStoreTrait, MerkleTreeStoreTrait, StoreTrait,
    };

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn register(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            implementation: ContractAddress,
            data: Span<Span<felt252>>,
        ) -> felt252 {
            // [Setup] Datastore
            let store = StoreTrait::new(world);

            // [Compute] Build merkle tree from leaves
            let mut leaves = array![];
            for span in data {
                leaves.append(poseidon_hash_span(*span));
            }
            let mut tree = StoredMerkleTreeImpl::<_, PoseidonHasherImpl>::new(leaves.clone());
            let root = StoredMerkleTreeImpl::<_, PoseidonHasherImpl>::get_root(ref tree);

            // [Check] MerkleTree does not already exist
            let existing = store.get_merkle_tree(root);
            existing.assert_does_not_exist();

            // [Effect] Create and store MerkleTree
            let mut merkle_tree = MerkleTreeTrait::new(root, implementation);
            store.set_merkle_tree(@merkle_tree);

            // [Event] Emit proofs for each leaf
            let implementation = ImplementationDispatcher { contract_address: implementation };
            let mut index = 0;
            while let Some(leaf) = leaves.pop_front() {
                let proofs = StoredMerkleTreeImpl::<
                    _, PoseidonHasherImpl,
                >::get_proof(ref tree, index);
                let span = *data.at(index);
                let recipient = implementation.get_recipient(span);
                store.emit_proofs(root, leaf, recipient.into(), proofs, span);
                index += 1;
            }

            // [Return] Tree id (root)
            root
        }

        fn claim(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            tree_id: felt252,
            proofs: Span<felt252>,
            data: Span<felt252>,
        ) {
            // [Setup] Datastore
            let store = StoreTrait::new(world);

            // [Check] MerkleTree exists
            let tree = store.get_merkle_tree(tree_id);
            tree.assert_does_exist();

            // [Check] Caller is the recipient
            let implementation = ImplementationDispatcher { contract_address: tree.implementation };
            let claimer = get_caller_address();
            let recipient = implementation.get_recipient(data);
            assert(recipient == claimer, 'MerkleDrop: not recipient');

            // [Check] Proof is valid (tree_id is the root)
            let leaf = poseidon_hash_span(data);
            let mut merkle_tree: MerkleTree<Hasher> = MerkleTreeImpl::<
                _, PoseidonHasherImpl,
            >::new();
            let valid = MerkleTreeImpl::<
                _, PoseidonHasherImpl,
            >::verify(ref merkle_tree, tree.root, leaf, proofs);
            assert(valid, 'MerkleDrop: invalid proof');

            // [Check] Claim not already made
            let mut merkle_claim = store.get_merkle_claim(tree_id, leaf);
            merkle_claim.assert_not_claimed();

            // [Effect] Mark as claimed
            let now = starknet::get_block_timestamp();
            merkle_claim.claim(now);
            store.set_merkle_claim(@merkle_claim);

            // [Interaction] Notify implementation
            implementation.on_merkledrop_claim(tree_id, leaf, claimer);
        }
    }
}
