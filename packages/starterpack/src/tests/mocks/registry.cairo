use starknet::ContractAddress;

// Constants

pub fn NAMESPACE() -> ByteArray {
    "NAMESPACE"
}


#[derive(Drop, Serde)]
pub struct StarterpackQuote {
    pub base_price: u256,
    pub referral_fee: u256,
    pub protocol_fee: u256,
    pub total_cost: u256,
    pub payment_token: ContractAddress,
}

#[starknet::interface]
pub trait IAdministration<TContractState> {
    fn grant_role(ref self: TContractState, account: ContractAddress, role_id: u8);
    fn revoke_role(ref self: TContractState, account: ContractAddress);
    fn set_protocol_fee(ref self: TContractState, fee_percentage: u8);
    fn set_fee_receiver(ref self: TContractState, receiver: ContractAddress);
}


#[starknet::interface]
pub trait IRegistry<TContractState> {
    fn quote(
        self: @TContractState, starterpack_id: u32, quantity: u32, has_referrer: bool,
    ) -> StarterpackQuote;

    fn supply(self: @TContractState, starterpack_id: u32) -> Option<u32>;

    fn metadata(self: @TContractState, starterpack_id: u32) -> ByteArray;

    fn register(
        ref self: TContractState,
        implementation: ContractAddress,
        referral_percentage: u8,
        reissuable: bool,
        price: u256,
        payment_token: ContractAddress,
        metadata: ByteArray,
    ) -> u32; // returns starterpack_id

    fn update(
        ref self: TContractState,
        starterpack_id: u32,
        implementation: ContractAddress,
        referral_percentage: u8,
        reissuable: bool,
        price: u256,
        payment_token: ContractAddress,
    );

    fn update_metadata(ref self: TContractState, starterpack_id: u32, metadata: ByteArray);

    fn pause(ref self: TContractState, starterpack_id: u32);

    fn resume(ref self: TContractState, starterpack_id: u32);

    fn issue(
        ref self: TContractState,
        recipient: ContractAddress,
        starterpack_id: u32,
        quantity: u32,
        referrer: Option<ContractAddress>,
        referrer_group: Option<felt252>,
    );
}


#[dojo::contract]
pub mod Registry {
    use dojo::world::WorldStorage;
    use starknet::ContractAddress;
    use crate::components::initializable::InitializableComponent;
    use crate::components::issuable::IssuableComponent;
    use crate::components::manageable::ManageableComponent;
    use crate::components::registrable::RegistrableComponent;
    use crate::constants::CONFIG_ID;
    use crate::interface::{
        IStarterpackImplementationDispatcher, IStarterpackImplementationDispatcherTrait,
    };
    use crate::models::config::ConfigTrait;
    use crate::models::starterpack::StarterpackAssert;
    use crate::store::{ConfigStoreTrait, StarterpackStoreTrait, StoreTrait};
    use super::{IAdministration, IRegistry, NAMESPACE, StarterpackQuote};

