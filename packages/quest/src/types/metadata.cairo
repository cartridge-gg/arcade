// Imports

use graffiti::json::JsonImpl;
use crate::types::reward::{QuestReward, RewardTrait};

// Types

#[derive(Clone, Drop, Serde)]
pub struct QuestMetadata {
    pub name: ByteArray,
    pub description: ByteArray,
    pub icon: ByteArray,
    pub rewards: Span<QuestReward>,
}

// Errors

pub mod Errors {
    pub const METADATA_INVALID_NAME: felt252 = 'Metadata: invalid name';
    pub const METADATA_INVALID_DESCRIPTION: felt252 = 'Metadata: invalid description';
    pub const METADATA_INVALID_HIDDEN: felt252 = 'Metadata: invalid hidden';
    pub const METADATA_INVALID_INDEX: felt252 = 'Metadata: invalid index';
    pub const METADATA_INVALID_GROUP: felt252 = 'Metadata: invalid group';
    pub const METADATA_INVALID_ICON: felt252 = 'Metadata: invalid icon';
    pub const METADATA_INVALID_DATA: felt252 = 'Metadata: invalid data';
}

// Implementations

#[generate_trait]
pub impl QuestMetadataImpl of QuestMetadataTrait {
    #[inline]
    fn new(
        name: ByteArray, description: ByteArray, icon: ByteArray, rewards: Span<QuestReward>,
    ) -> QuestMetadata {
        // [Check] Inputs
        MetadataAssert::assert_valid_name(@name);
        MetadataAssert::assert_valid_description(@description);
        MetadataAssert::assert_valid_icon(@icon);
        // [Return] Metadata
        QuestMetadata { name, description, icon, rewards }
    }

    #[inline]
    fn jsonify(mut self: QuestMetadata) -> ByteArray {
        // [Return] Metadata
        let mut rewards: Array<ByteArray> = array![];
        while let Option::Some(reward) = self.rewards.pop_front() {
            rewards.append(reward.clone().jsonify());
        }
        JsonImpl::new()
            .add("name", self.name)
            .add("description", self.description)
            .add("icon", self.icon)
            .add_array("rewards", rewards.span())
            .build()
    }
}

#[generate_trait]
pub impl MetadataAssert of AssertTrait {
    #[inline]
    fn assert_valid_name(name: @ByteArray) {
        assert(name.len() > 0, Errors::METADATA_INVALID_NAME);
    }

    #[inline]
    fn assert_valid_description(description: @ByteArray) {
        assert(description.len() > 0, Errors::METADATA_INVALID_DESCRIPTION);
    }

    #[inline]
    fn assert_valid_icon(icon: @ByteArray) {
        assert(icon.len() > 0, Errors::METADATA_INVALID_ICON);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::*;

    // Constants

    const ICON: felt252 = 'ICON';

    #[test]
    fn test_metadata_complete() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        let icon: ByteArray = "ICON";
        let rewards: Span<QuestReward> = array![RewardTrait::new("NAME", "DESCRIPTION", "ICON")]
            .span();
        let metadata: ByteArray = QuestMetadataImpl::new(name, description, icon, rewards)
            .jsonify();
        assert_eq!(
            metadata,
            "{\"name\":\"NAME\",\"description\":\"DESCRIPTION\",\"icon\":\"ICON\",\"rewards\":[{\"name\":\"NAME\",\"description\":\"DESCRIPTION\",\"icon\":\"ICON\"}]}",
        );
    }

    #[test]
    fn test_metadata_empty() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        let icon: ByteArray = "ICON";
        let metadata: ByteArray = QuestMetadataImpl::new(name, description, icon, array![].span())
            .jsonify();
        assert_eq!(
            metadata,
            "{\"name\":\"NAME\",\"description\":\"DESCRIPTION\",\"icon\":\"ICON\",\"rewards\":[]}",
        );
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid name',))]
    fn test_metadata_creation_new_invalid_name() {
        let description: ByteArray = "DESCRIPTION";
        let icon: ByteArray = "ICON";
        QuestMetadataImpl::new("", description, icon, array![].span()).jsonify();
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid description',))]
    fn test_metadata_creation_new_invalid_description() {
        let name: ByteArray = "NAME";
        let icon: ByteArray = "ICON";
        QuestMetadataImpl::new(name, "", icon, array![].span()).jsonify();
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid icon',))]
    fn test_metadata_creation_new_invalid_icon() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        QuestMetadataImpl::new(name, description, "", array![].span()).jsonify();
    }
}

