// Internal imports

pub use controller::models::index::Signer;
use controller::types::method::Method;

// Errors

pub mod errors {
    pub const SIGNER_ALREADY_EXISTS: felt252 = 'Signer: already exists';
    pub const SIGNER_NOT_EXIST: felt252 = 'Signer: does not exist';
    pub const SIGNER_INVALID_ACCOUNT_ID: felt252 = 'Signer: invalid account id';
    pub const SIGNER_INVALID_CONTROLLER_ID: felt252 = 'Signer: invalid controller id';
    pub const SIGNER_INVALID_IDENTIFIER: felt252 = 'Signer: invalid identifier';
    pub const SIGNER_INVALID_METHOD: felt252 = 'Signer: invalid method';
    pub const SIGNER_INVALID_METADATA: felt252 = 'Signer: invalid metadata';
}

#[generate_trait]
pub impl SignerImpl of SignerTrait {
    #[inline]
    fn new(
        account_id: felt252, controller_id: felt252, method: Method, metadata: ByteArray,
    ) -> Signer {
        // [Check] Inputs
        SignerAssert::assert_valid_account_id(account_id);
        SignerAssert::assert_valid_controller_id(controller_id);
        SignerAssert::assert_valid_method(method);

        // [Return] Signer
        Signer {
            account_id: account_id,
            controller_id: controller_id,
            method: method.into(),
            metadata: metadata,
        }
    }
}

#[generate_trait]
pub impl SignerAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @Signer) {
        assert(self.account_id == @0, errors::SIGNER_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Signer) {
        assert(self.account_id != @0, errors::SIGNER_NOT_EXIST);
    }

    #[inline]
    fn assert_valid_account_id(account_id: felt252) {
        assert(account_id != 0, errors::SIGNER_INVALID_ACCOUNT_ID);
    }

    #[inline]
    fn assert_valid_controller_id(controller_id: felt252) {
        assert(controller_id != 0, errors::SIGNER_INVALID_CONTROLLER_ID);
    }

    #[inline]
    fn assert_valid_method(method: Method) {
        assert(method != Method::None, errors::SIGNER_INVALID_METHOD);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{Method, SignerAssert, SignerTrait};

    // Constants

    const ACCOUNT_ID: felt252 = 'ACCOUNT_ID';
    const CONTROLLER_ID: felt252 = 'CONTROLLER_ID';
    const METHOD: Method = Method::StarknetAccount;

    #[test]
    fn test_signer_new() {
        let signer = SignerTrait::new(ACCOUNT_ID, CONTROLLER_ID, METHOD, "");
        assert(signer.account_id == ACCOUNT_ID, 'Invalid account id');
        assert(signer.controller_id == CONTROLLER_ID, 'Invalid controller id');
        assert(signer.method == METHOD.into(), 'Invalid method');
        assert(signer.metadata == "", 'Invalid metadata');
    }

    #[test]
    fn test_signer_assert_does_exist() {
        let signer = SignerTrait::new(ACCOUNT_ID, CONTROLLER_ID, METHOD, "");
        signer.assert_does_exist();
    }

    #[test]
    #[should_panic(expected: 'Signer: already exists')]
    fn test_signer_revert_already_exists() {
        let signer = SignerTrait::new(ACCOUNT_ID, CONTROLLER_ID, METHOD, "");
        signer.assert_does_not_exist();
    }

    #[test]
    #[should_panic(expected: 'Signer: invalid account id')]
    fn test_signer_revert_invalid_account_id() {
        SignerTrait::new(0, CONTROLLER_ID, METHOD, "");
    }

    #[test]
    #[should_panic(expected: 'Signer: invalid controller id')]
    fn test_signer_revert_invalid_controller_id() {
        SignerTrait::new(ACCOUNT_ID, 0, METHOD, "");
    }

    #[test]
    #[should_panic(expected: 'Signer: invalid method')]
    fn test_signer_revert_invalid_method() {
        SignerTrait::new(ACCOUNT_ID, CONTROLLER_ID, Method::None, "");
    }
}
