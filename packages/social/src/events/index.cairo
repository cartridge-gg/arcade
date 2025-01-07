//! Events

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Follow {
    #[key]
    follower: felt252,
    followed: felt252,
    time: u64,
}
