// Internal imports

pub use orderbook::models::index::Moderator;
use orderbook::types::role::Role;

// Errors

pub mod errors {
    pub const MODERATOR_INVALID_ADDRESS: felt252 = 'Moderator: invalid address';
    pub const MODERATOR_INVALID_ROLE: felt252 = 'Moderator: invalid role';
    pub const MODERATOR_NOT_ALLOWED: felt252 = 'Moderator: not allowed';
    pub const MODERATOR_NOT_GRANTABLE: felt252 = 'Moderator: not grantable';
    pub const MODERATOR_NOT_REVOKABLE: felt252 = 'Moderator: not revokable';
}

#[generate_trait]
pub impl ModeratorImpl of ModeratorTrait {
    #[inline]
    fn new(address: felt252, role: Role) -> Moderator {
        // [Check] Inputs
        ModeratorAssert::assert_valid_address(address);
        ModeratorAssert::assert_valid_role(role);
        // [Return] Moderator
        Moderator { address, role: role.into() }
    }

    #[inline]
    fn grant(ref self: Moderator, role: Role) {
        // [Check] Address
        ModeratorAssert::assert_valid_address(self.address);
        // [Check] Role
        ModeratorAssert::assert_valid_role(role);
        // [Check] Grantability
        self.assert_is_grantable(role);
        // [Update] Role
        self.role = role.into();
    }

    #[inline]
    fn revoke(ref self: Moderator) {
        // [Check] Address
        ModeratorAssert::assert_valid_address(self.address);
        // [Check] Revokability
        let role: Role = Role::None;
        self.assert_is_revokable(role);
        // [Update] Role
        self.role = role.into();
    }
}

#[generate_trait]
pub impl ModeratorAssert of AssertTrait {
    #[inline]
    fn assert_valid_address(address: felt252) {
        assert(address != 0, errors::MODERATOR_INVALID_ADDRESS);
    }

    #[inline]
    fn assert_valid_role(role: Role) {
        assert(role != Role::None, errors::MODERATOR_INVALID_ROLE);
    }

    #[inline]
    fn assert_is_grantable(self: @Moderator, role: Role) {
        assert(self.role < @role.into(), errors::MODERATOR_NOT_GRANTABLE);
    }

    #[inline]
    fn assert_is_revokable(self: @Moderator, role: Role) {
        assert(self.role > @role.into(), errors::MODERATOR_NOT_REVOKABLE);
    }

    #[inline]
    fn assert_is_allowed(self: @Moderator, role: Role) {
        assert(self.role >= @role.into(), errors::MODERATOR_NOT_ALLOWED);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{Moderator, ModeratorAssert, ModeratorTrait, Role};

    // Constants

    const CALLER: felt252 = 'CALLER';

    #[test]
    fn test_access_grant() {
        let mut access = Moderator { address: CALLER, role: Role::None.into() };
        access.grant(Role::Owner);
        assert_eq!(access.role, Role::Owner.into());
    }

    #[test]
    fn test_access_revoke() {
        let mut access = Moderator { address: CALLER, role: Role::Owner.into() };
        access.revoke();
        assert_eq!(access.role, Role::None.into());
    }

    #[test]
    #[should_panic(expected: ('Moderator: not allowed',))]
    fn test_access_revert_not_allowed() {
        let access = Moderator { address: CALLER, role: Role::None.into() };
        access.assert_is_allowed(Role::Owner);
    }

    #[test]
    #[should_panic(expected: ('Moderator: not grantable',))]
    fn test_access_grant_revert_not_grantable() {
        let mut access = Moderator { address: CALLER, role: Role::Owner.into() };
        access.assert_is_grantable(Role::Admin);
    }

    #[test]
    #[should_panic(expected: ('Moderator: not revokable',))]
    fn test_access_revoke_revert_not_revokable() {
        let mut access = Moderator { address: CALLER, role: Role::None.into() };
        access.assert_is_revokable(Role::None);
    }
}
