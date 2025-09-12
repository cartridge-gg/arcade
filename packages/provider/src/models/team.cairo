// Internal imports

pub use provider::models::index::Team;

// Errors

pub mod errors {
    pub const TEAM_ALREADY_EXISTS: felt252 = 'Team: already exists';
    pub const TEAM_NOT_EXIST: felt252 = 'Team: does not exist';
    pub const TEAM_INVALID_IDENTIFIER: felt252 = 'Team: invalid identifier';
    pub const TEAM_INVALID_TIME: felt252 = 'Team: invalid time';
    pub const TEAM_INVALID_NAME: felt252 = 'Team: invalid name';
}

#[generate_trait]
pub impl TeamImpl of TeamTrait {
    #[inline]
    fn new(id: felt252, time: u64, name: felt252, description: ByteArray) -> Team {
        // [Check] Inputs
        TeamAssert::assert_valid_identifier(id);
        TeamAssert::assert_valid_time(time);
        TeamAssert::assert_valid_name(name);
        // [Return] Team
        Team { id: id, deployment_count: 0, time: time, name: name, description: description }
    }

    #[inline]
    fn exists(self: @Team) -> bool {
        self.name != @0 && self.time != @0
    }

    #[inline]
    fn nullify(ref self: Team) {
        self.time = 0;
        self.name = 0;
    }

    #[inline]
    fn deploy(ref self: Team) {
        self.deployment_count += 1;
    }

    #[inline]
    fn remove(ref self: Team) {
        self.deployment_count -= 1;
    }
}

#[generate_trait]
pub impl TeamAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @Team) {
        assert(!self.exists(), errors::TEAM_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Team) {
        assert(self.exists(), errors::TEAM_NOT_EXIST);
    }

    #[inline]
    fn assert_valid_identifier(identifier: felt252) {
        assert(identifier != 0, errors::TEAM_INVALID_IDENTIFIER);
    }

    #[inline]
    fn assert_valid_time(time: u64) {
        assert(time != 0, errors::TEAM_INVALID_TIME);
    }

    #[inline]
    fn assert_valid_name(name: felt252) {
        assert(name != 0, errors::TEAM_INVALID_NAME);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{TeamAssert, TeamTrait};

    // Constants

    const IDENTIFIER: felt252 = 'ID';
    const NAME: felt252 = 'NAME';
    const TIME: u64 = 1;

    #[test]
    fn test_team_new() {
        let team = TeamTrait::new(IDENTIFIER, TIME, NAME, "");
        assert(team.id == IDENTIFIER, 'Invalid identifier');
        assert(team.time == TIME, 'Invalid time');
        assert(team.name == NAME, 'Invalid name');
        assert(team.description == "", 'Invalid description');
    }

    #[test]
    fn test_team_assert_does_exist() {
        let team = TeamTrait::new(IDENTIFIER, TIME, NAME, "");
        team.assert_does_exist();
    }

    #[test]
    #[should_panic(expected: 'Team: already exists')]
    fn test_team_revert_already_exists() {
        let team = TeamTrait::new(IDENTIFIER, TIME, NAME, "");
        team.assert_does_not_exist();
    }
}
