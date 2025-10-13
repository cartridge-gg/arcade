#[starknet::component]
pub mod IssuableComponent {
    // Dojo imports

    use dojo::world::{IWorldDispatcherTrait, WorldStorage};
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address};

    // External imports

    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starterpack::interface::{
        IStarterpackImplementationDispatcher, IStarterpackImplementationDispatcherTrait,
    };

    // Internal imports

    use starterpack::constants::{CONFIG_ID, FEE_DENOMINATOR};
    use starterpack::events::issue::StarterpackIssued;
    use starterpack::models::config::ConfigTrait;
    use starterpack::models::issuance::{IssuanceAssert, IssuanceTrait};
    use starterpack::models::starterpack::{StarterpackAssert, StarterpackTrait};
    use starterpack::store::StoreTrait;

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
            world: WorldStorage,
            recipient: ContractAddress,
            starterpack_id: u32,
            referrer: Option<ContractAddress>,
            referrer_group: Option<felt252>,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Starterpack exists and is active
            let mut starterpack = store.get_starterpack(starterpack_id);
            starterpack.assert_is_active();

            // [Check] If not reissuable, recipient hasn't already been issued this starterpack
            if !starterpack.reissuable {
                let issuance = store.get_issuance(starterpack_id, recipient);
                issuance.assert_not_issued();
            }

            // [Effect] Process payment using stored price and token
            let payer = get_caller_address();
            let base_price = starterpack.price;
            let payment_token = starterpack.payment_token;
            let soulbound = starterpack.soulbound;
            
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

            // [Effect] Call implementation contract to mint assets
            let implementation_dispatcher = IStarterpackImplementationDispatcher {
                contract_address: starterpack.implementation,
            };
            implementation_dispatcher.on_issue(recipient, starterpack_id);

            // [Effect] Create issuance record
            let time = get_block_timestamp();
            let issuance = IssuanceTrait::new(
                starterpack_id,
                recipient,
                soulbound,
                time,
            );

            // [Effect] Update starterpack stats
            starterpack.issue();

            // [Effect] Store entities
            store.set_starterpack(@starterpack);
            store.set_issuance(@issuance);

            // [Event] Emit event with total amount paid (base price + protocol fee)
            let config = store.get_config(CONFIG_ID);
            let total_amount = base_price + config.protocol_fee_amount(base_price);
            world
                .emit_event(
                    @StarterpackIssued {
                        recipient,
                        starterpack_id,
                        soulbound,
                        payment_token,
                        amount: total_amount,
                        referrer,
                        referrer_group,
                        time,
                    }
                );
        }
    }
}

