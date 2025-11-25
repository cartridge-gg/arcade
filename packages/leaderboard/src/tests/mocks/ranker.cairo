// Internal imports

use crate::types::item::Item;

// Constants

pub fn NAMESPACE() -> ByteArray {
    "NAMESPACE"
}

#[starknet::interface]
pub trait IRanker<TContractState> {
    fn set(ref self: TContractState, leaderboard_id: felt252, cap: u8);
    fn len(self: @TContractState, leaderboard_id: felt252) -> u64;
    fn submit(
        ref self: TContractState,
        leaderboard_id: felt252,
        game_id: u64,
        player_id: felt252,
        score: u64,
        time: u64,
        to_store: bool,
    );
    fn at(ref self: TContractState, leaderboard_id: felt252, game_id: u64) -> Option<Item>;
}

#[dojo::contract]
pub mod Ranker {
    use dojo::world::WorldStorage;
    use crate::components::rankable::RankableComponent;
    use crate::types::item::Item;
    use super::{IRanker, NAMESPACE};

    // Components

    component!(path: RankableComponent, storage: rankable, event: RankableEvent);
    pub impl InternalImpl = RankableComponent::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub rankable: RankableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        RankableEvent: RankableComponent::Event,
    }

    #[abi(embed_v0)]
    pub impl RankerImpl of IRanker<ContractState> {
        fn set(ref self: ContractState, leaderboard_id: felt252, cap: u8) {
            self.rankable.set(leaderboard_id, cap);
        }

        fn len(self: @ContractState, leaderboard_id: felt252) -> u64 {
            self.rankable.len(leaderboard_id)
        }

        fn submit(
            ref self: ContractState,
            leaderboard_id: felt252,
            game_id: u64,
            player_id: felt252,
            score: u64,
            time: u64,
            to_store: bool,
        ) {
            self
                .rankable
                .submit(
                    self.world_storage(), leaderboard_id, game_id, player_id, score, time, to_store,
                );
        }

        fn at(ref self: ContractState, leaderboard_id: felt252, game_id: u64) -> Option<Item> {
            self.rankable.at(leaderboard_id, game_id)
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
