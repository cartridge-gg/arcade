// Internal imports

pub use crate::events::index::QuestCreation;
use crate::models::definition::QuestDefinition;
use crate::types::metadata::{QuestMetadata, QuestMetadataTrait};

// Errors

pub mod errors {
    pub const CREATION_INVALID_ID: felt252 = 'Creation: invalid id';
}

// Implementations

#[generate_trait]
pub impl CreationImpl of CreationTrait {
    #[inline]
    fn new(id: felt252, definition: QuestDefinition, metadata: QuestMetadata) -> QuestCreation {
        // [Check] Inputs
        CreationAssert::assert_valid_id(id);
        // [Return] QuestCreation
        QuestCreation { id: id, definition: definition, metadata: metadata.jsonify() }
    }
}

#[generate_trait]
impl CreationAssert of AssertTrait {
    #[inline]
    fn assert_valid_id(id: felt252) {
        assert(id != 0, errors::CREATION_INVALID_ID);
    }
}
