// Internal imports

pub use provider::models::index::Teammate;
use provider::types::role::Role;

// Errors

pub mod errors {
    pub const TEAMMATE_ALREADY_EXISTS: felt252 = 'Teammate: already exists';
    pub const TEAMMATE_NOT_EXIST: felt252 = 'Teammate: does not exist';
    pub const TEAMMATE_INVALID_ACCOUNT_ID: felt252 = 'Teammate: invalid account id';
    pub const TEAMMATE_INVALID_TEAM_ID: felt252 = 'Teammate: invalid team id';
    pub const TEAMMATE_INVALID_TIME: felt252 = 'Teammate: invalid time';
    pub const TEAMMATE_INVALID_ROLE: felt252 = 'Teammate: invalid role';
    pub const TEAMMATE_NOT_ALLOWED: felt252 = 'Teammate: caller is not allowed';
    pub const TEAMMATE_NOT_ENOUGH_PERMISSION: felt252 = 'Teammate: not enough permission';
}

#[generate_trait]
pub impl TeammateImpl of TeammateTrait {
    #[inline]
    fn new(team_id: felt252, time: u64, account_id: felt252, role: Role) -> Teammate {
        // [Check] Inputs
        TeammateAssert::assert_valid_team_id(team_id);
        TeammateAssert::assert_valid_time(time);
        TeammateAssert::assert_valid_account_id(account_id);
        TeammateAssert::assert_valid_role(role);
        // [Return] Teammate
        Teammate { team_id: team_id, time: time, account_id: account_id, role: role.into() }
    }

    #[inline]
    fn nullify(ref self: Teammate) {
        self.role = Role::None.into();
    }
}

#[generate_trait]
pub impl TeammateAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @Teammate) {
        assert(self.role == @Role::None.into(), errors::TEAMMATE_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Teammate) {
        assert(self.role != @Role::None.into(), errors::TEAMMATE_NOT_EXIST);
    }

    #[inline]
    fn assert_valid_account_id(account_id: felt252) {
        assert(account_id != 0, errors::TEAMMATE_INVALID_ACCOUNT_ID);
    }

    #[inline]
    fn assert_valid_team_id(team_id: felt252) {
        assert(team_id != 0, errors::TEAMMATE_INVALID_TEAM_ID);
    }

    #[inline]
    fn assert_valid_time(time: u64) {
        assert(time != 0, errors::TEAMMATE_INVALID_TIME);
    }

    #[inline]
    fn assert_valid_role(role: Role) {
        assert(role != Role::None, errors::TEAMMATE_INVALID_ROLE);
    }

    #[inline]
    fn assert_is_allowed(self: @Teammate, role: Role) {
        assert(self.role >= @role.into(), errors::TEAMMATE_NOT_ALLOWED);
    }

    #[inline]
    fn assert_is_greater(self: @Teammate, role: Role) {
        assert(self.role > @role.into(), errors::TEAMMATE_NOT_ENOUGH_PERMISSION);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{Role, TeammateAssert, TeammateTrait};

    // Constants

    const TEAM_ID: felt252 = 'TEAM_ID';
    const TIME: u64 = 1;
    const ACCOUNT_ID: felt252 = 'ACCOUNT_ID';
    const ROLE: Role = Role::Admin;

    #[test]
    fn test_teammate_new() {
        let member = TeammateTrait::new(TEAM_ID, TIME, ACCOUNT_ID, ROLE);
        assert(member.account_id == ACCOUNT_ID, 'Invalid account id');
        assert(member.team_id == TEAM_ID, 'Invalid team id');
        assert(member.role == ROLE.into(), 'Invalid role');
    }

    #[test]
    fn test_teammate_assert_does_exist() {
        let member = TeammateTrait::new(TEAM_ID, TIME, ACCOUNT_ID, ROLE);
        member.assert_does_exist();
    }

    #[test]
    #[should_panic(expected: 'Teammate: already exists')]
    fn test_teammate_revert_already_exists() {
        let member = TeammateTrait::new(TEAM_ID, TIME, ACCOUNT_ID, ROLE);
        member.assert_does_not_exist();
    }

    #[test]
    #[should_panic(expected: 'Teammate: invalid role')]
    fn test_teammate_revert_invalid_role() {
        TeammateTrait::new(TEAM_ID, TIME, ACCOUNT_ID, Role::None);
    }
}
