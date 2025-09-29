#[starknet::component]
pub mod SellableComponent {
    // Starknet imports

    // Dojo imports

    use dojo::world::WorldStorage;
    use orderbook::components::verifiable::VerifiableComponent;
    use orderbook::components::verifiable::VerifiableComponent::InternalImpl as VerifiableImpl;

    // Internal imports

    use orderbook::constants::BOOK_ID;
    use orderbook::models::book::{BookAssert, BookTrait};
    use orderbook::models::order::{OrderAssert, OrderTrait};
    use orderbook::store::StoreTrait;
    use orderbook::types::category::Category;
    use starknet::ContractAddress;

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl Verify: VerifiableComponent::HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn create(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            collection: ContractAddress,
            token_id: u256,
            quantity: u128,
            price: u128,
            currency: ContractAddress,
            expiration: u64,
            royalties: bool,
        ) {
            // [Check] Book is not paused
            let mut store = StoreTrait::new(world);
            let mut book = store.book(BOOK_ID);
            book.assert_not_paused();

            // [Check] Validity requirements
            let caller_address = starknet::get_caller_address();
            let value: u256 = quantity.into();
            let verifiable = get_dep_component!(self, Verify);
            verifiable
                .assert_sell_validity(
                    owner: caller_address,
                    expiration: expiration,
                    collection: collection,
                    token_id: token_id,
                    value: value,
                );

            // [Effect] Create order
            let order_id = book.get_id();
            let time = starknet::get_block_timestamp();
            // [Info] Royalties defined by the seller
            let order = OrderTrait::new(
                id: order_id,
                category: Category::Sell,
                collection: collection.into(),
                token_id: token_id,
                royalties: royalties,
                quantity: quantity,
                price: price,
                currency: currency.into(),
                expiration: expiration,
                now: time,
                owner: caller_address.into(),
            );

            // [Effect] Update models
            store.set_order(@order);
            store.set_book(@book);

            // [Event] Sale
            store.listing(order: order, time: time);
        }

        fn cancel(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            order_id: u32,
            collection: ContractAddress,
            token_id: u256,
        ) {
            // [Check] Book is not paused
            let mut store = StoreTrait::new(world);
            let book = store.book(BOOK_ID);
            book.assert_not_paused();

            // [Check] Order exists
            let mut order = store.order(order_id, collection.into(), token_id);
            order.assert_does_exist();

            // [Check] Order category
            order.assert_sell_order();

            // [Check] Caller is order owner
            let caller: felt252 = starknet::get_caller_address().into();
            order.assert_is_allowed(caller);

            // [Effect] Update order
            order.cancel();

            // [Effect] Update models
            store.set_order(@order);
        }

        fn delete(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            order_id: u32,
            collection: ContractAddress,
            token_id: u256,
        ) {
            // [Check] Book is not paused
            let mut store = StoreTrait::new(world);
            let book = store.book(BOOK_ID);
            book.assert_not_paused();

            // [Check] Order exists
            let mut order = store.order(order_id, collection.into(), token_id);
            order.assert_does_exist();

            // [Check] Order category
            order.assert_sell_order();

            // [Check] Inactive requirements
            let owner: ContractAddress = order.owner.try_into().unwrap();
            let collection: ContractAddress = order.collection.try_into().unwrap();
            let value: u256 = order.quantity.into();
            let verifiable = get_dep_component!(self, Verify);
            verifiable
                .assert_sell_invalidity(
                    owner: owner,
                    expiration: order.expiration,
                    collection: collection,
                    token_id: order.token_id,
                    value: value,
                );

            // [Effect] Update order
            order.delete();

            // [Effect] Update models
            store.set_order(@order);
        }

        fn execute(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            order_id: u32,
            collection: ContractAddress,
            token_id: u256,
            quantity: u128,
            client_fee: u32,
            client_receiver: ContractAddress,
        ) {
            // [Check] Book is not paused
            let mut store = StoreTrait::new(world);
            let book = store.book(BOOK_ID);
            book.assert_not_paused();

            // [Check] Order exists
            let mut order = store.order(order_id, collection.into(), token_id);
            order.assert_does_exist();

            // [Check] Order category
            order.assert_sell_order();

            // [Check] Client fee
            BookAssert::assert_valid_client_fee(client_fee, client_receiver.into());

            // [Check] Validity requirements
            let owner: ContractAddress = order.owner.try_into().unwrap();
            let collection: ContractAddress = order.collection.try_into().unwrap();
            let token_id: u256 = order.token_id;
            let value: u256 = quantity.into();
            let verifiable = get_dep_component!(self, Verify);
            let spender = starknet::get_caller_address();
            let currency: ContractAddress = order.currency.try_into().unwrap();
            // [Info] Price is a unit price in case or ERC1155 otherwise the asset price
            let nominal_price: u256 = core::cmp::max(
                order.price.into(), order.price.into() * value,
            );
            // [Info] Price is inflated by the client fee since it must be paid by the buyer
            let (client_receiver, client_fee) = book
                .client_fee(nominal_price, client_fee, client_receiver.into());

            // [Effect] Execute order
            let time = starknet::get_block_timestamp();
            order.execute(quantity, time);
            store.set_order(@order);

            // [Interaction] Process sale
            let (orderbook_receiver, orderbook_fee) = book.protocol_fee(nominal_price);
            // [Info] Royalties are toggled by the seller (owner of the order)
            let (creator_receiver, creator_fee) = if order.royalties || book.royalties {
                verifiable.royalties(collection, token_id, nominal_price)
            } else {
                (starknet::get_contract_address(), 0)
            };
            let mut fees = array![
                (client_receiver.try_into().unwrap(), client_fee),
                (orderbook_receiver.try_into().unwrap(), orderbook_fee),
                (creator_receiver, creator_fee),
            ]
                .span();
            verifiable
                .process(
                    spender: spender,
                    owner: owner,
                    collection: collection,
                    token_id: token_id,
                    value: value,
                    currency: currency,
                    price: nominal_price + client_fee,
                    expiration: order.expiration,
                    ref fees: fees,
                );

            // [Event] Sale
            let from: felt252 = owner.into();
            let to: felt252 = spender.into();
            store.sale(order: order, from: from, to: to, time: time);
        }

        fn get_validity(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            order_id: u32,
            collection: ContractAddress,
            token_id: u256,
        ) -> (bool, felt252) {
            // [Return] Validity status
            let mut store = StoreTrait::new(world);
            let order = store.order(order_id, collection.into(), token_id);
            let verifiable = get_dep_component!(self, Verify);
            let owner: ContractAddress = order.owner.try_into().unwrap();
            let collection: ContractAddress = order.collection.try_into().unwrap();
            let value: u256 = order.quantity.into();
            verifiable.get_sell_validity(owner, order.expiration, collection, order.token_id, value)
        }

        fn is_sell_order(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            order_id: u32,
            collection: ContractAddress,
            token_id: u256,
        ) -> bool {
            let mut store = StoreTrait::new(world);
            let order = store.order(order_id, collection.into(), token_id);
            order.is_sell_order()
        }
    }
}
