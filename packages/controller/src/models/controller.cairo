// Internal imports

pub use controller::models::index::Controller;

// Errors

pub mod errors {
    pub const CONTROLLER_ALREADY_EXISTS: felt252 = 'Controller: already exists';
    pub const CONTROLLER_NOT_EXIST: felt252 = 'Controller: does not exist';
    pub const CONTROLLER_INVALID_ACCOUNT_ID: felt252 = 'Controller: invalid account id';
    pub const CONTROLLER_INVALID_IDENTIFIER: felt252 = 'Controller: invalid identifier';
    pub const CONTROLLER_INVALID_SIGNERS: felt252 = 'Controller: invalid signers';
    pub const CONTROLLER_INVALID_ADDRESS: felt252 = 'Controller: invalid address';
    pub const CONTROLLER_INVALID_NETWORK: felt252 = 'Controller: invalid network';
}

#[generate_trait]
pub impl ControllerImpl of ControllerTrait {
    #[inline]
    fn new(
        account_id: felt252,
        id: felt252,
        signers: u32,
        address: felt252,
        network: felt252,
        constructor_calldata: ByteArray,
    ) -> Controller {
        // [Check] Inputs
        ControllerAssert::assert_valid_account_id(account_id);
        ControllerAssert::assert_valid_identifier(id);
        ControllerAssert::assert_valid_signers(signers);
        ControllerAssert::assert_valid_address(address);
        ControllerAssert::assert_valid_network(network);
        // [Return] Controller
        Controller {
            account_id: account_id,
            id: id,
            signers: signers,
            address: address,
            network: network,
            constructor_calldata: constructor_calldata,
        }
    }
}

#[generate_trait]
pub impl ControllerAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @Controller) {
        assert(self.account_id == @0, errors::CONTROLLER_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Controller) {
        assert(self.account_id != @0, errors::CONTROLLER_NOT_EXIST);
    }

    #[inline]
    fn assert_valid_identifier(id: felt252) {
        assert(id != 0, errors::CONTROLLER_INVALID_IDENTIFIER);
    }

    #[inline]
    fn assert_valid_account_id(account_id: felt252) {
        assert(account_id != 0, errors::CONTROLLER_INVALID_ACCOUNT_ID);
    }

    #[inline]
    fn assert_valid_signers(signers: u32) {
        assert(signers != 0, errors::CONTROLLER_INVALID_SIGNERS);
    }

    #[inline]
    fn assert_valid_address(address: felt252) {
        assert(address != 0, errors::CONTROLLER_INVALID_ADDRESS);
    }

    #[inline]
    fn assert_valid_network(network: felt252) {
        assert(network != 0, errors::CONTROLLER_INVALID_NETWORK);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{ControllerAssert, ControllerTrait};

    // Constants

    const IDENTIFIER: felt252 = 'IDENTIFIER';
    const ACCOUNT_ID: felt252 = 'ACCOUNT_ID';
    const SIGNERS: u32 = 1;
    const ADDRESS: felt252 = 'ADDRESS';
    const NETWORK: felt252 = 'NETWORK';

    #[test]
    fn test_controller_new() {
        let controller = ControllerTrait::new(
            ACCOUNT_ID, IDENTIFIER, SIGNERS, ADDRESS, NETWORK, "",
        );
        assert_eq!(controller.id, IDENTIFIER);
        assert_eq!(controller.account_id, ACCOUNT_ID);
        assert_eq!(controller.signers, SIGNERS);
        assert_eq!(controller.address, ADDRESS);
        assert_eq!(controller.network, NETWORK);
        assert_eq!(controller.constructor_calldata, "");
    }

    #[test]
    fn test_controller_assert_does_exist() {
        let controller = ControllerTrait::new(
            ACCOUNT_ID, IDENTIFIER, SIGNERS, ADDRESS, NETWORK, "",
        );
        controller.assert_does_exist();
    }

    #[test]
    #[should_panic(expected: 'Controller: already exists')]
    fn test_controller_revert_already_exists() {
        let controller = ControllerTrait::new(
            ACCOUNT_ID, IDENTIFIER, SIGNERS, ADDRESS, NETWORK, "",
        );
        controller.assert_does_not_exist();
    }

    #[test]
    #[should_panic(expected: 'Controller: invalid account id')]
    fn test_controller_revert_invalid_account_id() {
        ControllerTrait::new(0, IDENTIFIER, SIGNERS, ADDRESS, NETWORK, "");
    }

    #[test]
    #[should_panic(expected: 'Controller: invalid identifier')]
    fn test_controller_revert_invalid_identifier() {
        ControllerTrait::new(ACCOUNT_ID, 0, SIGNERS, ADDRESS, NETWORK, "");
    }

    #[test]
    #[should_panic(expected: 'Controller: invalid signers')]
    fn test_controller_revert_invalid_signers() {
        ControllerTrait::new(ACCOUNT_ID, IDENTIFIER, 0, ADDRESS, NETWORK, "");
    }

    #[test]
    #[should_panic(expected: 'Controller: invalid address')]
    fn test_controller_revert_invalid_address() {
        ControllerTrait::new(ACCOUNT_ID, IDENTIFIER, SIGNERS, 0, NETWORK, "");
    }

    #[test]
    #[should_panic(expected: 'Controller: invalid network')]
    fn test_controller_revert_invalid_network() {
        ControllerTrait::new(ACCOUNT_ID, IDENTIFIER, SIGNERS, ADDRESS, 0, "");
    }
}
