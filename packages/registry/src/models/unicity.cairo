// Internal imports

use registry::helpers::seeder::Seeder;
pub use registry::models::index::Unicity;

// Errors

pub mod errors {
    pub const UNICITY_ALREADY_EXISTS: felt252 = 'Unicity: already exists';
    pub const UNICITY_NOT_EXIST: felt252 = 'Unicity: does not exist';
    pub const UNICITY_INVALID_WORLD: felt252 = 'Unicity: invalid world';
    pub const UNICITY_INVALID_NAMESPACE: felt252 = 'Unicity: invalid namespace';
    pub const UNICITY_INVALID_TOKEN_ID: felt252 = 'Unicity: invalid token id';
}

#[generate_trait]
pub impl UnicityImpl of UnicityTrait {
    #[inline]
    fn new(world_address: felt252, namespace: felt252, token_id: felt252) -> Unicity {
        // [Check] Inputs
        UnicityAssert::assert_valid_world(world_address);
        UnicityAssert::assert_valid_namespace(namespace);
        UnicityAssert::assert_valid_token_id(token_id);
        // [Return] Unicity
        Unicity { world_address: world_address, namespace: namespace, token_id: token_id }
    }

    #[inline]
    fn nullify(ref self: Unicity) {
        self.token_id = Default::default();
    }
}

#[generate_trait]
pub impl UnicityAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @Unicity) {
        assert(self.token_id == Default::default(), errors::UNICITY_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Unicity) {
        assert(self.token_id != Default::default(), errors::UNICITY_NOT_EXIST);
    }

    #[inline]
    fn assert_valid_world(world_address: felt252) {
        assert(world_address != Default::default(), errors::UNICITY_INVALID_WORLD);
    }

    #[inline]
    fn assert_valid_namespace(namespace: felt252) {
        assert(namespace != Default::default(), errors::UNICITY_INVALID_NAMESPACE);
    }

    #[inline]
    fn assert_valid_token_id(token_id: felt252) {
        assert(token_id != Default::default(), errors::UNICITY_INVALID_TOKEN_ID);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{Unicity, UnicityAssert, UnicityTrait};

    // Constants

    const WORLD_ADDRESS: felt252 = 'WORLD';
    const NAMESPACE: felt252 = 'NAMESPACE';
    const TOKEN_ID: felt252 = 1;

    // Helpers

    #[generate_trait]
    pub impl Helper of HelperTrait {
        fn new_unicity() -> Unicity {
            UnicityTrait::new(WORLD_ADDRESS, NAMESPACE, TOKEN_ID)
        }
    }

    #[test]
    fn test_unicity_new() {
        let unicity = Helper::new_unicity();
        assert_eq!(unicity.world_address, WORLD_ADDRESS);
        assert_eq!(unicity.namespace, NAMESPACE);
        assert_eq!(unicity.token_id, TOKEN_ID);
    }

    #[test]
    fn test_unicity_nullify() {
        let mut unicity = Helper::new_unicity();
        unicity.nullify();
        assert_eq!(unicity.token_id, Default::default());
    }

    #[test]
    #[should_panic(expected: 'Unicity: already exists')]
    fn test_unicity_assert_does_not_exist() {
        let mut unicity = Helper::new_unicity();
        unicity.assert_does_not_exist();
    }

    #[test]
    #[should_panic(expected: 'Unicity: does not exist')]
    fn test_unicity_assert_does_exist() {
        let mut unicity = Helper::new_unicity();
        unicity.token_id = Default::default();
        unicity.assert_does_exist();
    }

    #[test]
    #[should_panic(expected: 'Unicity: invalid world')]
    fn test_unicity_assert_valid_world_zero() {
        UnicityAssert::assert_valid_world(0);
    }

    #[test]
    #[should_panic(expected: 'Unicity: invalid namespace')]
    fn test_unicity_assert_valid_namespace_zero() {
        UnicityAssert::assert_valid_namespace(0);
    }

    #[test]
    #[should_panic(expected: 'Unicity: invalid token id')]
    fn test_unicity_assert_valid_token_id_zero() {
        UnicityAssert::assert_valid_token_id(0);
    }
}
