// Internal imports

use achievement::types::task::Task;

#[starknet::interface]
pub trait IAchiever<TContractState> {
    fn create(
        self: @TContractState,
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
    );
    fn progress(self: @TContractState, player_id: felt252, task_id: felt252, count: u128);
}

#[dojo::contract]
pub mod Achiever {
    // Dojo imports

    use achievement::components::achievable::AchievableComponent;

    // Internal imports

    use achievement::types::task::Task;
    use dojo::world::WorldStorage;

    // Local imports

    use super::IAchiever;

    // Components

    component!(path: AchievableComponent, storage: achievable, event: AchievableEvent);
    pub impl InternalImpl = AchievableComponent::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub achievable: AchievableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AchievableEvent: AchievableComponent::Event,
    }

    #[abi(embed_v0)]
    pub impl AchieverImpl of IAchiever<ContractState> {
        fn create(
            self: @ContractState,
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
            self
                .achievable
                .create(
                    self.world_storage(),
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

        fn progress(self: @ContractState, player_id: felt252, task_id: felt252, count: u128) {
            self.achievable.progress(self.world_storage(), player_id, task_id, count);
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@"namespace")
        }
    }
}
