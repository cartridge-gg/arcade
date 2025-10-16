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
    fn grant_role(ref self: TContractState, account: ContractAddress, role_id: u8);
    fn revoke_role(ref self: TContractState, account: ContractAddress);
    fn set_protocol_fee(ref self: TContractState, fee_percentage: u8);
    fn set_fee_receiver(ref self: TContractState, receiver: ContractAddress);
}


#[starknet::interface]
pub trait IStarterpackRegistry<TContractState> {
    fn quote(self: @TContractState, starterpack_id: u32, has_referrer: bool) -> StarterpackQuote;
    fn register(
        ref self: TContractState,
        implementation: ContractAddress,
        referral_percentage: u8,
        reissuable: bool,
        price: u256,
        payment_token: ContractAddress,
        metadata: StarterPackMetadata,
    ) -> u32; // returns starterpack_id

    fn update(
        ref self: TContractState,
        starterpack_id: u32,
        implementation: ContractAddress,
        referral_percentage: u8,
        reissuable: bool,
        price: u256,
        payment_token: ContractAddress,
        metadata: StarterPackMetadata,
    );

    fn pause(ref self: TContractState, starterpack_id: u32);

    fn resume(ref self: TContractState, starterpack_id: u32);

    fn issue(
        ref self: TContractState,
        recipient: ContractAddress,
        starterpack_id: u32,
        referrer: Option<ContractAddress>,
        referrer_group: Option<felt252>,
    );
}


#[dojo::contract]
pub mod StarterpackRegistry {
    use arcade::constants::NAMESPACE;
    use dojo::world::WorldStorage;
    use starknet::ContractAddress;

    // Component imports
    use starterpack::components::initializable::InitializableComponent;
    use starterpack::components::issuable::IssuableComponent;
    use starterpack::components::manageable::ManageableComponent;
    use starterpack::components::registrable::RegistrableComponent;
    use starterpack::constants::CONFIG_ID;
    use starterpack::models::config::ConfigTrait;
    use starterpack::store::{ConfigStoreTrait, StarterpackStoreTrait, StoreTrait};
    use super::{IAdministration, IStarterpackRegistry, StarterPackMetadata, StarterpackQuote};

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
    impl StarterpackImpl of IStarterpackRegistry<ContractState> {
        fn quote(
            self: @ContractState, starterpack_id: u32, has_referrer: bool,
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

        fn register(
            ref self: ContractState,
            implementation: ContractAddress,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
            metadata: StarterPackMetadata,
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
                    metadata.name,
                    metadata.description,
                    metadata.image_uri,
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
            metadata: StarterPackMetadata,
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
                    metadata.name,
                    metadata.description,
                    metadata.image_uri,
                );
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
            referrer: Option<ContractAddress>,
            referrer_group: Option<felt252>,
        ) {
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
