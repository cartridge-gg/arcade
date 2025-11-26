#[starknet::component]
pub mod RankableComponent {
    use core::num::traits::Bounded;
    use dojo::world::WorldStorage;
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use crate::helpers::heap::HeapTrait;
    use crate::store::StoreTrait;
    use crate::types::item::{Item, ItemStorePacking, ItemTrait, ItemZero};

    // Constants

    pub const KEY_OFFSET: felt252 = 252;

    // Storage

    #[storage]
    pub struct Storage {
        pub cap: Map<felt252, u8>,
        pub len: Map<felt252, u8>,
        pub keys: Map<felt252, Map<felt252, u128>>,
        pub data: Map<felt252, Map<felt252, Item>>,
        pub lowest_key: Map<felt252, u128>,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        #[inline]
        fn set(ref self: ComponentState<TContractState>, leaderboard_id: felt252, cap: u8) {
            self.cap.entry(leaderboard_id).write(cap);
        }

        #[inline]
        fn cap(self: @ComponentState<TContractState>, leaderboard_id: felt252) -> u8 {
            self.cap.entry(leaderboard_id).read()
        }

        #[inline]
        fn len(self: @ComponentState<TContractState>, leaderboard_id: felt252) -> u64 {
            self.len.entry(leaderboard_id).read().into()
        }

        #[inline]
        fn is_empty(self: @ComponentState<TContractState>, leaderboard_id: felt252) -> bool {
            self.len.entry(leaderboard_id).read() == 0
        }

        #[inline]
        fn span(
            self: @ComponentState<TContractState>, leaderboard_id: felt252, count: u8,
        ) -> Span<Item> {
            let mut heap = HeapTrait::new();
            let mut index = self.len.entry(leaderboard_id).read();
            while index > 0 {
                index -= 1;
                let key = self.keys.entry(leaderboard_id).entry(index.into()).read();
                let item = self.data.entry(leaderboard_id).entry(key.into()).read();
                heap.add(item);
            }
            heap.span(count)
        }

        #[inline]
        fn get(self: @ComponentState<TContractState>, leaderboard_id: felt252, key: u128) -> Item {
            self.data.entry(leaderboard_id).entry(key.into()).read()
        }

        #[inline]
        fn at(
            self: @ComponentState<TContractState>, leaderboard_id: felt252, rank: u8,
        ) -> Option<Item> {
            // [Check] Rank is valid
            if rank >= self.len.entry(leaderboard_id).read() {
                return Option::None;
            }
            // [Return] Item at the rank
            Option::Some(*self.span(leaderboard_id, 1 + rank).at(rank.into()))
        }

        #[inline]
        fn submit(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            leaderboard_id: felt252,
            game_id: u64,
            player_id: felt252,
            score: u64,
            time: u64,
            to_store: bool,
        ) {
            // [Setup] Datastore
            let store = StoreTrait::new(world);
            // [Event] Submit score
            store
                .submit(
                    leaderboard_id: leaderboard_id,
                    game_id: game_id.into(),
                    player_id: player_id,
                    score: score,
                    time: time,
                );
            // [Check] Store score if required, skip otherwise
            if (!to_store) {
                return;
            }
            // [Effect] Store score
            let item = ItemTrait::new(game_id, score, time);
            self.insert(leaderboard_id, item);
        }

        #[inline]
        fn pop_front(
            ref self: ComponentState<TContractState>, leaderboard_id: felt252,
        ) -> Option<Item> {
            if self.is_empty(leaderboard_id) {
                return Option::None;
            }
            let len = self.len.entry(leaderboard_id).read() - 1;
            self.len.entry(leaderboard_id).write(len);
            let first_key: u128 = self.keys.entry(leaderboard_id).entry(0).read();
            let mut first: Item = self.data.entry(leaderboard_id).entry(first_key.into()).read();
            if len != 0 {
                let last_key: u128 = self.keys.entry(leaderboard_id).entry(len.into()).read();
                self.swap(leaderboard_id, first_key, last_key);
                self.sort_down(leaderboard_id, last_key);
            }
            Option::Some(first)
        }
    }

