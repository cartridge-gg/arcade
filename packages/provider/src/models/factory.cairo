// Internal imports

pub use provider::models::index::Factory;
use provider::types::service::Service;

// Errors

pub mod errors {
    pub const SERVICE_ALREADY_EXISTS: felt252 = 'Factory: already exists';
    pub const SERVICE_NOT_EXIST: felt252 = 'Factory: does not exist';
    pub const SERVICE_INVALID_IDENTIFIER: felt252 = 'Factory: invalid identifier';
    pub const SERVICE_INVALID_VERSION: felt252 = 'Factory: invalid version';
}

#[generate_trait]
pub impl FactoryImpl of FactoryTrait {
    #[inline]
    fn new(service: Service, version: felt252, default_version: felt252) -> Factory {
        // [Check] Inputs
        let factory_id: u8 = service.into();
        FactoryAssert::assert_valid_identifier(factory_id);
        FactoryAssert::assert_valid_version(version);
        FactoryAssert::assert_valid_version(default_version);
        // [Return] Factory
        Factory { id: factory_id, version: version, default_version: default_version }
    }
}

#[generate_trait]
pub impl FactoryAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @Factory) {
        assert(self.version == @0, errors::SERVICE_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Factory) {
        assert(self.version != @0, errors::SERVICE_NOT_EXIST);
    }

    #[inline]
    fn assert_valid_identifier(identifier: u8) {
        assert(identifier != 0, errors::SERVICE_INVALID_IDENTIFIER);
    }

    #[inline]
    fn assert_valid_version(version: felt252) {
        assert(version != 0, errors::SERVICE_INVALID_VERSION);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{FactoryAssert, FactoryTrait, Service};

    // Constants

    const SERVICE: Service = Service::Katana;
    const VERSION: felt252 = 'VERSION';
    const DEFAULT_VERSION: felt252 = 'DEFAULT';

    #[test]
    fn test_service_new() {
        let service = FactoryTrait::new(SERVICE, VERSION, DEFAULT_VERSION);
        assert(service.id == SERVICE.into(), 'Invalid identifier');
        assert(service.version == VERSION, 'Invalid version');
        assert(service.default_version == DEFAULT_VERSION, 'Invalid default version');
    }

    #[test]
    fn test_service_assert_does_exist() {
        let service = FactoryTrait::new(SERVICE, VERSION, DEFAULT_VERSION);
        service.assert_does_exist();
    }

    #[test]
    #[should_panic(expected: 'Factory: already exists')]
    fn test_service_revert_already_exists() {
        let service = FactoryTrait::new(SERVICE, VERSION, DEFAULT_VERSION);
        service.assert_does_not_exist();
    }
}
