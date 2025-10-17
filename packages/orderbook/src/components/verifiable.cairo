#[starknet::component]
pub mod VerifiableComponent {
    // Starknet imports

    // External imports

    use openzeppelin::introspection::interface::{ISRC5Dispatcher, ISRC5DispatcherTrait};
    use openzeppelin::token::common::erc2981::interface::{
        IERC2981Dispatcher, IERC2981DispatcherTrait, IERC2981_ID,
    };
    use openzeppelin::token::erc1155::interface::{
        IERC1155Dispatcher, IERC1155DispatcherTrait, IERC1155_ID,
    };
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use openzeppelin::token::erc721::interface::{
        IERC721Dispatcher, IERC721DispatcherTrait, IERC721_ID,
    };
    use starknet::ContractAddress;

    // Errors

    pub mod errors {
        pub const SALE_INVALID_COLLECTION: felt252 = 'Sale: invalid collection';
        pub const SALE_NOT_OWNER: felt252 = 'Sale: not owner';
        pub const SALE_NOT_APPROVED: felt252 = 'Sale: not approved';
        pub const SALE_NOT_ALLOWED: felt252 = 'Sale: not allowed';
        pub const SALE_INVALID_BALANCE: felt252 = 'Sale: invalid balance';
        pub const SALE_NOT_INVALID: felt252 = 'Sale: not invalid';
        pub const SALE_INVALID_VALUE: felt252 = 'Sale: invalid value';
        pub const SALE_EXPIRED: felt252 = 'Sale: expired';
    }

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
        #[inline]
        fn get_sell_validity(
            self: @ComponentState<TContractState>,
            owner: ContractAddress,
            expiration: u64,
            collection: ContractAddress,
            token_id: u256,
            value: u256,
        ) -> (bool, felt252) {
            // [Check] Expiration
            if (expiration < starknet::get_block_timestamp()) {
                return (false, errors::SALE_EXPIRED);
            }
            let src5_dispatcher = ISRC5Dispatcher { contract_address: collection };
            if src5_dispatcher.supports_interface(IERC1155_ID) {
                // [Check] ERC1155 requirements
                let collection_dispatcher = IERC1155Dispatcher { contract_address: collection };
                // [Check] ERC1155 approval
                let is_approved = ERC1155Impl::operator_is_approved(
                    self: self, collection: collection_dispatcher, owner: owner, token_id: token_id,
                );
                if (!is_approved) {
                    return (false, errors::SALE_NOT_APPROVED);
                }
                // [Check] ERC1155 balance
                let has_enough_balance = ERC1155Impl::has_enough_balance(
                    self: self,
                    collection: collection_dispatcher,
                    account: owner,
                    token_id: token_id,
                    value: value,
                );
                if (!has_enough_balance || value == 0) {
                    return (false, errors::SALE_INVALID_VALUE);
                }
            } else if src5_dispatcher.supports_interface(IERC721_ID) {
                // [Check] ERC721 requirements
                let collection_dispatcher = IERC721Dispatcher { contract_address: collection };
                // [Check] ERC721 approval
                let is_approved = ERC721Impl::operator_is_approved(
                    self: self, collection: collection_dispatcher, owner: owner, token_id: token_id,
                );
                if (!is_approved) {
                    return (false, errors::SALE_NOT_APPROVED);
                }
                // [Check] ERC721 owner
                let is_owner = ERC721Impl::is_token_owner(
                    self: self,
                    collection: collection_dispatcher,
                    account: owner,
                    token_id: token_id,
                );
                if (!is_owner) {
                    return (false, errors::SALE_NOT_OWNER);
                }
                // [Check] ERC721 value
                if (value != 0) {
                    return (false, errors::SALE_INVALID_VALUE);
                }
            } else {
                // [Panic] Unsupported collection
                return (false, errors::SALE_INVALID_COLLECTION);
            }
            (true, 0)
        }

        #[inline]
        fn get_buy_validity(
            self: @ComponentState<TContractState>,
            owner: ContractAddress,
            expiration: u64,
            currency: ContractAddress,
            price: u256,
            collection: ContractAddress,
            token_id: u256,
            value: u256,
        ) -> (bool, felt252) {
            // [Check] Expiration
            if (expiration < starknet::get_block_timestamp()) {
                return (false, errors::SALE_EXPIRED);
            }
            // [Check] ERC20 balance
            let erc20_dispatcher = IERC20Dispatcher { contract_address: currency };
            let has_enough_balance = ERC20Impl::has_enough_balance(
                self: self, currency: erc20_dispatcher, account: owner, amount: price,
            );
            if (!has_enough_balance) {
                return (false, errors::SALE_INVALID_BALANCE);
            }
            // [Check] ERC20 approval
            let spender_is_allowed = ERC20Impl::spender_is_allowed(
                self: self, currency: erc20_dispatcher, owner: owner, amount: price,
            );
            if (!spender_is_allowed) {
                return (false, errors::SALE_NOT_ALLOWED);
            }
            // [Check] Collection value
            let src5_dispatcher = ISRC5Dispatcher { contract_address: collection };
            if src5_dispatcher.supports_interface(IERC1155_ID) && value == 0 {
                return (false, errors::SALE_INVALID_VALUE);
            } else if src5_dispatcher.supports_interface(IERC721_ID) && value != 0 {
                return (false, errors::SALE_INVALID_VALUE);
            }
            (true, 0)
        }

