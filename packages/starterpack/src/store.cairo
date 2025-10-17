// Dojo imports

use dojo::model::ModelStorage;
use dojo::world::WorldStorage;

// Re-export shared RBAC types
pub use models::rbac::models::index::Moderator;
pub use models::rbac::store::ModeratorStoreTrait;
use starknet::ContractAddress;

// Internal imports

use starterpack::models::index::{Config, GroupReward, Issuance, ReferralReward, Starterpack};

// Store trait

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    fn new(world: WorldStorage) -> Store {
        Store { world }
    }
}

// Store struct

#[derive(Copy, Drop)]
pub struct Store {
    world: WorldStorage,
}

// Config getters/setters

#[generate_trait]
pub impl ConfigStoreImpl of ConfigStoreTrait {
    fn get_config(self: Store, id: u32) -> Config {
        self.world.read_model(id)
    }

    fn set_config(ref self: Store, config: @Config) {
        self.world.write_model(config);
    }
}

// Starterpack getters/setters

#[generate_trait]
pub impl StarterpackStoreImpl of StarterpackStoreTrait {
    fn get_starterpack(self: Store, starterpack_id: u32) -> Starterpack {
        self.world.read_model(starterpack_id)
    }

    fn set_starterpack(ref self: Store, starterpack: @Starterpack) {
        self.world.write_model(starterpack);
    }
}

// Issuance getters/setters

#[generate_trait]
pub impl IssuanceStoreImpl of IssuanceStoreTrait {
    fn get_issuance(self: Store, starterpack_id: u32, recipient: ContractAddress) -> Issuance {
        self.world.read_model((starterpack_id, recipient))
    }

    fn set_issuance(ref self: Store, issuance: @Issuance) {
        self.world.write_model(issuance);
    }
}

// ReferralReward getters/setters

#[generate_trait]
pub impl ReferralRewardStoreImpl of ReferralRewardStoreTrait {
    fn get_referral_reward(self: Store, referrer: ContractAddress) -> ReferralReward {
        self.world.read_model(referrer)
    }

    fn set_referral_reward(ref self: Store, referral_reward: @ReferralReward) {
        self.world.write_model(referral_reward);
    }
}

// GroupReward getters/setters

#[generate_trait]
pub impl GroupRewardStoreImpl of GroupRewardStoreTrait {
    fn get_group_reward(self: Store, group: felt252) -> GroupReward {
        self.world.read_model(group)
    }

    fn set_group_reward(ref self: Store, group_reward: @GroupReward) {
        self.world.write_model(group_reward);
    }
}

