// Internal imports

use starknet::storage_access::StorePacking;

// Constants

const TWO_POW_32: felt252 = 0x100000000;
const TWO_POW_64: felt252 = 0x10000000000000000;
const MASK_32: felt252 = TWO_POW_32 - 1;
const MASK_64: felt252 = TWO_POW_64 - 1;

// Types

#[derive(Copy, Drop, Serde)]
pub struct Item {
    pub key: u64,
    pub score: u64,
    pub time: u64,
}

// Implementations

#[generate_trait]
pub impl ItemImpl of ItemTrait {
    #[inline]
    fn new(key: u64, score: u64, time: u64) -> Item {
        // [Return] Item
        Item { key, score, time }
    }
}

pub impl ItemStorePacking of StorePacking<Item, felt252> {
    fn pack(value: Item) -> felt252 {
        value.key.into() + (value.score.into() * TWO_POW_32) + (value.time.into() * TWO_POW_64)
    }

    fn unpack(value: felt252) -> Item {
        let key = value & MASK_32;
        let score = (value / TWO_POW_32) & MASK_32;
        let time = (value / TWO_POW_64);

        Item {
            key: key.try_into().unwrap(),
            score: score.try_into().unwrap(),
            time: time.try_into().unwrap(),
        }
    }
}

pub impl ItemZero of core::num::traits::Zero<Item> {
    #[inline]
    fn zero() -> Item {
        Item { key: 0, score: 0, time: 0 }
    }

    #[inline]
    fn is_zero(self: @Item) -> bool {
        self.key == @0 && self.score == @0 && self.time == @0
    }

    #[inline]
    fn is_non_zero(self: @Item) -> bool {
        !self.is_zero()
    }
}

pub impl ItemPartialEq of PartialEq<Item> {
    #[inline]
    fn eq(lhs: @Item, rhs: @Item) -> bool {
        lhs.key == rhs.key
    }

    #[inline]
    fn ne(lhs: @Item, rhs: @Item) -> bool {
        lhs.key != rhs.key
    }
}

pub impl ItemPartialOrd of PartialOrd<Item> {
    #[inline]
    fn lt(lhs: Item, rhs: Item) -> bool {
        if lhs.score == rhs.score {
            return lhs.time > rhs.time;
        }
        lhs.score < rhs.score
    }

    #[inline]
    fn le(lhs: Item, rhs: Item) -> bool {
        if lhs.score == rhs.score {
            return lhs.time >= rhs.time;
        }
        lhs.score <= rhs.score
    }

    #[inline]
    fn gt(lhs: Item, rhs: Item) -> bool {
        if lhs.score == rhs.score {
            return lhs.time < rhs.time;
        }
        lhs.score > rhs.score
    }

    #[inline]
    fn ge(lhs: Item, rhs: Item) -> bool {
        if lhs.score == rhs.score {
            return lhs.time <= rhs.time;
        }
        lhs.score >= rhs.score
    }
}

impl Felt252BitAnd of core::traits::BitAnd<felt252> {
    #[inline]
    fn bitand(lhs: felt252, rhs: felt252) -> felt252 {
        let lhs_u256: u256 = lhs.into();
        let rhs_u256: u256 = rhs.into();
        let result_u256 = lhs_u256 & rhs_u256;
        result_u256.try_into().unwrap()
    }
}

impl Felt252Div of core::traits::Div<felt252> {
    #[inline]
    fn div(lhs: felt252, rhs: felt252) -> felt252 {
        let lhs_u256: u256 = lhs.into();
        let rhs_u256: u256 = rhs.into();
        let result_u256 = lhs_u256 / rhs_u256;
        result_u256.try_into().unwrap()
    }
}
