#[starknet::component]
pub mod MerkledropComponent {
    use alexandria_merkle_tree::merkle_tree::poseidon::PoseidonHasherImpl;
    use alexandria_merkle_tree::merkle_tree::{
        Hasher, MerkleTree, MerkleTreeImpl, StoredMerkleTreeImpl,
    };
    use core::num::traits::Zero;
    use core::poseidon::poseidon_hash_span;
    use dojo::world::WorldStorage;
    use starknet::{ContractAddress, get_caller_address};
    use crate::models::claim::{MerkleClaimAssert, MerkleClaimTrait};
    use crate::models::tree::{MerkleTreeAssert, MerkleTreeTrait};
    use crate::store::{
        MerkleClaimStoreTrait, MerkleProofsStoreTrait, MerkleTreeStoreTrait, StoreTrait,
    };

    pub trait IMerkledropImplementation<TContractState, +HasComponent<TContractState>> {
        /// Returns the recipient address for a given data.
        /// The implementation defines the data structure (e.g. hash(claimer, amount)).
        fn get_recipient(
            self: @ComponentState<TContractState>, data: Span<felt252>,
        ) -> ContractAddress;

        /// Called after a successful claim verification.
        /// The implementation should distribute rewards to the recipient.
        fn on_merkledrop_claim(
            ref self: ComponentState<TContractState>,
            root: felt252,
            leaf: felt252,
            receiver: ContractAddress,
            data: Span<felt252>,
        );
    }

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        impl MerkledropImpl: IMerkledropImplementation<TContractState>,
    > of InternalTrait<TContractState> {
        fn register(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            data: Span<Span<felt252>>,
            end: u64,
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
            let mut merkle_tree = MerkleTreeTrait::new(root, end);
            store.set_merkle_tree(@merkle_tree);

            // [Event] Emit proofs for each leaf
            let mut index = 0;
            while let Some(leaf) = leaves.pop_front() {
                let proofs = StoredMerkleTreeImpl::<
                    _, PoseidonHasherImpl,
                >::get_proof(ref tree, index);
                let span = *data.at(index);
                let recipient = MerkledropImpl::get_recipient(self, span);
                store.emit_proofs(root, leaf, recipient.into(), proofs, span);
                index += 1;
            }

            // [Return] Tree id (root)
            root
        }

        fn claim(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            root: felt252,
            proofs: Span<felt252>,
            data: Span<felt252>,
            receiver: ContractAddress,
        ) {
            // [Setup] Datastore
            let store = StoreTrait::new(world);

            // [Check] MerkleTree exists
            let tree = store.get_merkle_tree(root);
            tree.assert_does_exist();

            // [Check] MerkleTree is not expired
            let now = starknet::get_block_timestamp();
            tree.assert_not_expired(now);

            // [Check] Caller is the recipient
            let claimer = get_caller_address();
            let recipient = MerkledropImpl::get_recipient(@self, data);
            assert(recipient == claimer, 'MerkleDrop: not recipient');

            // [Check] Proof is valid
            let leaf = poseidon_hash_span(data);
            let mut merkle_tree: MerkleTree<Hasher> = MerkleTreeImpl::<
                _, PoseidonHasherImpl,
            >::new();
            let valid = MerkleTreeImpl::<
                _, PoseidonHasherImpl,
            >::verify(ref merkle_tree, tree.root, leaf, proofs);
            assert(valid, 'MerkleDrop: invalid proof');

            // [Check] Claim not already made
            let mut merkle_claim = store.get_merkle_claim(root, leaf);
            merkle_claim.assert_not_claimed();

            // [Effect] Claim merkle drop
            let now = starknet::get_block_timestamp();
            merkle_claim.claim(now);
            store.set_merkle_claim(@merkle_claim);

            // [Interaction] Notify implementation
            let receiver = if receiver.is_zero() {
                recipient
            } else {
                receiver
            };
            MerkledropImpl::on_merkledrop_claim(ref self, root, leaf, receiver, data);
        }
    }
}