        #[inline]
        fn transfer(
            self: @ComponentState<TContractState>,
            owner: ContractAddress,
            collection: ContractAddress,
            token_id: u256,
            value: u256,
            recipient: ContractAddress,
        ) {
            let data: Span<felt252> = array![].span();
            let src5_dispatcher = ISRC5Dispatcher { contract_address: collection };
            if src5_dispatcher.supports_interface(IERC1155_ID) {
                // [Interaction] ERC1155 transfer
                let collection_dispatcher = IERC1155Dispatcher { contract_address: collection };
                collection_dispatcher
                    .safe_transfer_from(
                        from: owner, to: recipient, token_id: token_id, value: value, data: data,
                    );
            } else if src5_dispatcher.supports_interface(IERC721_ID) {
                // [Interaction] ERC721 transfer
                let collection_dispatcher = IERC721Dispatcher { contract_address: collection };
                collection_dispatcher
                    .safe_transfer_from(from: owner, to: recipient, token_id: token_id, data: data);
            } else {
                // [Panic] Unsupported collection
                assert(false, errors::SALE_INVALID_COLLECTION);
            }
        }

        #[inline]
        fn pay(
            self: @ComponentState<TContractState>,
            spender: ContractAddress,
            recipient: ContractAddress,
            currency: ContractAddress,
            amount: u256,
        ) {
            // [Check] Skip if amount is zero
            if amount == 0 {
                return;
            }
            // [Interaction] ERC20 transfer from
            let currency_dispatcher = IERC20Dispatcher { contract_address: currency };
            currency_dispatcher
                .transfer_from(sender: spender, recipient: recipient, amount: amount);
        }

        fn process(
            self: @ComponentState<TContractState>,
            spender: ContractAddress,
            owner: ContractAddress,
            collection: ContractAddress,
            token_id: u256,
            value: u256,
            currency: ContractAddress,
            price: u256,
            expiration: u64,
            ref fees: Span<(ContractAddress, u256)>,
        ) {
            // [Check] Process requirements
            self
                .assert_buy_validity(
                    owner: spender,
                    expiration: expiration,
                    currency: currency,
                    price: price,
                    collection: collection,
                    token_id: token_id,
                    value: value,
                );
            self
                .assert_sell_validity(
                    owner: owner,
                    expiration: expiration,
                    collection: collection,
                    token_id: token_id,
                    value: value,
                );

            // [Interaction] Pay fees
            let mut remaining = price;
            while let Option::Some((recipient, amount)) = fees.pop_front() {
                remaining -= *amount;
                self
                    .pay(
                        spender: spender,
                        recipient: *recipient,
                        currency: currency,
                        amount: *amount,
                    );
            }
            // [Interaction] Pay owner
            self.pay(spender: spender, recipient: owner, currency: currency, amount: remaining);
            // [Interaction] Transfer asset
            self
                .transfer(
                    owner: owner,
                    collection: collection,
                    token_id: token_id,
                    value: value,
                    recipient: spender,
                );
        }

        #[inline]
        fn royalties(
            self: @ComponentState<TContractState>,
            collection: ContractAddress,
            token_id: u256,
            sale_price: u256,
        ) -> (ContractAddress, u256) {
            let src5_dispatcher = ISRC5Dispatcher { contract_address: collection };
            if src5_dispatcher.supports_interface(IERC2981_ID) {
                // [Interaction] ERC2981 royalties
                let collection_dispatcher = IERC2981Dispatcher { contract_address: collection };
                return collection_dispatcher.royalty_info(token_id, sale_price);
            }
            // [Fallback] No royalties
            (starknet::get_contract_address(), 0)
        }

        #[inline]
        fn assert_sell_validity(
            self: @ComponentState<TContractState>,
            owner: ContractAddress,
            expiration: u64,
            collection: ContractAddress,
            token_id: u256,
            value: u256,
        ) {
            let (is_valid, error) = self
                .get_sell_validity(
                    owner: owner,
                    expiration: expiration,
                    collection: collection,
                    token_id: token_id,
                    value: value,
                );
            assert(is_valid, error);
        }

