// Internal imports

pub use registry::models::index::Access;
use registry::types::role::Role;

// Errors

pub mod errors {
    pub const ACCESS_INVALID_ADDRESS: felt252 = 'Access: invalid address';
    pub const ACCESS_INVALID_ROLE: felt252 = 'Access: invalid role';
    pub const ACCESS_NOT_ALLOWED: felt252 = 'Access: not allowed';
    pub const ACCESS_NOT_GRANTABLE: felt252 = 'Access: not grantable';
    pub const ACCESS_NOT_REVOKABLE: felt252 = 'Access: not revokable';
}

#[generate_trait]
pub impl AccessImpl of AccessTrait {
    #[inline]
    fn new(address: felt252, role: Role) -> Access {
        // [Check] Inputs
        AccessAssert::assert_valid_address(address);
        AccessAssert::assert_valid_role(role);
        // [Return] Access
        Access { address, role: role.into() }
    }

    #[inline]
    fn grant(ref self: Access, role: Role) {
        // [Check] Address
        AccessAssert::assert_valid_address(self.address);
        // [Check] Role
        AccessAssert::assert_valid_role(role);
        // [Check] Grantability
        self.assert_is_grantable(role);
        // [Update] Role
        self.role = role.into();
    }

    #[inline]
    fn revoke(ref self: Access) {
        // [Check] Address
        AccessAssert::assert_valid_address(self.address);
        // [Check] Revokability
        let role: Role = Role::None;
        self.assert_is_revokable(role);
        // [Update] Role
        self.role = role.into();
    }
}

#[generate_trait]
pub impl AccessAssert of AssertTrait {
    #[inline]
    fn assert_valid_address(address: felt252) {
        assert(address != 0, errors::ACCESS_INVALID_ADDRESS);
    }

    #[inline]
    fn assert_valid_role(role: Role) {
        assert(role != Role::None, errors::ACCESS_INVALID_ROLE);
    }

    #[inline]
    fn assert_is_grantable(self: @Access, role: Role) {
        assert(self.role < @role.into(), errors::ACCESS_NOT_GRANTABLE);
    }

    #[inline]
    fn assert_is_revokable(self: @Access, role: Role) {
        assert(self.role > @role.into(), errors::ACCESS_NOT_REVOKABLE);
    }

    #[inline]
    fn assert_is_allowed(self: @Access, role: Role) {
        assert(self.role >= @role.into(), errors::ACCESS_NOT_ALLOWED);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{Access, AccessAssert, AccessTrait, Role};

    // Constants

    const CALLER: felt252 = 'CALLER';

    #[test]
    fn test_access_grant() {
        let mut access = Access { address: CALLER, role: Role::None.into() };
        access.grant(Role::Owner);
        assert_eq!(access.role, Role::Owner.into());
    }

    #[test]
    fn test_access_revoke() {
        let mut access = Access { address: CALLER, role: Role::Owner.into() };
        access.revoke();
        assert_eq!(access.role, Role::None.into());
    }

    #[test]
    #[should_panic(expected: ('Access: not allowed',))]
    fn test_access_revert_not_allowed() {
        let access = Access { address: CALLER, role: Role::None.into() };
        access.assert_is_allowed(Role::Owner);
    }

    #[test]
    #[should_panic(expected: ('Access: not grantable',))]
    fn test_access_grant_revert_not_grantable() {
        let mut access = Access { address: CALLER, role: Role::Owner.into() };
        access.assert_is_grantable(Role::Admin);
    }

    #[test]
    #[should_panic(expected: ('Access: not revokable',))]
    fn test_access_revoke_revert_not_revokable() {
        let mut access = Access { address: CALLER, role: Role::None.into() };
        access.assert_is_revokable(Role::None);
    }
}
