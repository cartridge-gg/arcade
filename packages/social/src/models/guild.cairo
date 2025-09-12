// Internal imports

use social::constants::MAX_MEMBER_COUNT;
pub use social::models::index::Guild;
use social::types::role::Role;

// Errors

pub mod errors {
    pub const GUILD_ALREADY_EXISTS: felt252 = 'Guild: already exists';
    pub const GUILD_NOT_EXIST: felt252 = 'Guild: does not exist';
    pub const GUILD_CANNOT_HIRE: felt252 = 'Guild: cannot hire';
    pub const GUILD_CANNOT_FIRE: felt252 = 'Guild: cannot fire';
    pub const GUILD_IS_OPEN: felt252 = 'Guild: is open';
    pub const GUILD_IS_CLOSE: felt252 = 'Guild: is close';
    pub const GUILD_CANNOT_JOIN: felt252 = 'Guild: cannot join';
    pub const GUILD_CANNOT_LEAVE: felt252 = 'Guild: cannot leave';
    pub const GUILD_CANNOT_CROWN: felt252 = 'Guild: cannot crown';
    pub const GUILD_CANNOT_UNCROWN: felt252 = 'Guild: cannot un-crown';
    pub const GUILD_CANNOT_REQUEST: felt252 = 'Guild: cannot request';
    pub const GUILD_CANNOT_CANCEL: felt252 = 'Guild: cannot cancel';
    pub const GUILD_NOT_A_REQUESTER: felt252 = 'Guild: not a requester';
    pub const GUILD_NOT_IN_ALLIANCE: felt252 = 'Guild: not in alliance';
    pub const GUILD_NOT_ALLOWED: felt252 = 'Guild: not allowed';
    pub const GUILD_NOT_AUTHORIZED: felt252 = 'Guild: not authorized';
}

#[generate_trait]
pub impl GuildImpl of GuildTrait {
    #[inline]
    fn new(id: u32, metadata: ByteArray, socials: ByteArray) -> Guild {
        Guild {
            id: id,
            open: false,
            free: false,
            role: Role::None.into(),
            member_count: 0,
            alliance_id: 0,
            pending_alliance_id: 0,
            metadata: metadata,
            socials: socials,
        }
    }

    #[inline]
    fn open(ref self: Guild, free: bool) {
        // [Check] Guild can be opened
        self.assert_is_close();
        // [Update] Guild
        self.open = true;
        self.free = free;
    }

    #[inline]
    fn close(ref self: Guild) {
        // [Check] Guild can be closed
        self.assert_is_open();
        // [Update] Guild
        self.open = false;
        self.free = false;
    }

    #[inline]
    fn hire(ref self: Guild) {
        // [Check] Guild can be hired
        self.assert_can_hire();
        // [Update] Guild
        self.member_count += 1;
    }

    #[inline]
    fn fire(ref self: Guild) {
        // [Check] Guild can be fired
        self.assert_can_fire();
        // [Update] Guild
        self.member_count -= 1;
    }

    #[inline]
    fn join(ref self: Guild, alliance_id: u32) {
        // [Check] Guild can join
        self.assert_can_join();
        self.assert_is_requester(alliance_id);
        // [Update] Guild
        self.alliance_id = alliance_id;
        self.pending_alliance_id = 0;
        self.role = Role::Member.into();
    }

    #[inline]
    fn leave(ref self: Guild) {
        // [Check] Guild can leave
        self.assert_can_leave();
        // [Update] Guild
        self.alliance_id = 0;
        self.role = Role::None.into();
    }

    #[inline]
    fn crown(ref self: Guild) {
        // [Check] Guild can be crowned
        self.assert_is_crownable();
        // [Update] Guild
        self.role = Role::Master.into();
    }

    #[inline]
    fn uncrown(ref self: Guild) {
        // [Check] Guild can be un-crowned
        self.assert_is_uncrownable();
        // [Update] Guild
        self.role = Role::Member.into();
    }

    #[inline]
    fn request(ref self: Guild, alliance_id: u32) {
        // [Check] Guild can request
        self.assert_can_request();
        // [Update] Guild
        self.pending_alliance_id = alliance_id;
    }

    #[inline]
    fn cancel(ref self: Guild) {
        // [Check] Guild can cancel
        self.assert_can_cancel();
        // [Update] Guild
        self.pending_alliance_id = 0;
    }
}

#[generate_trait]
pub impl GuildAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @Guild) {
        assert(*self.member_count == 0, errors::GUILD_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Guild) {
        assert(*self.member_count != 0, errors::GUILD_NOT_EXIST);
    }

    #[inline]
    fn assert_is_open(self: @Guild) {
        assert(*self.open, errors::GUILD_IS_CLOSE);
    }

    #[inline]
    fn assert_is_close(self: @Guild) {
        assert(!*self.open, errors::GUILD_IS_OPEN);
    }

    #[inline]
    fn assert_can_hire(self: @Guild) {
        assert(*self.member_count < MAX_MEMBER_COUNT, errors::GUILD_CANNOT_HIRE);
    }

    #[inline]
    fn assert_can_fire(self: @Guild) {
        assert(*self.member_count > 0, errors::GUILD_CANNOT_FIRE);
    }

    #[inline]
    fn assert_can_join(self: @Guild) {
        assert(self.alliance_id == @0, errors::GUILD_CANNOT_JOIN);
    }

    #[inline]
    fn assert_can_leave(self: @Guild) {
        assert(self.alliance_id == @0, errors::GUILD_CANNOT_LEAVE);
    }

    #[inline]
    fn assert_is_crownable(self: @Guild) {
        assert(self.role == @Role::Member.into(), errors::GUILD_CANNOT_CROWN);
    }

    #[inline]
    fn assert_is_uncrownable(self: @Guild) {
        assert(self.role == @Role::Master.into(), errors::GUILD_CANNOT_UNCROWN);
    }

    #[inline]
    fn assert_can_request(self: @Guild) {
        assert(*self.pending_alliance_id + *self.alliance_id == 0, errors::GUILD_CANNOT_REQUEST);
    }

    #[inline]
    fn assert_is_requester(self: @Guild, alliance_id: u32) {
        assert(*self.pending_alliance_id == alliance_id, errors::GUILD_NOT_A_REQUESTER);
    }

    #[inline]
    fn assert_can_cancel(self: @Guild) {
        assert(*self.pending_alliance_id != 0, errors::GUILD_CANNOT_CANCEL);
    }

    #[inline]
    fn assert_same_alliance(self: @Guild, alliance_id: u32) {
        assert(*self.alliance_id == alliance_id, errors::GUILD_NOT_IN_ALLIANCE);
    }

    #[inline]
    fn assert_is_allowed(self: @Guild, role: Role) {
        assert(*self.role >= role.into(), errors::GUILD_NOT_ALLOWED);
    }

    #[inline]
    fn assert_has_authority(self: @Guild, role: Role) {
        assert(*self.role > role.into(), errors::GUILD_NOT_AUTHORIZED);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{GuildAssert, GuildTrait, Role};

    // Constants

    const GUILD_ID: u32 = 42;

    #[test]
    fn test_guild_new() {
        let guild = GuildTrait::new(GUILD_ID, "", "");
        assert_eq!(guild.id, GUILD_ID);
        assert_eq!(guild.open, false);
        assert_eq!(guild.free, false);
        assert_eq!(guild.role, Role::None.into());
        assert_eq!(guild.member_count, 0);
        assert_eq!(guild.alliance_id, 0);
        assert_eq!(guild.pending_alliance_id, 0);
    }
}
