//! Heap implementation.

// Imports

use core::dict::{Felt252Dict, Felt252DictTrait};

// Constants

const KEY_OFFSET: felt252 = 252;

/// Traits.
pub trait HeapTrait<T, U> {
    /// Create a new heap.
    /// # Returns
    /// * The heap
    fn new() -> Heap<T, U>;
    /// Check if the heap is empty.
    /// # Arguments
    /// * `self` - The heap
    /// # Returns
    /// * `true` if the heap is empty, `false` otherwise
    fn is_empty(self: @Heap<T, U>) -> bool;
    /// Get an item from the heap if it exists.
    /// # Arguments
    /// * `self` - The heap
    /// * `key` - The key of the item
    /// # Returns
    /// * The item if it exists, `None` otherwise
    fn get(ref self: Heap<T, U>, key: U) -> Option<T>;
    /// Get an item from the heap.
    /// # Arguments
    /// * `self` - The heap
    /// * `key` - The key of the item
    /// # Returns
    /// * The item
    /// # Panics
    /// * If the item does not exist
    fn at(ref self: Heap<T, U>, key: U) -> T;
    /// Check if the heap contains an item.
    /// # Arguments
    /// * `self` - The heap
    /// * `key` - The key of the item
    /// # Returns
    /// * `true` if the item exists, `false` otherwise
    fn contains(ref self: Heap<T, U>, key: U) -> bool;
    /// Add an item to the heap.
    /// # Arguments
    /// * `self` - The heap
    /// * `item` - The item to add
    /// # Effects
    /// * The item is added at the end of the heap and the heap is sorted up
    fn add(ref self: Heap<T, U>, item: T);
    /// Update an item in the heap.
    /// # Arguments
    /// * `self` - The heap
    /// * `item` - The item to update
    /// # Effects
    /// * The item is updated and the heap is sorted up since it cannot be updated with a lower
    /// score in case of A* algorithm
    fn update(ref self: Heap<T, U>, item: T);
    /// Pop the first item from the heap.
    /// # Arguments
    /// * `self` - The heap
    /// # Returns
    /// * The first item if the heap is not empty, `None` otherwise
    fn pop_front(ref self: Heap<T, U>) -> Option<T>;
    /// Sort an item up in the heap.
    /// # Arguments
    /// * `self` - The heap
    /// * `item_key` - The key of the item to sort up
    /// # Effects
    /// * The items are swapped until the item is in the right place
    fn sort_up(ref self: Heap<T, U>, item_key: U);
    /// Sort an item down in the heap.
    /// # Arguments
    /// * `self` - The heap
    /// * `item_key` - The key of the item to sort down
    /// # Effects
    /// * The items are swapped until the item is in the right place
    fn sort_down(ref self: Heap<T, U>, item_key: U);
    /// Swap two items in the heap.
    /// # Arguments
    /// * `self` - The heap
    /// * `lhs` - The key of the first item
    /// * `rhs` - The key of the second item
    /// # Effects
    /// * The items are swapped
    fn swap(ref self: Heap<T, U>, lhs: U, rhs: U);
}

pub trait ItemTrait<T, U> {
    /// Get the key of the item.
    /// # Arguments
    /// * `self` - The item
    /// # Returns
    /// * The key of the item
    fn key(self: T) -> U;
}

/// Types.
#[derive(Clone, Drop, Serde)]
pub struct Heap<T, U> {
    /// The length of the heap.
    pub len: u8,
    /// The keys of the items in the heap and also the indexes of the items in the data.
    /// Both information is stored in the same map to save gas.
    pub keys: Felt252Dict<Nullable<U>>,
    /// The items.
    pub data: Felt252Dict<Nullable<T>>,
}

/// Implementations.
pub impl HeapImpl<
    T,
    U,
    +ItemTrait<T, U>,
    +PartialOrd<T>,
    +Copy<T>,
    +Drop<T>,
    +Copy<U>,
    +Drop<U>,
    +Add<U>,
    +Sub<U>,
    +Mul<U>,
    +Div<U>,
    +PartialOrd<U>,
    +PartialEq<U>,
    +Into<U, felt252>,
    +Into<u8, U>,
