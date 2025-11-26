// Internal imports

use crate::types::item::Item;

// Constants

pub fn NAMESPACE() -> ByteArray {
    "NAMESPACE"
}

#[starknet::interface]
pub trait IRanker<TContractState> {
    fn submit(
        ref self: TContractState,
        leaderboard_id: felt252,
        game_id: u64,
        player_id: felt252,
        score: u64,
        time: u64,
        to_store: bool,
    );
    fn len(self: @TContractState, leaderboard_id: felt252) -> u64;
    fn at(self: @TContractState, leaderboard_id: felt252, rank: u8) -> Option<Item>;
    fn span(self: @TContractState, leaderboard_id: felt252, count: u8) -> Span<Item>;
    fn set(ref self: TContractState, leaderboard_id: felt252, cap: u8);
    fn hydrate(ref self: TContractState, leaderboard_id: felt252, count: u64, descending: bool);
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

        fn len(self: @ContractState, leaderboard_id: felt252) -> u64 {
            self.rankable.len(leaderboard_id)
        }

        fn at(self: @ContractState, leaderboard_id: felt252, rank: u8) -> Option<Item> {
            self.rankable.at(leaderboard_id, rank)
        }

        fn span(self: @ContractState, leaderboard_id: felt252, count: u8) -> Span<Item> {
            self.rankable.span(leaderboard_id, count)
        }

        fn set(ref self: ContractState, leaderboard_id: felt252, cap: u8) {
            self.rankable.set(leaderboard_id, cap);
        }

        fn hydrate(ref self: ContractState, leaderboard_id: felt252, count: u64, descending: bool) {
            let len = self.rankable.len(leaderboard_id);
            let max = count + len;
            let mut index = if descending {
                max
            } else {
                len
            };

            let player_id: felt252 = 'player';
            while (!descending && index < max) || (descending && index > len) {
                if descending {
                    index -= 1;
                } else {
                    index += 1;
                }
                self
                    .rankable
                    .submit(
                        self.world_storage(),
                        leaderboard_id,
                        index,
                        player_id,
                        index * 10,
                        index * 100,
                        true,
                    );
            }
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