        #[inline]
        fn assert_sell_invalidity(
            self: @ComponentState<TContractState>,
            owner: ContractAddress,
            expiration: u64,
            collection: ContractAddress,
            token_id: u256,
            value: u256,
        ) {
            let (is_valid, _) = self
                .get_sell_validity(
                    owner: owner,
                    expiration: expiration,
                    collection: collection,
                    token_id: token_id,
                    value: value,
                );
            assert(!is_valid, errors::SALE_NOT_INVALID);
        }

        #[inline]
        fn assert_buy_validity(
            self: @ComponentState<TContractState>,
            owner: ContractAddress,
            expiration: u64,
            currency: ContractAddress,
            price: u256,
            collection: ContractAddress,
            token_id: u256,
            value: u256,
        ) {
            let (is_valid, error) = self
                .get_buy_validity(
                    owner: owner,
                    expiration: expiration,
                    currency: currency,
                    price: price,
                    collection: collection,
                    token_id: token_id,
                    value: value,
                );
            assert(is_valid, error);
        }

        #[inline]
        fn assert_buy_invalidity(
            self: @ComponentState<TContractState>,
            owner: ContractAddress,
            expiration: u64,
            currency: ContractAddress,
            price: u256,
            collection: ContractAddress,
            token_id: u256,
            value: u256,
        ) {
            let (is_valid, _) = self
                .get_buy_validity(
                    owner: owner,
                    expiration: expiration,
                    currency: currency,
                    price: price,
                    collection: collection,
                    token_id: token_id,
                    value: value,
                );
            assert(!is_valid, errors::SALE_NOT_INVALID);
        }
    }

    #[generate_trait]
    pub impl SRC5Impl<TContractState, +HasComponent<TContractState>> of SRC5Trait<TContractState> {
        #[inline]
        fn supports_interface(
            self: @ComponentState<TContractState>,
            collection: ISRC5Dispatcher,
            interface_id: felt252,
        ) -> bool {
            collection.supports_interface(interface_id)
        }
    }

    #[generate_trait]
    pub impl ERC20Impl<
        TContractState, +HasComponent<TContractState>,
    > of ERC20Trait<TContractState> {
        #[inline]
        fn spender_is_allowed(
            self: @ComponentState<TContractState>,
            currency: IERC20Dispatcher,
            owner: ContractAddress,
            amount: u256,
        ) -> bool {
            let spender = starknet::get_contract_address();
            currency.allowance(owner, spender) >= amount
        }

        #[inline]
        fn has_enough_balance(
            self: @ComponentState<TContractState>,
            currency: IERC20Dispatcher,
            account: ContractAddress,
            amount: u256,
        ) -> bool {
            currency.balance_of(account) >= amount
        }
    }

    #[generate_trait]
    pub impl ERC721Impl<
        TContractState, +HasComponent<TContractState>,
    > of ERC721Trait<TContractState> {
        #[inline]
        fn operator_is_approved(
            self: @ComponentState<TContractState>,
            collection: IERC721Dispatcher,
            owner: ContractAddress,
            token_id: u256,
        ) -> bool {
            let operator = starknet::get_contract_address();
            collection.is_approved_for_all(owner, operator)
        }

        #[inline]
        fn is_token_owner(
            self: @ComponentState<TContractState>,
            collection: IERC721Dispatcher,
            account: ContractAddress,
            token_id: u256,
        ) -> bool {
            collection.owner_of(token_id) == account
        }
    }

    #[generate_trait]
    pub impl ERC1155Impl<
        TContractState, +HasComponent<TContractState>,
    > of ERC1155Trait<TContractState> {
        #[inline]
        fn operator_is_approved(
            self: @ComponentState<TContractState>,
            collection: IERC1155Dispatcher,
            owner: ContractAddress,
            token_id: u256,
        ) -> bool {
            let operator = starknet::get_contract_address();
            collection.is_approved_for_all(owner, operator)
        }

        #[inline]
        fn has_enough_balance(
            self: @ComponentState<TContractState>,
            collection: IERC1155Dispatcher,
            account: ContractAddress,
            token_id: u256,
            value: u256,
        ) -> bool {
            collection.balance_of(account, token_id) >= value
        }
    }

    #[generate_trait]
    pub impl ERC2981Impl<
        TContractState, +HasComponent<TContractState>,
    > of ERC2981Trait<TContractState> {
        #[inline]
        fn royalty_info(
            self: @ComponentState<TContractState>,
            collection: IERC2981Dispatcher,
            token_id: u256,
            sale_price: u256,
        ) -> (ContractAddress, u256) {
            collection.royalty_info(token_id, sale_price)
        }
    }
}
