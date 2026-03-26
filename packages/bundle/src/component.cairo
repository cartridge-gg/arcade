#[starknet::component]
pub mod Component {
    use core::num::traits::Zero;
    use dojo::world::{IWorldDispatcherTrait, WorldStorage};
    use openzeppelin::interfaces::accounts::ISRC6Dispatcher;
    use openzeppelin::interfaces::token::erc20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address, get_contract_address};
    use crate::constants::MAX_REFERRAL_FEE;
    use crate::models::bundle::{BundleAssert, BundleTrait as BundleModelTrait, errors};
    use crate::models::group::BundleGroupTrait;
    use crate::models::issuance::{BundleIssuanceAssert, BundleIssuanceTrait};
    use crate::models::referral::BundleReferralTrait;
    use crate::models::voucher::{BundleVoucherAssert, BundleVoucherTrait};
    use crate::store::{
        BundleStoreTrait, GroupStoreTrait, IssuanceStoreTrait, ReferralStoreTrait, Store,
        StoreTrait, VoucherStoreTrait,
    };

    // Types

    #[derive(Drop, Serde)]
    pub struct BundleQuote {
        pub base_price: u256,
        pub referral_fee: u256,
        pub client_fee: u256,
        pub protocol_fee: u256,
        pub total_cost: u256,
        pub payment_token: ContractAddress,
        pub contract: ContractAddress,
    }

    // Hooks

    pub trait BundleTrait<TContractState> {
        fn on_issue(
            ref self: ComponentState<TContractState>,
            recipient: ContractAddress,
            bundle_id: u32,
            quantity: u32,
        );
        fn supply(self: @ComponentState<TContractState>, bundle_id: u32) -> Option<u32>;
    }

    // Configs

    pub trait BundleFeeTrait<TContractState> {
        fn protocol_fee(
            self: @ComponentState<TContractState>, amount: u256,
        ) -> (ContractAddress, u256) {
            (core::num::traits::Zero::zero(), 0)
        }
    }

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    // Implementations

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        impl BundleImpl: BundleTrait<TContractState>,
        impl BundleFeeImpl: BundleFeeTrait<TContractState>,
    > of InternalTrait<TContractState> {
        fn register(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
            payment_receiver: ContractAddress,
            metadata: ByteArray,
            allower: ContractAddress,
        ) -> u32 {
            // [Setup] Datastore
            let store: Store = StoreTrait::new(world);

            // [Check] Referral percentage is valid
            assert(referral_percentage <= MAX_REFERRAL_FEE, 'Bundle: referral too high');

            // [Effect] Create and store bundle
            let bundle_id = world.dispatcher.uuid();
            let time = get_block_timestamp();
            let this = get_contract_address();
            let bundle = BundleModelTrait::new(
                id: bundle_id,
                referral_percentage: referral_percentage,
                reissuable: reissuable,
                price: price,
                payment_token: payment_token,
                payment_receiver: payment_receiver,
                metadata: metadata,
                time: time,
                contract: this,
                allower: allower,
            );
            store.set_bundle(@bundle);

            // [Event] Emit bundle registered
            store.registered(@bundle);

            bundle_id
        }

        fn update(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            bundle_id: u32,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
            payment_receiver: ContractAddress,
            allower: ContractAddress,
        ) {
            // [Setup] Datastore
            let store = StoreTrait::new(world);

            // [Check] Bundle exists
            let mut bundle = store.get_bundle(bundle_id);
            bundle.assert_does_exist();

            // [Check] Referral percentage is valid
            assert(referral_percentage <= MAX_REFERRAL_FEE, 'Bundle: referral too high');

            // [Effect] Update bundle
            bundle
                .update(
                    referral_percentage,
                    reissuable,
                    price,
                    payment_token,
                    payment_receiver,
                    allower,
                );
            store.set_bundle(@bundle);

            // [Event] Emit bundle updated
            let time = get_block_timestamp();
            store.updated(@bundle, time);
        }

        fn update_metadata(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            bundle_id: u32,
            metadata: ByteArray,
        ) {
            // [Setup] Datastore
            let store = StoreTrait::new(world);

            // [Check] Bundle exists
            let mut bundle = store.get_bundle(bundle_id);
            bundle.assert_does_exist();

            // [Effect] Update metadata
            bundle.update_metadata(metadata.clone());
            store.set_bundle(@bundle);

            // [Event] Emit bundle updated
            let time = get_block_timestamp();
            store.updated(@bundle, time);
        }

        fn quote(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            bundle_id: u32,
            quantity: u32,
            has_referrer: bool,
            client_percentage: u8,
        ) -> BundleQuote {
            // [Setup] Datastore
            let store = StoreTrait::new(world);

            // [Check] Bundle exists
            let bundle = store.get_bundle(bundle_id);
            bundle.assert_does_exist();

            // [Compute] Fees
            let base_price = bundle.price * quantity.into();
            let payment_token = bundle.payment_token;
            let referral_fee = bundle.get_referral_fee(base_price, has_referrer);
            let client_fee = bundle.get_client_fee(base_price, client_percentage);
            let (_, protocol_fee) = BundleFeeImpl::protocol_fee(self, base_price);
            let total_cost = base_price + protocol_fee + client_fee;

            BundleQuote {
                base_price: base_price,
                referral_fee: referral_fee,
                client_fee: client_fee,
                protocol_fee: protocol_fee,
                total_cost: total_cost,
                payment_token: payment_token,
                contract: bundle.contract,
            }
        }

        fn get_metadata(
            self: @ComponentState<TContractState>, world: WorldStorage, bundle_id: u32,
        ) -> ByteArray {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Bundle exists
            let bundle = store.get_bundle(bundle_id);
            bundle.assert_does_exist();

            bundle.metadata
        }

        fn issue(
            ref self: ComponentState<TContractState>,
            mut world: WorldStorage,
            recipient: ContractAddress,
            bundle_id: u32,
            quantity: u32,
            referrer: Option<ContractAddress>,
            referrer_group: Option<felt252>,
            client: Option<ContractAddress>,
            client_percentage: u8,
            voucher_key: Option<felt252>,
            signature: Option<Span<felt252>>,
        ) {
            // [Setup] Datastore
            let store = StoreTrait::new(world);

            // [Check] Bundle exists and quantity is allowed
            let mut bundle = store.get_bundle(bundle_id);
            bundle.assert_does_exist();
            bundle.assert_quantity_allowed(quantity);

            // [Check] Supply limit not exceeded
            if let Some(supply_limit) = BundleImpl::supply(@self, bundle_id) {
                let new_total: u64 = bundle.total_issued + quantity.into();
                assert(new_total <= supply_limit.into(), errors::BUNDLE_SUPPLY_EXCEEDED);
            }

            // [Check] Not already issued (if non-reissuable)
            if !bundle.reissuable {
                let issuance = store.get_issuance(bundle_id, recipient);
                issuance.assert_not_issued();
            }

            // [Check] Voucher is valid (if allower is set)
            let time = get_block_timestamp();
            if bundle.allower.is_non_zero() {
                // [Check] Voucher is valid and not claimed
                let voucher_key = voucher_key.expect('Voucher: key is required');
                let mut voucher = store.get_voucher(voucher_key);
                let allower = ISRC6Dispatcher { contract_address: bundle.allower };
                let caller = get_caller_address();
                voucher.verify(bundle_id, caller, allower, signature);
                // [Effect] Claim voucher
                voucher.claim(caller);
                store.set_voucher(@voucher);
            }

            // [Compute] Fees
            let payer = get_caller_address();
            let base_price = bundle.price * quantity.into();
            let payment_token = bundle.payment_token;

            // [Interaction] Transfer payments
            let mut total_amount = base_price;
            let mut real_referrer: Option<ContractAddress> = None;
            let mut real_group: Option<felt252> = None;
            if base_price != 0 {
                let token_dispatcher = IERC20Dispatcher { contract_address: payment_token };

                // [Interaction] Transfer client fee
                let (client_address, client_fee) = bundle
                    .calculate_client_fee(base_price, client, client_percentage);
                if client_fee > 0 {
                    token_dispatcher.transfer_from(payer, client_address, client_fee);
                    total_amount += client_fee;
                }

                // [Interaction] Transfer protocol fee
                let (fee_receiver, protocol_fee) = BundleFeeImpl::protocol_fee(@self, base_price);
                if protocol_fee > 0 {
                    token_dispatcher.transfer_from(payer, fee_receiver, protocol_fee);
                    total_amount += protocol_fee;
                }

                // [Interaction] Transfer referral fee
                let (referral_address, referral_fee) = bundle
                    .calculate_referral_fee(base_price, referrer, payer);
                if referral_fee > 0 {
                    // [Interaction] Transfer referral fee
                    token_dispatcher.transfer_from(payer, referral_address, referral_fee);

                    // [Effect] Track referral reward
                    let mut referral = store.get_referral_or_new(referral_address);
                    referral.add(referral_fee);
                    store.set_referral(@referral);

                    // [Effect] Update referrer address
                    real_referrer = Some(referral_address);

                    // [Effect] Track group reward
                    if let Option::Some(group_id) = referrer_group {
                        let mut group = store.get_group_or_new(group_id);
                        group.add(referral_fee);
                        store.set_group(@group);

                        // [Effect] Update group address
                        real_group = Some(group_id);
                    }
                }

                // [Interaction] Transfer remaining to payment receiver
                let remaining = base_price - referral_fee;
                if remaining > 0 {
                    token_dispatcher.transfer_from(payer, bundle.payment_receiver, remaining);
                }
            }

            // [Interaction] Notify implementation
            BundleImpl::on_issue(ref self, recipient, bundle_id, quantity);

            // [Effect] Record issuance
            let issuance = BundleIssuanceTrait::new(bundle_id, recipient, time);
            store.set_issuance(@issuance);

            // [Effect] Increment total issued
            bundle.issue(quantity);
            store.set_bundle(@bundle);

            // [Event] Emit bundle issued
            store.issued(@bundle, @issuance, total_amount, quantity, real_referrer, real_group);
        }
    }
}
