// Internal imports

pub use social::events::index::Follow;

// Errors

pub mod errors {
    pub const FOLLOW_INVALID_FOLLOWER: felt252 = 'Follow: invalid follower';
    pub const FOLLOW_INVALID_FOLLOWED: felt252 = 'Follow: invalid followed';
}

// Implementations

#[generate_trait]
pub impl FollowImpl of FollowTrait {
    #[inline]
    fn new(follower: felt252, followed: felt252, time: u64) -> Follow {
        // [Check] Inputs
        // [Info] We don't check points here, leave free the game to decide
        FollowAssert::assert_valid_follower(follower);
        FollowAssert::assert_valid_followed(followed);
        // [Return] Follow
        Follow { follower, followed, time }
    }
}

#[generate_trait]
pub impl FollowAssert of AssertTrait {
    #[inline]
    fn assert_valid_follower(follower: felt252) {
        assert(follower != 0, errors::FOLLOW_INVALID_FOLLOWER);
    }

    #[inline]
    fn assert_valid_followed(followed: felt252) {
        assert(followed != 0, errors::FOLLOW_INVALID_FOLLOWED);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::FollowTrait;

    // Constants

    const FOLLOWER: felt252 = 'FOLLOWER';
    const FOLLOWED: felt252 = 'FOLLOWED';
    const TIME: u64 = 100;

    #[test]
    fn test_follow_new() {
        let follow = FollowTrait::new(FOLLOWER, FOLLOWED, TIME);
        assert_eq!(follow.follower, FOLLOWER);
        assert_eq!(follow.followed, FOLLOWED);
        assert_eq!(follow.time, TIME);
    }

    #[test]
    #[should_panic(expected: ('Follow: invalid follower',))]
    fn test_follow_new_invalid_follower() {
        FollowTrait::new(0, FOLLOWED, TIME);
    }

    #[test]
    #[should_panic(expected: ('Follow: invalid followed',))]
    fn test_follow_new_invalid_followed() {
        FollowTrait::new(FOLLOWER, 0, TIME);
    }
}

