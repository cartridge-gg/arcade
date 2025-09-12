// Internal imports

pub use social::models::index::Member;
use social::types::role::Role;

// Errors

pub mod errors {
    pub const MEMBER_ALREADY_EXISTS: felt252 = 'Member: already exists';
    pub const MEMBER_NOT_EXIST: felt252 = 'Member: does not exist';
    pub const MEMBER_CANNOT_JOIN: felt252 = 'Member: cannot join';
    pub const MEMBER_CANNOT_LEAVE: felt252 = 'Member: cannot leave';
    pub const MEMBER_CANNOT_PROMOTE: felt252 = 'Member: cannot be promoted';
    pub const MEMBER_CANNOT_DEMOTE: felt252 = 'Member: cannot be demoted';
    pub const MEMBER_CANNOT_CROWN: felt252 = 'Member: cannot be crowned';
    pub const MEMBER_CANNOT_UNCROWN: felt252 = 'Member: cannot be un-crowned';
    pub const MEMBER_CANNOT_REQUEST: felt252 = 'Member: cannot request';
    pub const MEMBER_CANNOT_CANCEL: felt252 = 'Member: cannot cancel';
    pub const MEMBER_NOT_ALLOWED: felt252 = 'Member: not allowed';
    pub const MEMBER_NOT_A_REQUESTER: felt252 = 'Member: not a requester';
    pub const MEMBER_NOT_AUTHORIZED: felt252 = 'Member: not authorized';
    pub const MEMBER_NOT_IN_GUILD: felt252 = 'Member: not in guild';
}

#[generate_trait]
pub impl MemberImpl of MemberTrait {
    #[inline]
    fn new(id: felt252) -> Member {
        // [Return] Member
        let role = Role::None;
        Member { id: id, role: role.into(), guild_id: 0, pending_guild_id: 0 }
    }

    #[inline]
    fn join(ref self: Member, guild_id: u32) {
        // [Check] Member can join
        self.assert_can_join();
        self.assert_is_requester(guild_id);
        // [Update] Member
        self.guild_id = guild_id;
        self.pending_guild_id = 0;
        self.role = Role::Member.into();
    }

    #[inline]
    fn leave(ref self: Member) {
        // [Check] Member can leave
        self.assert_can_leave();
        // [Update] Member
        self.guild_id = 0;
        self.role = Role::None.into();
    }

    #[inline]
    fn crown(ref self: Member) {
        // [Check] Member can be crowned
        self.assert_is_crownable();
        // [Update] Member
        self.role = Role::Master.into();
    }

    #[inline]
    fn uncrown(ref self: Member) {
        // [Check] Member can be un-crowned
        self.assert_is_uncrownable();
        // [Update] Member
        self.role = Role::Officer.into();
    }

    #[inline]
    fn promote(ref self: Member) {
        // [Check] Member can be promoted
        self.assert_is_promotable();
        // [Update] Member
        self.role = Role::Officer.into();
    }

    #[inline]
    fn demote(ref self: Member) {
        // [Check] Member can be demoted
        self.assert_is_demotable();
        // [Update] Member
        self.role = Role::Member.into();
    }

    #[inline]
    fn request(ref self: Member, guild_id: u32) {
        // [Check] Member can request
        self.assert_can_request();
        // [Update] Member
        self.pending_guild_id = guild_id;
    }

    #[inline]
    fn cancel(ref self: Member) {
        // [Check] Member can cancel
        self.assert_can_cancel();
        // [Update] Member
        self.pending_guild_id = 0;
    }
}

#[generate_trait]
pub impl MemberAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @Member) {
        assert(*self.guild_id + *self.pending_guild_id == 0, errors::MEMBER_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Member) {
        assert(*self.guild_id + *self.pending_guild_id != 0, errors::MEMBER_NOT_EXIST);
    }

    #[inline]
    fn assert_can_join(self: @Member) {
        assert(*self.guild_id == 0 && *self.pending_guild_id != 0, errors::MEMBER_CANNOT_JOIN);
    }

    #[inline]
    fn assert_can_leave(self: @Member) {
        assert(
            *self.guild_id != 0 && *self.role != Role::Master.into(), errors::MEMBER_CANNOT_LEAVE,
        );
    }

    #[inline]
    fn assert_is_promotable(self: @Member) {
        assert(self.role == @Role::Member.into(), errors::MEMBER_CANNOT_PROMOTE);
    }

    #[inline]
    fn assert_is_demotable(self: @Member) {
        assert(self.role == @Role::Officer.into(), errors::MEMBER_CANNOT_DEMOTE);
    }

    #[inline]
    fn assert_is_crownable(self: @Member) {
        assert(
            self.role == @Role::Member.into() || self.role == @Role::Officer.into(),
            errors::MEMBER_CANNOT_CROWN,
        );
    }

    #[inline]
    fn assert_is_uncrownable(self: @Member) {
        assert(self.role == @Role::Master.into(), errors::MEMBER_CANNOT_UNCROWN);
    }

    #[inline]
    fn assert_can_request(self: @Member) {
        assert(*self.pending_guild_id + *self.guild_id == 0, errors::MEMBER_CANNOT_REQUEST);
    }

    #[inline]
    fn assert_can_cancel(self: @Member) {
        assert(*self.pending_guild_id != 0, errors::MEMBER_CANNOT_CANCEL);
    }

    #[inline]
    fn assert_is_allowed(self: @Member, role: Role) {
        assert(*self.role >= role.into(), errors::MEMBER_NOT_ALLOWED);
    }

    #[inline]
    fn assert_is_requester(self: @Member, guild_id: u32) {
        assert(*self.pending_guild_id != guild_id, errors::MEMBER_NOT_A_REQUESTER);
    }

    #[inline]
    fn assert_has_authority(self: @Member, role: Role) {
        assert(*self.role > role.into(), errors::MEMBER_NOT_AUTHORIZED);
    }

    #[inline]
    fn assert_same_guild(self: @Member, guild_id: u32) {
        assert(*self.guild_id == guild_id, errors::MEMBER_NOT_IN_GUILD);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{MemberAssert, MemberTrait, Role};

    // Constants

    const ACCOUNT_ID: felt252 = 'ACCOUNT_ID';
    const GUILD_ID: u32 = 42;

    #[test]
    fn test_member_new() {
        let member = MemberTrait::new(ACCOUNT_ID);
        assert_eq!(member.id, ACCOUNT_ID);
        assert_eq!(member.guild_id, 0);
        assert_eq!(member.role, Role::None.into());
    }
}
