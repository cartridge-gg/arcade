// Interfaces

#[starknet::interface]
pub trait IAdministration<TContractState> {
    fn grant_role(ref self: TContractState, account: starknet::ContractAddress, role_id: u8);
    fn revoke_role(ref self: TContractState, account: starknet::ContractAddress);
    fn pause(ref self: TContractState);
    fn resume(ref self: TContractState);
    fn set_fee(ref self: TContractState, fee_num: u32, fee_receiver: starknet::ContractAddress);
    fn set_royalties(ref self: TContractState, enabled: bool);
}

#[starknet::interface]
pub trait IHelper<TContractState> {
    fn get_validity(
        self: @TContractState, order_id: u32, collection: starknet::ContractAddress, token_id: u256,
    ) -> (bool, felt252);
    fn get_validities(
        self: @TContractState, orders: Span<(u32, starknet::ContractAddress, u256)>,
    ) -> Span<(bool, felt252)>;
}

#[starknet::interface]
pub trait IMarketplace<TContractState> {
    fn list(
        ref self: TContractState,
        collection: starknet::ContractAddress,
        token_id: u256,
        quantity: u128,
        price: u128,
        currency: starknet::ContractAddress,
        expiration: u64,
        royalties: bool,
    );
    fn offer(
        ref self: TContractState,
        collection: starknet::ContractAddress,
        token_id: u256,
        quantity: u128,
        price: u128,
        currency: starknet::ContractAddress,
        expiration: u64,
    );
    fn intent(
        ref self: TContractState,
        collection: starknet::ContractAddress,
        quantity: u128,
        price: u128,
        currency: starknet::ContractAddress,
        expiration: u64,
    );
    fn cancel(
        ref self: TContractState,
        order_id: u32,
        collection: starknet::ContractAddress,
        token_id: u256,
    );
    fn remove(
        ref self: TContractState,
        order_id: u32,
        collection: starknet::ContractAddress,
        token_id: u256,
    );
    fn execute(
        ref self: TContractState,
        order_id: u32,
        collection: starknet::ContractAddress,
        token_id: u256,
        asset_id: u256,
        quantity: u128,
        royalties: bool,
        client_fee: u32,
        client_receiver: starknet::ContractAddress,
    );
}

// Contracts

#[dojo::contract]
pub mod Marketplace {
    // Starknet imports

    // Dojo imports

    // Internal imports

    use arcade::constants::NAMESPACE;
    use dojo::world::WorldStorage;
    use orderbook::components::buyable::BuyableComponent;

    // Component imports

    use orderbook::components::manageable::ManageableComponent;
    use orderbook::components::sellable::SellableComponent;
    use orderbook::components::verifiable::VerifiableComponent;
    use starknet::ContractAddress;

    // Local imports

    use super::{IAdministration, IHelper, IMarketplace};

    // Components

    component!(path: ManageableComponent, storage: manageable, event: ManageableEvent);
    impl ManageableImpl = ManageableComponent::InternalImpl<ContractState>;
    component!(path: BuyableComponent, storage: buyable, event: BuyableEvent);
    impl BuyableImpl = BuyableComponent::InternalImpl<ContractState>;
    component!(path: SellableComponent, storage: sellable, event: SellableEvent);
    impl SellableImpl = SellableComponent::InternalImpl<ContractState>;
    component!(path: VerifiableComponent, storage: verifiable, event: VerifiableEvent);
    impl VerifiableImpl = VerifiableComponent::InternalImpl<ContractState>;

    // Errors