    #[generate_trait]
    pub impl PrivateImpl<
        TContractState, +HasComponent<TContractState>,
    > of PrivateTrait<TContractState> {
        #[inline]
        fn contains(
            self: @ComponentState<TContractState>, leaderboard_id: felt252, key: u128,
        ) -> bool {
            let index = self.keys.entry(leaderboard_id).entry(key.into() + KEY_OFFSET).read();
            let item_key = self.keys.entry(leaderboard_id).entry(index.into()).read();
            index < self.len.entry(leaderboard_id).read().into() && item_key == key
        }

        #[inline]
        fn insert(ref self: ComponentState<TContractState>, leaderboard_id: felt252, item: Item) {
            // [Check] Item is already in the leaderboard
            if self.contains(leaderboard_id, item.key.into()) {
                // [Effect] Update item
                self.update(leaderboard_id, item);
                return;
            }
            // [Effect] Add item
            self.add(leaderboard_id, item);
        }

        #[inline]
        fn add(ref self: ComponentState<TContractState>, leaderboard_id: felt252, item: Item) {
            // [Check] Capacity is reached and new item is lower than the lowest item, then skip
            let lowest_key: u128 = self.lowest_key.entry(leaderboard_id).read();
            let lowest_item = self.data.entry(leaderboard_id).entry(lowest_key.into()).read();
            let len: u8 = self.len.entry(leaderboard_id).read();
            let cap = self.cap.entry(leaderboard_id).read();
            if (len == cap || len == Bounded::MAX) && item < lowest_item {
                return;
            }
            // [Effect] Update lowest item if it is greater than the new item
            let key: u128 = item.key.into();
            if lowest_item.is_zero() || lowest_item > item {
                self.lowest_key.entry(leaderboard_id).write(key);
            }
            // [Effect] Update length if capacity is not exceeded
            let mut index = len.into();
            if len < cap || (cap == 0 && len != Bounded::MAX) {
                // [Effect] Increment leaderboard length if the capacity is not exceeded
                self.len.entry(leaderboard_id).write(self.len.entry(leaderboard_id).read() + 1);
            } else {
                // [Effect] Otherwise, keep the same length and swap the lowest and the last item
                index -= 1;
                self.swap(leaderboard_id, index, lowest_key);
            }
            // [Effect] Insert item at the end
            self.data.entry(leaderboard_id).entry(key.into()).write(item);
            self.keys.entry(leaderboard_id).entry(index.into()).write(key);
            self.keys.entry(leaderboard_id).entry(key.into() + KEY_OFFSET).write(index);
            // [Effect] Sort up
            self.sort_up(leaderboard_id, key);
        }

        #[inline]
        fn update(ref self: ComponentState<TContractState>, leaderboard_id: felt252, item: Item) {
            // [Effect] Update item
            let key: u128 = item.key.into();
            self.data.entry(leaderboard_id).entry(key.into()).write(item);
            // [Effect] Sort up
            self.sort_down(leaderboard_id, key);
            self.sort_up(leaderboard_id, key);
        }

        #[inline]
        fn sort_up(
            ref self: ComponentState<TContractState>, leaderboard_id: felt252, item_key: u128,
        ) {
            // [Compute] Item
            let item: Item = self.data.entry(leaderboard_id).entry(item_key.into()).read();
            let mut index = self
                .keys
                .entry(leaderboard_id)
                .entry(item_key.into() + KEY_OFFSET)
                .read();
            // [Compute] Peform swaps until the item is in the right place
            while index != 0_u8.into() {
                index = (index - 1_u8.into()) / 2_u8.into();
                let parent_key = self.keys.entry(leaderboard_id).entry(index.into()).read();
                let mut parent: Item = self
                    .data
                    .entry(leaderboard_id)
                    .entry(parent_key.into())
                    .read();
                if parent >= item {
                    break;
                }
                self.swap(leaderboard_id, parent_key, item_key);
            }
        }

        #[inline]
        fn sort_down(
            ref self: ComponentState<TContractState>, leaderboard_id: felt252, item_key: u128,
        ) {
            // [Compute] Item
            let item: Item = self.data.entry(leaderboard_id).entry(item_key.into()).read();
            let mut index: u128 = self
                .keys
                .entry(leaderboard_id)
                .entry(item_key.into() + KEY_OFFSET)
                .read();
            // [Compute] Peform swaps until the item is in the right place
            let len: u128 = self.len.entry(leaderboard_id).read().into();
            let mut lhs_index = index * 2 + 1;
            while lhs_index < len {
                // [Compute] Child to swap
                index = lhs_index;
                let mut child_key: u128 = self
                    .keys
                    .entry(leaderboard_id)
                    .entry(index.into())
                    .read();
                let mut child: Item = self
                    .data
                    .entry(leaderboard_id)
                    .entry(child_key.into())
                    .read();
                // [Compute] Assess right child side
                let rhs_index = lhs_index + 1;
                if rhs_index < len {
                    let rhs_key: u128 = self
                        .keys
                        .entry(leaderboard_id)
                        .entry(rhs_index.into())
                        .read();
                    let rhs: Item = self.data.entry(leaderboard_id).entry(rhs_key.into()).read();
                    if rhs > child {
                        index = rhs_index;
                        child_key = rhs_key;
                        child = rhs;
                    };
                }
                // [Effect] Swap if necessary
                if item >= child {
                    break;
                }
                self.swap(leaderboard_id, item_key, child_key);
                // [Check] Stop criteria, assess left child side
                lhs_index = index * 2_u8.into() + 1_u8.into();
            }
        }

        #[inline]
        fn swap(
            ref self: ComponentState<TContractState>, leaderboard_id: felt252, lhs: u128, rhs: u128,
        ) {
            // [Effect] Swap keys
            let lhs_index: u128 = self
                .keys
                .entry(leaderboard_id)
                .entry(lhs.into() + KEY_OFFSET)
                .read();
            let rhs_index: u128 = self
                .keys
                .entry(leaderboard_id)
                .entry(rhs.into() + KEY_OFFSET)
                .read();
            self.keys.entry(leaderboard_id).entry(lhs.into() + KEY_OFFSET).write(rhs_index);
            self.keys.entry(leaderboard_id).entry(rhs.into() + KEY_OFFSET).write(lhs_index);
            self.keys.entry(leaderboard_id).entry(lhs_index.into()).write(rhs);
            self.keys.entry(leaderboard_id).entry(rhs_index.into()).write(lhs);
        }
    }
}
