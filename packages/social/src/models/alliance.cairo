// External imports

use registry::types::metadata::Metadata;
use registry::types::socials::Socials;
use registry::helpers::json::JsonifiableTrait;

// Internal imports

use social::constants::MAX_GUILD_COUNT;
use social::models::index::Alliance;
use social::types::role::Role;

// Errors

pub mod errors {
    pub const ALLIANCE_ALREADY_EXISTS: felt252 = 'Alliance: already exists';
    pub const ALLIANCE_NOT_EXIST: felt252 = 'Alliance: does not exist';
    pub const ALLIANCE_CANNOT_HIRE: felt252 = 'Alliance: cannot hire';
    pub const ALLIANCE_CANNOT_FIRE: felt252 = 'Alliance: cannot fire';
    pub const ALLIANCE_IS_OPEN: felt252 = 'Alliance: is open';
    pub const ALLIANCE_IS_CLOSE: felt252 = 'Alliance: is close';
    pub const ALLIANCE_CANNOT_JOIN: felt252 = 'Alliance: cannot join';
    pub const ALLIANCE_CANNOT_LEAVE: felt252 = 'Alliance: cannot leave';
    pub const ALLIANCE_CANNOT_CROWN: felt252 = 'Alliance: cannot crown';
    pub const ALLIANCE_CANNOT_UNCROWN: felt252 = 'Alliance: cannot un-crown';
    pub const ALLIANCE_CANNOT_REQUEST: felt252 = 'Alliance: cannot request';
    pub const ALLIANCE_CANNOT_CANCEL: felt252 = 'Alliance: cannot cancel';
}

#[generate_trait]
impl AllianceImpl of AllianceTrait {
    #[inline]
    fn new(id: u32, metadata: Metadata, socials: Socials) -> Alliance {
        Alliance {
            id: id,
            open: false,
            free: false,
            guild_count: 0,
            metadata: metadata.jsonify(),
            socials: socials.jsonify(),
        }
    }

    #[inline]
    fn open(ref self: Alliance, free: bool) {
        // [Check] Alliance can be opened
        self.assert_is_close();
        // [Update] Alliance
        self.open = true;
        self.free = free;
    }

    #[inline]
    fn close(ref self: Alliance) {
        // [Check] Alliance can be closed
        self.assert_is_open();
        // [Update] Alliance
        self.open = false;
        self.free = false;
    }

    #[inline]
    fn hire(ref self: Alliance) {
        // [Check] Alliance can be hired
        self.assert_can_hire();
        // [Update] Alliance
        self.guild_count += 1;
    }

    #[inline]
    fn fire(ref self: Alliance) {
        // [Check] Alliance can be fired
        self.assert_can_fire();
        // [Update] Alliance
        self.guild_count -= 1;
    }
}

#[generate_trait]
impl AllianceAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @Alliance) {
        assert(*self.guild_count == 0, errors::ALLIANCE_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Alliance) {
        assert(*self.guild_count != 0, errors::ALLIANCE_NOT_EXIST);
    }

    #[inline]
    fn assert_is_open(self: @Alliance) {
        assert(*self.open, errors::ALLIANCE_IS_CLOSE);
    }

    #[inline]
    fn assert_is_close(self: @Alliance) {
        assert(!*self.open, errors::ALLIANCE_IS_OPEN);
    }

    #[inline]
    fn assert_can_hire(self: @Alliance) {
        assert(*self.guild_count < MAX_GUILD_COUNT, errors::ALLIANCE_CANNOT_HIRE);
    }

    #[inline]
    fn assert_can_fire(self: @Alliance) {
        assert(*self.guild_count > 0, errors::ALLIANCE_CANNOT_FIRE);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{Alliance, AllianceTrait, AllianceAssert, Role, Metadata, Socials};

    // Constants

    const ALLIANCE_ID: u32 = 42;

    #[test]
    fn test_alliance_new() {
        let metadata = core::Default::default();
        let socials = core::Default::default();
        let guild = AllianceTrait::new(ALLIANCE_ID, metadata, socials);
        assert_eq!(guild.id, ALLIANCE_ID);
        assert_eq!(guild.open, false);
        assert_eq!(guild.free, false);
        assert_eq!(guild.guild_count, 0);
    }
}
