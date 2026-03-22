use dojo::event::EventStorage;
use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use starknet::ContractAddress;
use crate::events::index::{KitIssued, KitRegistered, KitUpdated};
use crate::models::group::KitGroupTrait;
use crate::models::index::{Kit, KitGroup, KitIssuance, KitReferral, KitVoucher};
use crate::models::referral::KitReferralTrait;

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    fn new(world: WorldStorage) -> Store {
        Store { world }
    }
}

#[derive(Copy, Drop)]
pub struct Store {
    world: WorldStorage,
}


#[generate_trait]
pub impl KitStoreImpl of KitStoreTrait {
    fn get_kit(self: Store, kit_id: u32) -> Kit {
        self.world.read_model(kit_id)
    }

    fn set_kit(mut self: Store, kit: @Kit) {
        self.world.write_model(kit);
    }

    fn registered(mut self: Store, kit: @Kit) {
        let event = KitRegistered {
            kit_id: *kit.id,
            referral_percentage: *kit.referral_percentage,
            reissuable: *kit.reissuable,
            payment_receiver: *kit.payment_receiver,
            time: *kit.created_at,
        };
        self.world.emit_event(@event);
    }

    fn updated(mut self: Store, kit: @Kit, time: u64) {
        let event = KitUpdated {
            kit_id: *kit.id,
            referral_percentage: *kit.referral_percentage,
            reissuable: *kit.reissuable,
            price: *kit.price,
            payment_token: *kit.payment_token,
            payment_receiver: *kit.payment_receiver,
            metadata: kit.metadata.clone(),
            time: time,
        };
        self.world.emit_event(@event);
    }

    fn issued(
        mut self: Store,
        kit: @Kit,
        issuance: @KitIssuance,
        amount: u256,
        quantity: u32,
        referrer: Option<ContractAddress>,
        referrer_group: Option<felt252>,
    ) {
        let event = KitIssued {
            recipient: *issuance.recipient,
            kit_id: *kit.id,
            payment_token: *kit.payment_token,
            amount: amount,
            quantity: quantity,
            referrer: referrer,
            referrer_group: referrer_group,
            time: *issuance.issued_at,
        };
        self.world.emit_event(@event);
    }
}

#[generate_trait]
pub impl IssuanceStoreImpl of IssuanceStoreTrait {
    fn get_issuance(self: Store, kit_id: u32, recipient: ContractAddress) -> KitIssuance {
        self.world.read_model((kit_id, recipient))
    }

    fn set_issuance(mut self: Store, issuance: @KitIssuance) {
        self.world.write_model(issuance);
    }
}

#[generate_trait]
pub impl ReferralStoreImpl of ReferralStoreTrait {
    fn get_referral_or_new(self: Store, referrer_id: ContractAddress) -> KitReferral {
        let mut referral: KitReferral = self.world.read_model(referrer_id);
        if referral.total_referrals == 0 {
            referral = KitReferralTrait::new(referrer_id);
        }
        referral
    }

    fn set_referral(mut self: Store, referral: @KitReferral) {
        self.world.write_model(referral);
    }
}

#[generate_trait]
pub impl GroupStoreImpl of GroupStoreTrait {
    fn get_group_or_new(self: Store, group_id: felt252) -> KitGroup {
        let mut group_reward: KitGroup = self.world.read_model(group_id);
        if group_reward.total_referrals == 0 {
            group_reward = KitGroupTrait::new(group_id);
        }
        group_reward
    }

    fn set_group(mut self: Store, group_reward: @KitGroup) {
        self.world.write_model(group_reward);
    }
}

#[generate_trait]
pub impl VoucherStoreImpl of VoucherStoreTrait {
    fn get_voucher(self: Store, kit_id: u32, voucher_key: felt252) -> KitVoucher {
        self.world.read_model((kit_id, voucher_key))
    }

    fn set_voucher(mut self: Store, voucher: @KitVoucher) {
        self.world.write_model(voucher);
    }
}
