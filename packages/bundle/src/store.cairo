use dojo::event::EventStorage;
use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use starknet::ContractAddress;
use crate::events::index::{BundleIssued, BundleRegistered, BundleUpdated};
use crate::models::group::BundleGroupTrait;
use crate::models::index::{Bundle, BundleGroup, BundleIssuance, BundleReferral, BundleVoucher};
use crate::models::referral::BundleReferralTrait;

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
pub impl BundleStoreImpl of BundleStoreTrait {
    fn get_bundle(self: Store, bundle_id: u32) -> Bundle {
        self.world.read_model(bundle_id)
    }

    fn set_bundle(mut self: Store, bundle: @Bundle) {
        self.world.write_model(bundle);
    }

    fn registered(mut self: Store, bundle: @Bundle) {
        let event = BundleRegistered {
            bundle_id: *bundle.id,
            referral_percentage: *bundle.referral_percentage,
            reissuable: *bundle.reissuable,
            payment_receiver: *bundle.payment_receiver,
            time: *bundle.created_at,
        };
        self.world.emit_event(@event);
    }

    fn updated(mut self: Store, bundle: @Bundle, time: u64) {
        let event = BundleUpdated {
            bundle_id: *bundle.id,
            referral_percentage: *bundle.referral_percentage,
            reissuable: *bundle.reissuable,
            price: *bundle.price,
            payment_token: *bundle.payment_token,
            payment_receiver: *bundle.payment_receiver,
            metadata: bundle.metadata.clone(),
            time: time,
        };
        self.world.emit_event(@event);
    }

    fn issued(
        mut self: Store,
        bundle: @Bundle,
        issuance: @BundleIssuance,
        amount: u256,
        quantity: u32,
        referrer: Option<ContractAddress>,
        referrer_group: Option<felt252>,
    ) {
        let event = BundleIssued {
            recipient: *issuance.recipient,
            bundle_id: *bundle.id,
            payment_token: *bundle.payment_token,
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
    fn get_issuance(self: Store, bundle_id: u32, recipient: ContractAddress) -> BundleIssuance {
        self.world.read_model((bundle_id, recipient))
    }

    fn set_issuance(mut self: Store, issuance: @BundleIssuance) {
        self.world.write_model(issuance);
    }
}

#[generate_trait]
pub impl ReferralStoreImpl of ReferralStoreTrait {
    fn get_referral_or_new(self: Store, referrer_id: ContractAddress) -> BundleReferral {
        let mut referral: BundleReferral = self.world.read_model(referrer_id);
        if referral.total_referrals == 0 {
            referral = BundleReferralTrait::new(referrer_id);
        }
        referral
    }

    fn set_referral(mut self: Store, referral: @BundleReferral) {
        self.world.write_model(referral);
    }
}

#[generate_trait]
pub impl GroupStoreImpl of GroupStoreTrait {
    fn get_group_or_new(self: Store, group_id: felt252) -> BundleGroup {
        let mut group_reward: BundleGroup = self.world.read_model(group_id);
        if group_reward.total_referrals == 0 {
            group_reward = BundleGroupTrait::new(group_id);
        }
        group_reward
    }

    fn set_group(mut self: Store, group_reward: @BundleGroup) {
        self.world.write_model(group_reward);
    }
}

#[generate_trait]
pub impl VoucherStoreImpl of VoucherStoreTrait {
    fn get_voucher(self: Store, bundle_id: u32, voucher_key: felt252) -> BundleVoucher {
        self.world.read_model((bundle_id, voucher_key))
    }

    fn set_voucher(mut self: Store, voucher: @BundleVoucher) {
        self.world.write_model(voucher);
    }
}
