// Internal imports

pub use controller::models::index::Account;

// Errors

pub mod errors {
    pub const ACCOUNT_ALREADY_EXISTS: felt252 = 'Account: already exists';
    pub const ACCOUNT_NOT_EXIST: felt252 = 'Account: does not exist';
    pub const ACCOUNT_INVALID_IDENTIFIER: felt252 = 'Account: invalid identifier';
    pub const ACCOUNT_INVALID_USERNAME: felt252 = 'Account: invalid username';
}

#[generate_trait]
pub impl AccountImpl of AccountTrait {
    #[inline]
    fn new(
        id: felt252, controllers: u32, name: felt252, username: felt252, socials: ByteArray,
    ) -> Account {
        // [Check] Inputs
        AccountAssert::assert_valid_identifier(id);
        AccountAssert::assert_valid_username(username);
        // [Return] Account
        Account {
            id: id,
            controllers: controllers,
            name: name,
            username: username,
            socials: socials,
            credits: 0,
        }
    }
}

#[generate_trait]
pub impl AccountAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @Account) {
        assert(self.name == @0, errors::ACCOUNT_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Account) {
        assert(self.name != @0, errors::ACCOUNT_NOT_EXIST);
    }

    #[inline]
    fn assert_valid_identifier(identifier: felt252) {
        assert(identifier != 0, errors::ACCOUNT_INVALID_IDENTIFIER);
    }

    #[inline]
    fn assert_valid_username(username: felt252) {
        assert(username != 0, errors::ACCOUNT_INVALID_USERNAME);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{AccountAssert, AccountTrait};

    // Constants

    const IDENTIFIER: felt252 = 'ID';
    const USERNAME: felt252 = 'USERNAME';

    #[test]
    fn test_account_new() {
        let account = AccountTrait::new(IDENTIFIER, 0, 'NAME', USERNAME, "{}");
        assert_eq!(account.id, IDENTIFIER);
        assert_eq!(account.controllers, 0);
        assert_eq!(account.name, 'NAME');
        assert_eq!(account.username, USERNAME);
        assert_eq!(account.socials, "{}");
        assert_eq!(account.credits, 0);
    }

    #[test]
    fn test_account_assert_does_exist() {
        let account = AccountTrait::new(IDENTIFIER, 0, 'NAME', USERNAME, "{}");
        account.assert_does_exist();
    }

    #[test]
    #[should_panic(expected: 'Account: already exists')]
    fn test_account_revert_already_exists() {
        let account = AccountTrait::new(IDENTIFIER, 0, 'NAME', USERNAME, "{}");
        account.assert_does_not_exist();
    }
}
