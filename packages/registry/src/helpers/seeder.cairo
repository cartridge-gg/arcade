// Core imports

use core::hash::HashStateTrait;
use core::poseidon::{HashState, PoseidonTrait};

#[generate_trait]
pub impl Seeder of SeederTrait {
    #[inline]
    fn reseed(lhs: felt252, rhs: felt252) -> felt252 {
        let state: HashState = PoseidonTrait::new();
        let state = state.update(lhs);
        let state = state.update(rhs);
        state.finalize()
    }
}