    pub const UNKNOWN_ORDER: felt252 = 'Marketplace: unknown order';

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        manageable: ManageableComponent::Storage,
        #[substorage(v0)]
        buyable: BuyableComponent::Storage,
        #[substorage(v0)]
        sellable: SellableComponent::Storage,
        #[substorage(v0)]
        verifiable: VerifiableComponent::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ManageableEvent: ManageableComponent::Event,
        #[flat]
        BuyableEvent: BuyableComponent::Event,
        #[flat]
        SellableEvent: SellableComponent::Event,
        #[flat]
        VerifiableEvent: VerifiableComponent::Event,
    }

    // Constructor

    fn dojo_init(
        ref self: ContractState,
        royalties: bool,
        fee_num: u32,
        fee_receiver: ContractAddress,
        owner: ContractAddress,
    ) {
        self.manageable.initialize(self.world_storage(), royalties, fee_num, fee_receiver, owner);
    }

    // Implementations

    #[abi(embed_v0)]
    impl AdministrationImpl of IAdministration<ContractState> {
        fn grant_role(ref self: ContractState, account: ContractAddress, role_id: u8) {
            let world = self.world_storage();
            self.manageable.grant_role(world, account, role_id);
        }

        fn revoke_role(ref self: ContractState, account: ContractAddress) {
            let world = self.world_storage();
            self.manageable.revoke_role(world, account);
        }

        fn pause(ref self: ContractState) {
            let world = self.world_storage();
            self.manageable.pause(world);
        }

        fn resume(ref self: ContractState) {
            let world = self.world_storage();
            self.manageable.resume(world);
        }

        fn set_fee(ref self: ContractState, fee_num: u32, fee_receiver: ContractAddress) {
            let world = self.world_storage();
            self.manageable.set_fee(world, fee_num, fee_receiver);
        }

        fn set_royalties(ref self: ContractState, enabled: bool) {
            let world = self.world_storage();
            self.manageable.set_royalties(world, enabled);
        }
    }

    #[abi(embed_v0)]
    impl HelperImpl of IHelper<ContractState> {
        fn get_validity(
            self: @ContractState, order_id: u32, collection: ContractAddress, token_id: u256,
        ) -> (bool, felt252) {
            let world = self.world_storage();
            if self.sellable.is_sell_order(world, order_id, collection, token_id) {
                return self.sellable.get_validity(world, order_id, collection, token_id);
            } else if self.buyable.is_buy_order(world, order_id, collection, token_id) {
                return self.buyable.get_validity(world, order_id, collection, token_id);
            } else {
                return (false, UNKNOWN_ORDER);
            }
        }

        fn get_validities(
            self: @ContractState, mut orders: Span<(u32, ContractAddress, u256)>,
        ) -> Span<(bool, felt252)> {
            let mut validities: Array<(bool, felt252)> = array![];
            while let Option::Some((order_id, collection, token_id)) = orders.pop_front() {
                let validity = self.get_validity(*order_id, *collection, *token_id);
                validities.append(validity);
            }
            validities.span()
        }
    }

    #[abi(embed_v0)]
    impl MarketplaceImpl of IMarketplace<ContractState> {
        fn list(
            ref self: ContractState,
            collection: ContractAddress,
            token_id: u256,
            quantity: u128,
            price: u128,
            currency: ContractAddress,
            expiration: u64,
            royalties: bool,
        ) {
            let world = self.world_storage();
            self
                .sellable
                .create(
                    world, collection, token_id, quantity, price, currency, expiration, royalties,
                )
        }

        fn offer(
            ref self: ContractState,
            collection: ContractAddress,
            token_id: u256,
            quantity: u128,
            price: u128,
            currency: ContractAddress,
            expiration: u64,
        ) {
            let world = self.world_storage();
            self
                .buyable
                .create(
                    world, collection, token_id, quantity, price, currency, expiration, any: false,
                )
        }

        fn intent(
            ref self: ContractState,
            collection: ContractAddress,
            quantity: u128,
            price: u128,
            currency: ContractAddress,
            expiration: u64,
        ) {
            let world = self.world_storage();
            self
                .buyable
                .create(world, collection, 0, quantity, price, currency, expiration, any: true)
        }

        fn cancel(
            ref self: ContractState, order_id: u32, collection: ContractAddress, token_id: u256,
        ) {
            let world = self.world_storage();
            if self.sellable.is_sell_order(world, order_id, collection, token_id) {
                return self.sellable.cancel(world, order_id, collection, token_id);
            }
            self.buyable.cancel(world, order_id, collection, token_id)
        }

        fn remove(
            ref self: ContractState, order_id: u32, collection: ContractAddress, token_id: u256,
        ) {
            let world = self.world_storage();
            if self.sellable.is_sell_order(world, order_id, collection, token_id) {
                return self.sellable.delete(world, order_id, collection, token_id);
            }
            self.buyable.delete(world, order_id, collection, token_id)
        }

        fn execute(
            ref self: ContractState,
            order_id: u32,
            collection: ContractAddress,
            token_id: u256,
            asset_id: u256,
            quantity: u128,
            royalties: bool,
            client_fee: u32,
            client_receiver: starknet::ContractAddress,
        ) {
            let world = self.world_storage();
            if self.sellable.is_sell_order(world, order_id, collection, token_id) {
                return self
                    .sellable
                    .execute(
                        world,
                        order_id,
                        collection,
                        token_id,
                        quantity,
                        client_fee,
                        client_receiver,
                    );
            }
            self
                .buyable
                .execute(
                    world,
                    order_id,
                    collection,
                    token_id,
                    asset_id,
                    quantity,
                    royalties,
                    client_fee,
                    client_receiver,
                )
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