    // Components
    component!(path: InitializableComponent, storage: initializable, event: InitializableEvent);
    impl InitializableImpl = InitializableComponent::InternalImpl<ContractState>;
    component!(path: IssuableComponent, storage: issuable, event: IssuableEvent);
    impl IssuableImpl = IssuableComponent::InternalImpl<ContractState>;
    component!(path: ManageableComponent, storage: manageable, event: ManageableEvent);
    impl ManageableImpl = ManageableComponent::InternalImpl<ContractState>;
    component!(path: RegistrableComponent, storage: registrable, event: RegistrableEvent);
    impl RegistrableImpl = RegistrableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        initializable: InitializableComponent::Storage,
        #[substorage(v0)]
        issuable: IssuableComponent::Storage,
        #[substorage(v0)]
        manageable: ManageableComponent::Storage,
        #[substorage(v0)]
        registrable: RegistrableComponent::Storage,
    }

    // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        InitializableEvent: InitializableComponent::Event,
        #[flat]
        IssuableEvent: IssuableComponent::Event,
        #[flat]
        ManageableEvent: ManageableComponent::Event,
        #[flat]
        RegistrableEvent: RegistrableComponent::Event,
    }

    // Constructor
    fn dojo_init(
        ref self: ContractState,
        protocol_fee: u8,
        fee_receiver: ContractAddress,
        owner: ContractAddress,
    ) {
        self.initializable.initialize(self.world_storage(), protocol_fee, fee_receiver, owner);
    }

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

        fn set_protocol_fee(ref self: ContractState, fee_percentage: u8) {
            let world = self.world_storage();
            self.manageable.set_protocol_fee(world, fee_percentage);
        }

        fn set_fee_receiver(ref self: ContractState, receiver: ContractAddress) {
            let world = self.world_storage();
            self.manageable.set_fee_receiver(world, receiver);
        }
    }

    #[abi(embed_v0)]
    impl StarterpackImpl of IRegistry<ContractState> {
        fn quote(
            self: @ContractState, starterpack_id: u32, quantity: u32, has_referrer: bool,
        ) -> StarterpackQuote {
            let world = self.world_storage();
            let mut store = StoreTrait::new(world);

            // Get starterpack details
            let starterpack = store.get_starterpack(starterpack_id);
            starterpack.assert_does_exist();

            // Get config for protocol fee
            let config = store.get_config(CONFIG_ID);

            let unit_price = starterpack.price;
            let base_price = unit_price * quantity.into();
            let payment_token = starterpack.payment_token;

            // Calculate referral fee if has_referrer (per unit, then multiplied by quantity)
            let referral_fee = if has_referrer {
                base_price
                    * starterpack.referral_percentage.into()
                    / starterpack::constants::FEE_DENOMINATOR.into()
            } else {
                0
            };

            // Calculate protocol fee (added on top of base price)
            let protocol_fee = config.protocol_fee_amount(base_price);

            // Total cost = base price + protocol fee
            let total_cost = base_price + protocol_fee;

            StarterpackQuote { base_price, referral_fee, protocol_fee, total_cost, payment_token }
        }

        fn supply(self: @ContractState, starterpack_id: u32) -> Option<u32> {
            let world = self.world_storage();
            let store = StoreTrait::new(world);

            let starterpack = store.get_starterpack(starterpack_id);
            starterpack.assert_does_exist();

            let implementation = IStarterpackImplementationDispatcher {
                contract_address: starterpack.implementation,
            };

            implementation.supply(starterpack_id)
        }

        fn metadata(self: @ContractState, starterpack_id: u32) -> ByteArray {
            let world = self.world_storage();
            let mut store = StoreTrait::new(world);
            let starterpack = store.get_starterpack(starterpack_id);
            starterpack.assert_does_exist();
            starterpack.metadata
        }

        fn register(
            ref self: ContractState,
            implementation: ContractAddress,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
            metadata: ByteArray,
        ) -> u32 {
            let world = self.world_storage();
            self
                .registrable
                .register(
                    world,
                    implementation,
                    referral_percentage,
                    reissuable,
                    price,
                    payment_token,
                    metadata,
                )
        }

        fn update(
            ref self: ContractState,
            starterpack_id: u32,
            implementation: ContractAddress,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
        ) {
            let world = self.world_storage();
            self
                .registrable
                .update(
                    world,
                    starterpack_id,
                    implementation,
                    referral_percentage,
                    reissuable,
                    price,
                    payment_token,
                );
        }

        fn update_metadata(ref self: ContractState, starterpack_id: u32, metadata: ByteArray) {
            let world = self.world_storage();
            self.registrable.update_metadata(world, starterpack_id, metadata);
        }

        fn pause(ref self: ContractState, starterpack_id: u32) {
            let world = self.world_storage();
            self.registrable.pause(world, starterpack_id);
        }

        fn resume(ref self: ContractState, starterpack_id: u32) {
            let world = self.world_storage();
            self.registrable.resume(world, starterpack_id);
        }

        fn issue(
            ref self: ContractState,
            recipient: ContractAddress,
            starterpack_id: u32,
            quantity: u32,
            referrer: Option<ContractAddress>,
            referrer_group: Option<felt252>,
        ) {
            let world = self.world_storage();
            self
                .issuable
                .issue(world, recipient, starterpack_id, quantity, referrer, referrer_group);
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
