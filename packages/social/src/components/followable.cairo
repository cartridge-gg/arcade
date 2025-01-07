#[starknet::component]
mod FollowableComponent {
    // Dojo imports

    use dojo::world::WorldStorage;

    // Internal imports

    use social::store::{Store, StoreTrait};

    // Storage

    #[storage]
    struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {}

    #[generate_trait]
    impl InternalImpl<
        TContractState, +HasComponent<TContractState>
    > of InternalTrait<TContractState> {
        fn follow(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            followed: felt252
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Effect] Follow
            let time = starknet::get_block_timestamp();
            store.follow(player_id, followed, time);
        }

        fn unfollow(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            followed: felt252
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Effect] Unfollow
            store.unfollow(player_id, followed);
        }
    }
}
