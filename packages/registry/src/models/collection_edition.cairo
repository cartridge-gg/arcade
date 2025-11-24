// Internal imports

use core::num::traits::Zero;
use starknet::ContractAddress;
pub use crate::models::index::CollectionEdition;

// Errors

pub mod errors {
    pub const COLLECTION_ALREADY_EXISTS: felt252 = 'Collection: already exists';
    pub const COLLECTION_NOT_EXIST: felt252 = 'Collection: does not exist';
    pub const COLLECTION_INVALID_ADDRESS: felt252 = 'Collection: invalid address';
    pub const COLLECTION_CANNOT_ENABLE: felt252 = 'Collection: cannot enable';
    pub const COLLECTION_CANNOT_DISABLE: felt252 = 'Collection: cannot disable';
}

#[generate_trait]
pub impl CollectionEditionImpl of CollectionEditionTrait {
    #[inline]
    fn new(collection: ContractAddress, edition: felt252) -> CollectionEdition {
        // [Check] Inputs
        CollectionEditionAssert::assert_valid_address(collection);
        // [Return] Collection
        CollectionEdition { collection: collection.into(), edition: edition, active: true }
    }

    #[inline]
    fn enable(ref self: CollectionEdition) {
        // [Check] Can enable
        CollectionEditionAssert::assert_can_enable(@self);
        // [Effect] Increment UUID
        self.active = true;
    }

    #[inline]
    fn disable(ref self: CollectionEdition) {
        // [Check] Can disable
        CollectionEditionAssert::assert_can_disable(@self);
        // [Effect] Disable
        self.active = false;
    }
}

pub impl CollectionEditionZeroable of Zero<CollectionEdition> {
    #[inline]
    fn zero() -> CollectionEdition {
        CollectionEdition { collection: 0, edition: 0, active: false }
    }

    #[inline]
    fn is_zero(self: @CollectionEdition) -> bool {
        !*self.active
    }

    #[inline]
    fn is_non_zero(self: @CollectionEdition) -> bool {
        !self.is_zero()
    }
}

#[generate_trait]
pub impl CollectionEditionAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @CollectionEdition) {
        assert(self.is_zero(), errors::COLLECTION_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @CollectionEdition) {
        assert(self.is_non_zero(), errors::COLLECTION_NOT_EXIST);
    }

    #[inline]
    fn assert_valid_address(collection: ContractAddress) {
        assert(collection.is_non_zero(), errors::COLLECTION_INVALID_ADDRESS);
    }

    #[inline]
    fn assert_can_enable(self: @CollectionEdition) {
        assert(!*self.active, errors::COLLECTION_CANNOT_ENABLE);
    }

    #[inline]
    fn assert_can_disable(self: @CollectionEdition) {
        assert(*self.active, errors::COLLECTION_CANNOT_DISABLE);
    }
}

#[cfg(test)]
mod tests {
    use starknet::ContractAddress;
    use super::{CollectionEditionAssert, CollectionEditionTrait};

    // Constants

    const EDITION_ID: felt252 = 'EDITION';

    fn COLLECTION_ADDRESS() -> ContractAddress {
        'COLLECTION_ADDRESS'.try_into().unwrap()
    }

    fn ZERO_ADDRESS() -> ContractAddress {
        0.try_into().unwrap()
    }

    fn OTHER_ADDRESS() -> ContractAddress {
        'OTHER_ADDRESS'.try_into().unwrap()
    }

    #[test]
    fn test_collection_edition_new() {
        let collection_edition = CollectionEditionTrait::new(
            collection: COLLECTION_ADDRESS(), edition: EDITION_ID,
        );
        assert_eq!(collection_edition.collection, COLLECTION_ADDRESS().into());
        assert_eq!(collection_edition.edition, EDITION_ID);
        assert_eq!(collection_edition.active, true);
    }

    #[test]
    fn test_collection_edition_enable() {
        let mut collection_edition = CollectionEditionTrait::new(
            collection: COLLECTION_ADDRESS(), edition: EDITION_ID,
        );
        collection_edition.active = false;
        collection_edition.enable();
        assert_eq!(collection_edition.active, true);
    }

    #[test]
    fn test_collection_edition_disable() {
        let mut collection_edition = CollectionEditionTrait::new(
            collection: COLLECTION_ADDRESS(), edition: EDITION_ID,
        );
        collection_edition.disable();
        assert_eq!(collection_edition.active, false);
    }

    #[test]
    #[should_panic(expected: 'Collection: already exists')]
    fn test_collection_assert_does_not_exist() {
        let mut collection_edition = CollectionEditionTrait::new(
            collection: COLLECTION_ADDRESS(), edition: EDITION_ID,
        );
        collection_edition.assert_does_not_exist();
    }

    #[test]
    #[should_panic(expected: 'Collection: does not exist')]
    fn test_collection_assert_does_exist() {
        let mut collection_edition = CollectionEditionTrait::new(
            collection: COLLECTION_ADDRESS(), edition: EDITION_ID,
        );
        collection_edition.disable();
        collection_edition.assert_does_exist();
    }

    #[test]
    #[should_panic(expected: 'Collection: invalid address')]
    fn test_collection_assert_valid_address_zero() {
        CollectionEditionAssert::assert_valid_address(ZERO_ADDRESS());
    }
}
