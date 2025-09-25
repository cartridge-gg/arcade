// Internal imports

use core::num::traits::Zero;
pub use registry::models::index::Collection;
use starknet::ContractAddress;

// Errors

pub mod errors {
    pub const COLLECTION_ALREADY_EXISTS: felt252 = 'Collection: already exists';
    pub const COLLECTION_NOT_EXIST: felt252 = 'Collection: does not exist';
    pub const COLLECTION_INVALID_ADDRESS: felt252 = 'Collection: invalid address';
    pub const COLLECTION_INVALID_TYPE: felt252 = 'Collection: invalid type';
}

#[generate_trait]
pub impl CollectionImpl of CollectionTrait {
    #[inline]
    fn new(id: felt252, contract_address: ContractAddress) -> Collection {
        // [Check] Inputs
        CollectionAssert::assert_valid_address(contract_address);
        // [Return] Collection
        Collection { id: id, uuid: 0, contract_address: contract_address }
    }

    #[inline]
    fn mint(ref self: Collection) -> felt252 {
        // [Check] Overflow
        // [Effect] Increment UUID
        let uuid: u256 = self.uuid.into() + 1;
        self.uuid = uuid.try_into().unwrap();
        // [Return] UUID (starts at 1)
        self.uuid
    }

    #[inline]
    fn update(ref self: Collection, contract_address: ContractAddress) {
        // [Check] Inputs
        CollectionAssert::assert_valid_address(contract_address);
        // [Effect] Update Collection
        self.contract_address = contract_address;
    }

    #[inline]
    fn nullify(ref self: Collection) {
        self.contract_address = Zero::zero();
    }
}

pub impl CollectionZeroable of Zero<Collection> {
    #[inline]
    fn zero() -> Collection {
        Collection { id: 0, uuid: 0, contract_address: Zero::zero() }
    }

    #[inline]
    fn is_zero(self: @Collection) -> bool {
        self.contract_address.is_zero()
    }

    #[inline]
    fn is_non_zero(self: @Collection) -> bool {
        !self.is_zero()
    }
}

#[generate_trait]
pub impl CollectionAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @Collection) {
        assert(self.is_zero(), errors::COLLECTION_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Collection) {
        assert(self.is_non_zero(), errors::COLLECTION_NOT_EXIST);
    }

    #[inline]
    fn assert_valid_address(contract_address: ContractAddress) {
        assert(contract_address.is_non_zero(), errors::COLLECTION_INVALID_ADDRESS);
    }

    #[inline]
    fn assert_valid_type(collection_type: @ByteArray) {
        assert(
            collection_type == @"ERC20"
                || collection_type == @"ERC721"
                || collection_type == @"ERC1155",
            errors::COLLECTION_INVALID_TYPE,
        );
    }
}

#[cfg(test)]
mod tests {
    use starknet::ContractAddress;
    use super::{CollectionAssert, CollectionTrait};

    // Constants

    const COLLECTION_ID: felt252 = 'COLLECTION';

    fn CONTRACT_ADDRESS() -> ContractAddress {
        'CONTRACT_ADDRESS'.try_into().unwrap()
    }

    fn ZERO_ADDRESS() -> ContractAddress {
        0.try_into().unwrap()
    }

    fn OTHER_ADDRESS() -> ContractAddress {
        'OTHER_ADDRESS'.try_into().unwrap()
    }

    #[test]
    fn test_collection_new() {
        let collection = CollectionTrait::new(
            id: COLLECTION_ID, contract_address: CONTRACT_ADDRESS(),
        );
        assert_eq!(collection.id, COLLECTION_ID);
        assert_eq!(collection.uuid, 0);
        assert_eq!(collection.contract_address, CONTRACT_ADDRESS());
    }

    #[test]
    fn test_collection_update() {
        let mut collection = CollectionTrait::new(
            id: COLLECTION_ID, contract_address: CONTRACT_ADDRESS(),
        );
        collection.update(OTHER_ADDRESS());
        assert_eq!(collection.contract_address, OTHER_ADDRESS());
        assert_eq!(collection.uuid, 0);
    }

    #[test]
    fn test_collection_nullify() {
        let mut collection = CollectionTrait::new(
            id: COLLECTION_ID, contract_address: CONTRACT_ADDRESS(),
        );
        collection.nullify();
        assert_eq!(collection.contract_address, ZERO_ADDRESS());
        assert_eq!(collection.uuid, 0);
    }

    #[test]
    #[should_panic(expected: 'Collection: already exists')]
    fn test_collection_assert_does_not_exist() {
        let mut collection = CollectionTrait::new(
            id: COLLECTION_ID, contract_address: CONTRACT_ADDRESS(),
        );
        collection.assert_does_not_exist();
    }

    #[test]
    #[should_panic(expected: 'Collection: does not exist')]
    fn test_collection_assert_does_exist() {
        let mut collection = CollectionTrait::new(
            id: COLLECTION_ID, contract_address: CONTRACT_ADDRESS(),
        );
        collection.nullify();
        collection.assert_does_exist();
    }

    #[test]
    #[should_panic(expected: 'Collection: invalid address')]
    fn test_collection_assert_valid_address_zero() {
        CollectionAssert::assert_valid_address(ZERO_ADDRESS());
    }

    #[test]
    #[should_panic(expected: 'Collection: invalid address')]
    fn test_collection_update_invalid_address() {
        let mut collection = CollectionTrait::new(
            id: COLLECTION_ID, contract_address: CONTRACT_ADDRESS(),
        );
        collection.update(ZERO_ADDRESS());
    }
}
