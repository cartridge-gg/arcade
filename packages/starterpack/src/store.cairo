// Dojo imports

use dojo::event::EventStorage;
use dojo::model::ModelStorage;
use dojo::world::WorldStorage;

// Re-export shared RBAC types
pub use models::rbac::models::index::Moderator;
pub use models::rbac::store::ModeratorStoreTrait;
use starknet::ContractAddress;
use crate::events::index::{
    StarterpackIssued, StarterpackPaused, StarterpackRegistered, StarterpackResumed,
    StarterpackUpdated,
};

// Internal imports

use crate::models::index::{Config, GroupReward, Issuance, ReferralReward, Starterpack};

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

    fn set_config(mut self: Store, config: @Config) {
        self.world.write_model(config);
    }
}

// Starterpack getters/setters

#[generate_trait]
pub impl StarterpackStoreImpl of StarterpackStoreTrait {
    fn get_starterpack(self: Store, starterpack_id: u32) -> Starterpack {
        self.world.read_model(starterpack_id)
    }

    fn set_starterpack(mut self: Store, starterpack: @Starterpack) {
        self.world.write_model(starterpack);
    }

    fn registered(mut self: Store, starterpack: @Starterpack) {
        let event = StarterpackRegistered {
            starterpack_id: *starterpack.starterpack_id,
            implementation: *starterpack.implementation,
            referral_percentage: *starterpack.referral_percentage,
            reissuable: *starterpack.reissuable,
            owner: *starterpack.owner,
            payment_receiver: *starterpack.payment_receiver,
            time: *starterpack.created_at,
        };
        self.world.emit_event(@event);
    }

    fn updated(mut self: Store, starterpack: @Starterpack, time: u64) {
        let event = StarterpackUpdated {
            starterpack_id: *starterpack.starterpack_id,
            implementation: *starterpack.implementation,
            referral_percentage: *starterpack.referral_percentage,
            reissuable: *starterpack.reissuable,
            price: *starterpack.price,
            payment_token: *starterpack.payment_token,
            payment_receiver: *starterpack.payment_receiver,
            metadata: starterpack.metadata.clone(),
            time: time,
        };
        self.world.emit_event(@event);
    }

    fn issued(
        mut self: Store,
        starterpack: @Starterpack,
        issuance: @Issuance,
        amount: u256,
        quantity: u32,
        referrer: Option<ContractAddress>,
        referrer_group: Option<felt252>,
    ) {
        let event = StarterpackIssued {
            recipient: *issuance.recipient,
            starterpack_id: *starterpack.starterpack_id,
            payment_token: *starterpack.payment_token,
            amount: amount,
            quantity: quantity,
            referrer: referrer,
            referrer_group: referrer_group,
            time: *issuance.issued_at,
        };
        self.world.emit_event(@event);
    }

    fn paused(mut self: Store, starterpack_id: u32, time: u64) {
        let event = StarterpackPaused { starterpack_id, time: time };
        self.world.emit_event(@event);
    }

    fn resumed(mut self: Store, starterpack_id: u32, time: u64) {
        let event = StarterpackResumed { starterpack_id, time: time };
        self.world.emit_event(@event);
    }
}

// Issuance getters/setters

#[generate_trait]
pub impl IssuanceStoreImpl of IssuanceStoreTrait {
    fn get_issuance(self: Store, starterpack_id: u32, recipient: ContractAddress) -> Issuance {
        self.world.read_model((starterpack_id, recipient))
    }

    fn set_issuance(mut self: Store, issuance: @Issuance) {
        self.world.write_model(issuance);
    }
}

// ReferralReward getters/setters

#[generate_trait]
pub impl ReferralRewardStoreImpl of ReferralRewardStoreTrait {
    fn get_referral_reward(self: Store, referrer: ContractAddress) -> ReferralReward {
        self.world.read_model(referrer)
    }

    fn set_referral_reward(mut self: Store, referral_reward: @ReferralReward) {
        self.world.write_model(referral_reward);
    }
}

// GroupReward getters/setters

#[generate_trait]
pub impl GroupRewardStoreImpl of GroupRewardStoreTrait {
    fn get_group_reward(self: Store, group: felt252) -> GroupReward {
        self.world.read_model(group)
    }

    fn set_group_reward(mut self: Store, group_reward: @GroupReward) {
        self.world.write_model(group_reward);
    }
}

