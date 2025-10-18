#[starknet::component]
pub mod IssuableComponent {
    // Dojo imports

    use dojo::event::EventStorage;
    use dojo::world::WorldStorage;

    // External imports

    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address};

    // Internal imports

    use starterpack::constants::{CONFIG_ID, FEE_DENOMINATOR};
    use starterpack::events::index::StarterpackIssued;
    use starterpack::interface::{
        IStarterpackImplementationDispatcher, IStarterpackImplementationDispatcherTrait,
    };
    use starterpack::models::config::ConfigTrait;
    use starterpack::models::group_reward::GroupRewardTrait;
    use starterpack::models::issuance::{IssuanceAssert, IssuanceTrait};
    use starterpack::models::referral_reward::ReferralRewardTrait;
    use starterpack::models::starterpack::{StarterpackAssert, StarterpackTrait};
    use starterpack::store::{
        ConfigStoreTrait, GroupRewardStoreTrait, IssuanceStoreTrait, ReferralRewardStoreTrait,
        StarterpackStoreTrait, StoreTrait,
    };

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn issue(
            self: @ComponentState<TContractState>,
            mut world: WorldStorage,
            recipient: ContractAddress,
            starterpack_id: u32,
            quantity: u32,
            referrer: Option<ContractAddress>,
            referrer_group: Option<felt252>,
        ) {
            let mut store = StoreTrait::new(world);

            let mut starterpack = store.get_starterpack(starterpack_id);
            starterpack.assert_is_active();
            starterpack.assert_quantity_allowed(quantity);

            if !starterpack.reissuable {
                let issuance = store.get_issuance(starterpack_id, recipient);
                issuance.assert_not_issued();
            }

            let payer = get_caller_address();
            let unit_price = starterpack.price;
            let base_price = unit_price * quantity.into();
            let payment_token = starterpack.payment_token;

            // Skip payment if base price is zero
            if base_price > 0 {
                let token_dispatcher = IERC20Dispatcher { contract_address: payment_token };

                // Get global config for protocol fee
                let config = store.get_config(CONFIG_ID);

                // Calculate referral fee if referrer exists (included in base price)
                let referral_fee_amount = if let Option::Some(ref_addr) = referrer {
                    let ref_fee = base_price
                        * starterpack.referral_percentage.into()
                        / FEE_DENOMINATOR.into();

                    // Transfer referral fee
                    if ref_fee > 0 {
                        token_dispatcher.transfer_from(payer, ref_addr, ref_fee);

                        // Track referral reward for individual referrer
                        let mut referral_reward = store.get_referral_reward(ref_addr);
                        if referral_reward.total_referrals == 0 {
                            referral_reward = ReferralRewardTrait::new(ref_addr);
                        }
                        referral_reward.add_referral(ref_fee);
                        store.set_referral_reward(@referral_reward);

                        // Track group reward if referrer_group exists
                        if let Option::Some(group_id) = referrer_group {
                            let mut group_reward = store.get_group_reward(group_id);
                            if group_reward.total_referrals == 0 {
                                group_reward = GroupRewardTrait::new(group_id);
                            }
                            group_reward.add_referral(ref_fee);
                            store.set_group_reward(@group_reward);
                        }
                    }
                    ref_fee
                } else {
                    0
                };

                // Calculate protocol fee (added on top of base price)
                let protocol_fee_amount = config.protocol_fee_amount(base_price);

                // Transfer protocol fee
                if protocol_fee_amount > 0 {
                    token_dispatcher.transfer_from(payer, config.fee_receiver, protocol_fee_amount);
                }

                // Calculate and transfer owner payment (base price minus referral fee)
                let owner_payment = base_price - referral_fee_amount;
                if owner_payment > 0 {
                    token_dispatcher.transfer_from(payer, starterpack.owner, owner_payment);
                }
            }

            let implementation_dispatcher = IStarterpackImplementationDispatcher {
                contract_address: starterpack.implementation,
            };
            implementation_dispatcher.on_issue(recipient, starterpack_id, quantity);

            let time = get_block_timestamp();
            let issuance = IssuanceTrait::new(starterpack_id, recipient, time);

            starterpack.issue(quantity);

            store.set_starterpack(@starterpack);
            store.set_issuance(@issuance);

            let config = store.get_config(CONFIG_ID);
            let total_amount = base_price + config.protocol_fee_amount(base_price);
            world
                .emit_event(
                    @StarterpackIssued {
                        recipient,
                        starterpack_id,
                        payment_token,
                        amount: total_amount,
                        quantity,
                        referrer,
                        referrer_group,
                        time,
                    },
                );
        }
    }
}

