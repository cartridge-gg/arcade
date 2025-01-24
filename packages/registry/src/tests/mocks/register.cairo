#[starknet::interface]
trait IRegister<TContractState> {
    fn register(
        self: @TContractState,
        world_address: felt252,
        namespace: felt252,
        project: felt252,
        preset: felt252,
        color: Option<felt252>,
        name: Option<ByteArray>,
        description: Option<ByteArray>,
        image: Option<ByteArray>,
        banner: Option<ByteArray>,
        discord: Option<ByteArray>,
        telegram: Option<ByteArray>,
        twitter: Option<ByteArray>,
        youtube: Option<ByteArray>,
        website: Option<ByteArray>,
    );
    fn update(
        self: @TContractState,
        world_address: felt252,
        namespace: felt252,
        project: felt252,
        preset: felt252,
        color: Option<felt252>,
        name: Option<ByteArray>,
        description: Option<ByteArray>,
        image: Option<ByteArray>,
        banner: Option<ByteArray>,
        discord: Option<ByteArray>,
        telegram: Option<ByteArray>,
        twitter: Option<ByteArray>,
        youtube: Option<ByteArray>,
        website: Option<ByteArray>,
    );
    fn publish(self: @TContractState, world_address: felt252, namespace: felt252);
    fn hide(self: @TContractState, world_address: felt252, namespace: felt252);
    fn whitelist(self: @TContractState, world_address: felt252, namespace: felt252);
    fn blacklist(self: @TContractState, world_address: felt252, namespace: felt252);
}

#[dojo::contract]
pub mod Register {
    // Starknet imports

    use starknet::{ContractAddress, get_block_timestamp, get_contract_address};

    // Dojo imports

    use dojo::world::WorldStorage;
    use dojo::contract::{IContractDispatcher, IContractDispatcherTrait};

    // Internal imports

    use registry::components::initializable::InitializableComponent;
    use registry::components::registerable::RegisterableComponent;

    // Local imports

    use super::IRegister;

    // Components

    component!(path: InitializableComponent, storage: initializable, event: InitializableEvent);
    impl InitializableImpl = InitializableComponent::InternalImpl<ContractState>;
    component!(path: RegisterableComponent, storage: registerable, event: RegisterableEvent);
    impl RegisterableImpl = RegisterableComponent::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub initializable: InitializableComponent::Storage,
        #[substorage(v0)]
        pub registerable: RegisterableComponent::Storage
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        InitializableEvent: InitializableComponent::Event,
        #[flat]
        RegisterableEvent: RegisterableComponent::Event
    }

    fn dojo_init(self: @ContractState, owner: felt252) {
        self.initializable.initialize(self.world_storage(), owner);
    }

    #[abi(embed_v0)]
    impl RegisterImpl of IRegister<ContractState> {
        fn register(
            self: @ContractState,
            world_address: felt252,
            namespace: felt252,
            project: felt252,
            preset: felt252,
            color: Option<felt252>,
            name: Option<ByteArray>,
            description: Option<ByteArray>,
            image: Option<ByteArray>,
            banner: Option<ByteArray>,
            discord: Option<ByteArray>,
            telegram: Option<ByteArray>,
            twitter: Option<ByteArray>,
            youtube: Option<ByteArray>,
            website: Option<ByteArray>,
        ) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self
                .registerable
                .register(
                    world,
                    caller,
                    world_address,
                    namespace,
                    project,
                    preset,
                    color,
                    name,
                    description,
                    image,
                    banner,
                    discord,
                    telegram,
                    twitter,
                    youtube,
                    website
                );
        }

        fn update(
            self: @ContractState,
            world_address: felt252,
            namespace: felt252,
            project: felt252,
            preset: felt252,
            color: Option<felt252>,
            name: Option<ByteArray>,
            description: Option<ByteArray>,
            image: Option<ByteArray>,
            banner: Option<ByteArray>,
            discord: Option<ByteArray>,
            telegram: Option<ByteArray>,
            twitter: Option<ByteArray>,
            youtube: Option<ByteArray>,
            website: Option<ByteArray>,
        ) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self
                .registerable
                .update(
                    world,
                    caller,
                    world_address,
                    namespace,
                    project,
                    preset,
                    color,
                    name,
                    description,
                    image,
                    banner,
                    discord,
                    telegram,
                    twitter,
                    youtube,
                    website,
                );
        }

        fn publish(self: @ContractState, world_address: felt252, namespace: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.registerable.publish(world, caller, world_address, namespace);
        }

        fn hide(self: @ContractState, world_address: felt252, namespace: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.registerable.hide(world, caller, world_address, namespace);
        }

        fn whitelist(self: @ContractState, world_address: felt252, namespace: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.registerable.whitelist(world, caller, world_address, namespace);
        }

        fn blacklist(self: @ContractState, world_address: felt252, namespace: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.registerable.blacklist(world, caller, world_address, namespace);
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@"namespace")
        }
    }
}
