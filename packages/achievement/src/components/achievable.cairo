#[starknet::component]
pub mod AchievableComponent {
    // Dojo imports

    use dojo::world::WorldStorage;

    // Internal imports

    use achievement::types::task::Task;
    use achievement::store::{Store, StoreTrait};

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
        /// Create an achievement
        ///
        /// # Arguments
        ///
        /// * `self`: The component state.
        /// * `world`: The world storage.
        /// * `id`: The achievement identifier, it should be unique.
        /// * `hidden`: Speicify if you want the achievement to be hidden in the controller UI.
        /// * `index`: The achievement index which the page of the achievement group page.
        /// * `points`: The achievement points to reward the player.
        /// * `start`: The achievement start timestamp, `0` for everlasting achievements.
        /// * `end`: The achievement end timestamp, `0` for everlasting achievements.
        /// * `group`: The achievement group, it should be used to group achievements together.
        /// * `icon`: The achievement icon, it should be a FontAwesome icon name (e.g. `fa-trophy`).
        /// * `title`: The achievement title.
        /// * `description`: The achievement global description.
        /// * `tasks`: The achievement tasks (see also `Task` type).
        /// * `data`: The achievement data, not used yet but could have a future use.
        fn create(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            id: felt252,
            hidden: bool,
            index: u8,
            points: u16,
            start: u64,
            end: u64,
            group: felt252,
            icon: felt252,
            title: felt252,
            description: ByteArray,
            tasks: Span<Task>,
            data: ByteArray,
        ) {
            // [Setup] Store
            let store: Store = StoreTrait::new(world);

            // [Event] Emit achievement creation
            store
                .create(
                    id,
                    hidden,
                    index,
                    points,
                    start,
                    end,
                    group,
                    icon,
                    title,
                    description,
                    tasks,
                    data,
                );
        }

        /// Progress on an achievement
        ///
        /// # Arguments
        ///
        /// * `self`: The component state.
        /// * `world`: The world storage.
        /// * `player_id`: The player identifier.
        /// * `task_id`: The task identifier.
        /// * `count`: The progression count to add.
        fn progress(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            task_id: felt252,
            count: u128,
        ) {
            // [Setup] Store
            let store: Store = StoreTrait::new(world);

            // [Event] Emit achievement completion
            let time: u64 = starknet::get_block_timestamp();
            store.progress(player_id, task_id, count, time);
        }
    }
}
