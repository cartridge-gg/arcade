// Imports

use graffiti::json::JsonImpl;
use crate::types::reward::{AchievementReward, RewardTrait};

// Types

#[derive(Clone, Drop, Serde)]
pub struct AchievementMetadata {
    pub title: felt252,
    pub description: ByteArray,
    pub icon: felt252,
    pub points: u16,
    pub hidden: bool,
    pub index: u8,
    pub group: felt252,
    pub rewards: Span<AchievementReward>,
    pub data: ByteArray,
}

// Errors

pub mod Errors {
    pub const METADATA_INVALID_TITLE: felt252 = 'Metadata: invalid title';
    pub const METADATA_INVALID_DESCRIPTION: felt252 = 'Metadata: invalid description';
    pub const METADATA_INVALID_ICON: felt252 = 'Metadata: invalid icon';
    pub const METADATA_INVALID_POINTS: felt252 = 'Metadata: invalid points';
}

// Implementations

#[generate_trait]
pub impl MetadataImpl of MetadataTrait {
    #[inline]
    fn new(
        title: felt252,
        description: ByteArray,
        icon: felt252,
        points: u16,
        hidden: bool,
        index: u8,
        group: felt252,
        rewards: Span<AchievementReward>,
        data: ByteArray,
    ) -> AchievementMetadata {
        // [Check] Inputs
        MetadataAssert::assert_valid_title(@title);
        MetadataAssert::assert_valid_description(@description);
        MetadataAssert::assert_valid_icon(@icon);
        MetadataAssert::assert_valid_points(points);
        // [Return] AchievementMetadata
        AchievementMetadata {
            title, description, icon, points, hidden, index, group, rewards, data,
        }
    }

    #[inline]
    fn jsonify(mut self: AchievementMetadata) -> ByteArray {
        // [Return] AchievementMetadata
        let mut rewards: Array<ByteArray> = array![];
        while let Option::Some(reward) = self.rewards.pop_front() {
            rewards.append(reward.clone().jsonify());
        }
        JsonImpl::new()
            .add("title", format!("{}", self.title))
            .add("description", self.description)
            .add("icon", format!("{}", self.icon))
            .add("points", format!("{}", self.points))
            .add("hidden", format!("{}", self.hidden))
            .add("index", format!("{}", self.index))
            .add("group", format!("{}", self.group))
            .build()
    }
}

#[generate_trait]
pub impl MetadataAssert of AssertTrait {
    #[inline]
    fn assert_valid_title(title: @felt252) {
        assert(title != @0, Errors::METADATA_INVALID_TITLE);
    }

    #[inline]
    fn assert_valid_description(description: @ByteArray) {
        assert(description.len() > 0, Errors::METADATA_INVALID_DESCRIPTION);
    }

    #[inline]
    fn assert_valid_icon(icon: @felt252) {
        assert(icon != @0, Errors::METADATA_INVALID_ICON);
    }

    #[inline]
    fn assert_valid_points(points: u16) {
        assert(points <= 100, Errors::METADATA_INVALID_POINTS);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::*;

    // Constants

    #[test]
    fn test_metadata_complete() {
        let title: felt252 = 'TITLE';
        let description: ByteArray = "DESCRIPTION";
        let icon: felt252 = 'ICON';
        let points: u16 = 100;
        let hidden: bool = false;
        let index: u8 = 0;
        let group: felt252 = 'GROUP';
        let rewards: Span<AchievementReward> = array![
            RewardTrait::new("NAME", "DESCRIPTION", "ICON"),
        ]
            .span();
        let data: ByteArray = "DATA";
        let metadata: ByteArray = MetadataImpl::new(
            title, description, icon, points, hidden, index, group, rewards, data,
        )
            .jsonify();
        assert(metadata.len() > 0, 'Metadata should not be empty');
    }

    #[test]
    fn test_metadata_minimal() {
        let title: felt252 = 'TITLE';
        let description: ByteArray = "DESCRIPTION";
        let icon: felt252 = 'ICON';
        let data: ByteArray = "DATA";
        let points: u16 = 50;
        let hidden: bool = false;
        let index: u8 = 0;
        let group: felt252 = 'GROUP';
        let rewards = array![].span();
        let metadata: ByteArray = MetadataImpl::new(
            title, description, icon, points, hidden, index, group, rewards, data,
        )
            .jsonify();
        assert(metadata.len() > 0, 'Metadata should not be empty');
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid title',))]
    fn test_metadata_creation_new_invalid_title() {
        let description: ByteArray = "DESCRIPTION";
        let icon: felt252 = 'ICON';
        let data: ByteArray = "DATA";
        let rewards = array![].span();
        MetadataImpl::new(0, description, icon, 50, false, 0, 'GROUP', rewards, data).jsonify();
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid description',))]
    fn test_metadata_creation_new_invalid_description() {
        let title: felt252 = 'TITLE';
        let icon: felt252 = 'ICON';
        let data: ByteArray = "DATA";
        let rewards = array![].span();
        MetadataImpl::new(title, "", icon, 50, false, 0, 'GROUP', rewards, data).jsonify();
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid icon',))]
    fn test_metadata_creation_new_invalid_icon() {
        let title: felt252 = 'TITLE';
        let description: ByteArray = "DESCRIPTION";
        let data: ByteArray = "DATA";
        let rewards = array![].span();
        MetadataImpl::new(title, description, 0, 50, false, 0, 'GROUP', rewards, data).jsonify();
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid points',))]
    fn test_metadata_creation_new_invalid_points() {
        let title: felt252 = 'TITLE';
        let description: ByteArray = "DESCRIPTION";
        let icon: felt252 = 'ICON';
        let data: ByteArray = "DATA";
        let rewards = array![].span();
        MetadataImpl::new(title, description, icon, 101, false, 0, 'GROUP', rewards, data)
            .jsonify();
    }
}

