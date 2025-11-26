// Imports

use graffiti::json::JsonImpl;

// Types

#[derive(Clone, Drop, Serde)]
pub struct AchievementReward {
    pub name: ByteArray,
    pub description: ByteArray,
    pub icon: ByteArray,
}

// Errors

pub mod Errors {
    pub const REWARD_INVALID_NAME: felt252 = 'Reward: invalid name';
    pub const REWARD_INVALID_DESCRIPTION: felt252 = 'Reward: invalid description';
    pub const REWARD_INVALID_ICON: felt252 = 'Reward: invalid image uri';
}

// Implementations

#[generate_trait]
pub impl RewardImpl of RewardTrait {
    #[inline]
    fn new(name: ByteArray, description: ByteArray, icon: ByteArray) -> AchievementReward {
        // [Check] Inputs
        RewardAssert::assert_valid_name(@name);
        RewardAssert::assert_valid_description(@description);
        RewardAssert::assert_valid_icon(@icon);
        // [Return] Reward
        AchievementReward { name, description, icon }
    }

    #[inline]
    fn jsonify(self: AchievementReward) -> ByteArray {
        // [Return] Reward
        JsonImpl::new()
            .add("name", self.name)
            .add("description", self.description)
            .add("icon", self.icon)
            .build()
    }
}

#[generate_trait]
pub impl RewardAssert of AssertTrait {
    #[inline]
    fn assert_valid_name(name: @ByteArray) {
        assert(name.len() > 0, Errors::REWARD_INVALID_NAME);
    }

    #[inline]
    fn assert_valid_description(description: @ByteArray) {
        assert(description.len() > 0, Errors::REWARD_INVALID_DESCRIPTION);
    }

    #[inline]
    fn assert_valid_icon(icon: @ByteArray) {
        assert(icon.len() > 0, Errors::REWARD_INVALID_ICON);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::*;

    // Constants

    #[test]
    fn test_reward_complete() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        let icon: ByteArray = "ICON";
        let reward: ByteArray = RewardImpl::new(name, description, icon).jsonify();
        assert_eq!(reward, "{\"name\":\"NAME\",\"description\":\"DESCRIPTION\",\"icon\":\"ICON\"}");
    }

    #[test]
    #[should_panic(expected: ('Reward: invalid name',))]
    fn test_reward_creation_new_invalid_name() {
        let description: ByteArray = "DESCRIPTION";
        let icon: ByteArray = "ICON";
        RewardImpl::new("", description, icon).jsonify();
    }

    #[test]
    #[should_panic(expected: ('Reward: invalid description',))]
    fn test_reward_creation_new_invalid_description() {
        let name: ByteArray = "NAME";
        let icon: ByteArray = "ICON";
        RewardImpl::new(name, "", icon).jsonify();
    }

    #[test]
    #[should_panic(expected: ('Reward: invalid image uri',))]
    fn test_reward_creation_new_invalid_icon() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        RewardImpl::new(name, description, "").jsonify();
    }
}