> of HeapTrait<T, U> {
    #[inline]
    fn new() -> Heap<T, U> {
        Heap { len: 0, keys: Default::default(), data: Default::default() }
    }

    #[inline]
    fn is_empty(self: @Heap<T, U>) -> bool {
        *self.len == 0
    }

    #[inline]
    fn get(ref self: Heap<T, U>, key: U) -> Option<T> {
        let nullable: Nullable<T> = self.data.get(key.into());
        if nullable.is_null() {
            return Option::None;
        }
        Option::Some(nullable.deref())
    }

    #[inline]
    fn at(ref self: Heap<T, U>, key: U) -> T {
        self.data.get(key.into()).deref()
    }

    #[inline]
    fn contains(ref self: Heap<T, U>, key: U) -> bool {
        let index = self.keys.get(key.into() + KEY_OFFSET).deref();
        let item_key = self.keys.get(index.into()).deref();
        index < self.len.into() && item_key == key
    }

    #[inline]
    fn add(ref self: Heap<T, U>, item: T) {
        // [Effect] Update heap length
        let key = item.key();
        let index = self.len.into();
        self.len += 1;
        // [Effect] Insert item at the end
        self.data.insert(key.into(), NullableTrait::new(item));
        self.keys.insert(index.into(), NullableTrait::new(key));
        self.keys.insert(key.into() + KEY_OFFSET, NullableTrait::new(index));
        // [Effect] Sort up
        self.sort_up(key);
    }

    #[inline]
    fn update(ref self: Heap<T, U>, item: T) {
        // [Effect] Update item
        let key = item.key();
        self.data.insert(key.into(), NullableTrait::new(item));
        // [Effect] Sort up
        self.sort_up(key);
    }

    #[inline]
    fn pop_front(ref self: Heap<T, U>) -> Option<T> {
        if self.is_empty() {
            return Option::None;
        }
        self.len -= 1;
        let first_key: U = self.keys.get(0).deref();
        let mut first: T = self.data.get(first_key.into()).deref();
        if self.len != 0 {
            let last_key: U = self.keys.get(self.len.into()).deref();
            self.swap(first_key, last_key);
            self.sort_down(last_key);
        }
        Option::Some(first)
    }

    #[inline]
    fn sort_up(ref self: Heap<T, U>, item_key: U) {
        // [Compute] Item
        let item: T = self.data.get(item_key.into()).deref();
        let mut index = self.keys.get(item_key.into() + KEY_OFFSET).deref();
        // [Compute] Peform swaps until the item is in the right place
        while index != 0_u8.into() {
            index = (index - 1_u8.into()) / 2_u8.into();
            let parent_key = self.keys.get(index.into()).deref();
            let mut parent: T = self.data.get(parent_key.into()).deref();
            if parent >= item {
                break;
            }
            self.swap(parent_key, item_key);
        }
    }

    #[inline]
    fn sort_down(ref self: Heap<T, U>, item_key: U) {
        // [Compute] Item
        let item: T = self.data.get(item_key.into()).deref();
        let mut index: U = self.keys.get(item_key.into() + KEY_OFFSET).deref();
        // [Compute] Peform swaps until the item is in the right place
        let mut lhs_index = index * 2_u8.into() + 1_u8.into();
        while lhs_index < self.len.into() {
            // [Compute] Child to swap
            index = lhs_index;
            let mut child_key: U = self.keys.get(index.into()).deref();
            let mut child: T = self.data.get(child_key.into()).deref();
            // [Compute] Assess right child side
            let rhs_index = lhs_index + 1_u8.into();
            if rhs_index < self.len.into() {
                let rhs_key: U = self.keys.get(rhs_index.into()).deref();
                let rhs: T = self.data.get(rhs_key.into()).deref();
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
            self.swap(item_key, child_key);
            // [Check] Stop criteria, assess left child side
            lhs_index = index * 2_u8.into() + 1_u8.into();
        }
    }

    #[inline]
    fn swap(ref self: Heap<T, U>, lhs: U, rhs: U) {
        // [Effect] Swap keys
        let lhs_index: U = self.keys.get(lhs.into() + KEY_OFFSET).deref();
        let rhs_index: U = self.keys.get(rhs.into() + KEY_OFFSET).deref();
        self.keys.insert(lhs.into() + KEY_OFFSET, NullableTrait::new(rhs_index));
        self.keys.insert(rhs.into() + KEY_OFFSET, NullableTrait::new(lhs_index));
        self.keys.insert(lhs_index.into(), NullableTrait::new(rhs));
        self.keys.insert(rhs_index.into(), NullableTrait::new(lhs));
    }
}

pub impl DestructHeap<T, U, +Drop<T>, +Drop<U>> of Destruct<Heap<T, U>> {
    fn destruct(self: Heap<T, U>) nopanic {
        self.keys.squash();
        self.data.squash();
    }
}
