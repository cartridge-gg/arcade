use starknet::ContractAddress;

#[derive(Drop, Serde)]
pub struct StarterPackMetadata {
    pub name: ByteArray,
    pub description: ByteArray,
    pub image_uri: ByteArray,
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
    fn initialize(
        ref self: TContractState, protocol_fee: u8, fee_receiver: ContractAddress,
    );
    fn set_protocol_fee(ref self: TContractState, fee_percentage: u8);
    fn set_fee_receiver(ref self: TContractState, receiver: ContractAddress);
    fn pause(ref self: TContractState, starterpack_id: u32);
    fn resume(ref self: TContractState, starterpack_id: u32);
}


#[starknet::interface]
pub trait IStarterpack<TContractState> {
    fn quote(
        self: @TContractState,
        starterpack_id: u32,
        has_referrer: bool,
    ) -> StarterpackQuote;
    fn register(
        ref self: TContractState,
        implementation: ContractAddress,
        referral_percentage: u8,
        reissuable: bool,
        soulbound: bool,
        price: u256,
        payment_token: ContractAddress,
        metadata: StarterPackMetadata,
    ) -> u32; // returns starterpack_id

    fn issue(
        ref self: TContractState,
        recipient: ContractAddress,
        starterpack_id: u32,
        referrer: Option<ContractAddress>,
        referrer_group: Option<felt252>
    );
}



#[dojo::contract]
pub mod Starterpack {
    use super::{StarterPackMetadata, StarterpackQuote, IAdministration, IStarterpack};
    use core::num::traits::Zero;
    use starknet::ContractAddress;
    use dojo::world::WorldStorage;
    use arcade::constants::NAMESPACE;
    use starterpack::constants::{CONFIG_ID, MAX_PROTOCOL_FEE};
    use starterpack::models::config::{ConfigTrait, ConfigAssertTrait};
    use starterpack::store::{Store, StoreTrait, ConfigStoreTrait, StarterpackStoreTrait};

    // Component imports
    use starterpack::components::issuable::IssuableComponent;
    use starterpack::components::registrable::RegistrableComponent;

    // Components
    component!(path: IssuableComponent, storage: issuable, event: IssuableEvent);
    impl IssuableImpl = IssuableComponent::InternalImpl<ContractState>;
    component!(path: RegistrableComponent, storage: registrable, event: RegistrableEvent);
    impl RegistrableImpl = RegistrableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        issuable: IssuableComponent::Storage,
        #[substorage(v0)]
        registrable: RegistrableComponent::Storage,
    }

    // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        IssuableEvent: IssuableComponent::Event,
        #[flat]
        RegistrableEvent: RegistrableComponent::Event,
    }

    #[abi(embed_v0)]
    impl AdministrationImpl of IAdministration<ContractState> {
        fn initialize(
            ref self: ContractState, protocol_fee: u8, fee_receiver: ContractAddress,
        ) {
            let mut store: Store = StoreTrait::new(self.world_storage());

            let existing_config = store.get_config(CONFIG_ID);
            assert!(existing_config.id == 0, "Starterpack: already initialized");

            assert!(protocol_fee <= MAX_PROTOCOL_FEE, "Starterpack: fee too high");
            assert!(fee_receiver.is_non_zero(), "Starterpack: invalid receiver");

            let config = ConfigTrait::new(CONFIG_ID, protocol_fee, fee_receiver);
            store.set_config(@config);
        }

        fn set_protocol_fee(ref self: ContractState, fee_percentage: u8) {
            let mut store: Store = StoreTrait::new(self.world_storage());

            let mut config = store.get_config(CONFIG_ID);
            config.assert_does_exist();

            config.set_protocol_fee(fee_percentage);
            store.set_config(@config);
        }
        
        fn set_fee_receiver(ref self: ContractState, receiver: ContractAddress) {
            let mut store: Store = StoreTrait::new(self.world_storage());

            let mut config = store.get_config(CONFIG_ID);
            config.assert_does_exist();

            config.set_fee_receiver(receiver);
            store.set_config(@config);
        }

        fn pause(ref self: ContractState, starterpack_id: u32) {
            let world = self.world_storage();
            self.registrable.pause(world, starterpack_id);
        }

        fn resume(ref self: ContractState, starterpack_id: u32) {
            let world = self.world_storage();
            self.registrable.resume(world, starterpack_id);
        }
    }

    #[abi(embed_v0)]
    impl StarterpackImpl of IStarterpack<ContractState> {
        fn quote(
            self: @ContractState,
            starterpack_id: u32,
            has_referrer: bool,
        ) -> StarterpackQuote {
            let world = self.world_storage();
            let mut store = StoreTrait::new(world);
            
            // Get starterpack details
            let starterpack = store.get_starterpack(starterpack_id);
            
            // Get config for protocol fee
            let config = store.get_config(CONFIG_ID);
            
            let base_price = starterpack.price;
            let payment_token = starterpack.payment_token;
            
            // Calculate referral fee if has_referrer
            let referral_fee = if has_referrer {
                base_price * starterpack.referral_percentage.into() / starterpack::constants::FEE_DENOMINATOR.into()
            } else {
                0
            };
            
            // Calculate protocol fee (added on top of base price)
            let protocol_fee = config.protocol_fee_amount(base_price);
            
            // Total cost = base price + protocol fee
            let total_cost = base_price + protocol_fee;
            
            StarterpackQuote {
                base_price,
                referral_fee,
                protocol_fee,
                total_cost,
                payment_token,
            }
        }

        fn register(ref self: ContractState, implementation: ContractAddress, referral_percentage: u8, reissuable: bool, soulbound: bool, price: u256, payment_token: ContractAddress, metadata: StarterPackMetadata) -> u32 {
            let world = self.world_storage();
            self.registrable.register(
                world,
                implementation,
                referral_percentage,
                reissuable,
                soulbound,
                price,
                payment_token,
                metadata.name,
                metadata.description,
                metadata.image_uri,
            )
        }

        fn issue(ref self: ContractState, recipient: ContractAddress, starterpack_id: u32, referrer: Option<ContractAddress>, referrer_group: Option<felt252>) {
            let world = self.world_storage();
            self.issuable.issue(world, recipient, starterpack_id, referrer, referrer_group);
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}