#[starknet::component]
pub mod PinnableComponent {
    // Dojo imports

    // Internal imports

    use achievement::store::{Store, StoreTrait};
    use dojo::world::WorldStorage;

    // Errors

    mod errors {}

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
        fn pin(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            achievement_id: felt252,
        ) {
            // [Setup] Store
            let store: Store = StoreTrait::new(world);

            // [Event] Emit achievement creation
            let time = starknet::get_block_timestamp();
            store.pin(player_id, achievement_id, time);
        }

        fn unpin(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            achievement_id: felt252,
        ) {
            let store: Store = StoreTrait::new(world);
            store.unpin(player_id, achievement_id);
        }
    }
}
