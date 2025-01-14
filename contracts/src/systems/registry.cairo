// Interfaces

#[starknet::interface]
trait IRegistry<TContractState> {
    fn register_game(
        ref self: TContractState,
        world_address: felt252,
        namespace: felt252,
        project: felt252,
        color: felt252,
        name: ByteArray,
        description: ByteArray,
        image: ByteArray,
        banner: ByteArray,
        discord: ByteArray,
        telegram: ByteArray,
        twitter: ByteArray,
        youtube: ByteArray,
        website: ByteArray,
    );
    fn update_game(
        ref self: TContractState,
        world_address: felt252,
        namespace: felt252,
        color: felt252,
        name: ByteArray,
        description: ByteArray,
        image: ByteArray,
        banner: ByteArray,
        discord: ByteArray,
        telegram: ByteArray,
        twitter: ByteArray,
        youtube: ByteArray,
        website: ByteArray,
    );
    fn publish_game(ref self: TContractState, world_address: felt252, namespace: felt252);
    fn hide_game(ref self: TContractState, world_address: felt252, namespace: felt252);
    fn whitelist_game(ref self: TContractState, world_address: felt252, namespace: felt252);
    fn blacklist_game(ref self: TContractState, world_address: felt252, namespace: felt252);
    fn remove_game(ref self: TContractState, world_address: felt252, namespace: felt252);
    fn register_achievement(
        ref self: TContractState,
        world_address: felt252,
        namespace: felt252,
        identifier: felt252,
        karma: u16,
    );
    fn update_achievement(
        ref self: TContractState,
        world_address: felt252,
        namespace: felt252,
        identifier: felt252,
        karma: u16,
    );
    fn publish_achievement(
        ref self: TContractState, world_address: felt252, namespace: felt252, identifier: felt252
    );
    fn hide_achievement(
        ref self: TContractState, world_address: felt252, namespace: felt252, identifier: felt252
    );
    fn whitelist_achievement(
        ref self: TContractState, world_address: felt252, namespace: felt252, identifier: felt252
    );
    fn blacklist_achievement(
        ref self: TContractState, world_address: felt252, namespace: felt252, identifier: felt252
    );
    fn remove_achievement(
        ref self: TContractState, world_address: felt252, namespace: felt252, identifier: felt252
    );
}

// Contracts

#[dojo::contract]
mod Registry {
    // Dojo imports

    use dojo::world::WorldStorage;

    // Component imports

    use registry::components::initializable::InitializableComponent;
    use registry::components::registerable::RegisterableComponent;
    use registry::components::trackable::TrackableComponent;

    // Internal imports

    use arcade::constants::NAMESPACE;

    // Local imports

    use super::IRegistry;

    // Components

    component!(path: InitializableComponent, storage: initializable, event: InitializableEvent);
    impl InitializableImpl = InitializableComponent::InternalImpl<ContractState>;
    component!(path: RegisterableComponent, storage: registerable, event: RegisterableEvent);
    impl RegisterableImpl = RegisterableComponent::InternalImpl<ContractState>;
    component!(path: TrackableComponent, storage: trackable, event: TrackableEvent);
    impl TrackableImpl = TrackableComponent::InternalImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        initializable: InitializableComponent::Storage,
        #[substorage(v0)]
        registerable: RegisterableComponent::Storage,
        #[substorage(v0)]
        trackable: TrackableComponent::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        InitializableEvent: InitializableComponent::Event,
        #[flat]
        RegisterableEvent: RegisterableComponent::Event,
        #[flat]
        TrackableEvent: TrackableComponent::Event,
    }

    // Constructor

    fn dojo_init(ref self: ContractState, owner: felt252) {
        self.initializable.initialize(self.world_storage(), owner);
    }

    // Implementations

    #[abi(embed_v0)]
    impl RegistryImpl of IRegistry<ContractState> {
        fn register_game(
            ref self: ContractState,
            world_address: felt252,
            namespace: felt252,
            project: felt252,
            color: felt252,
            name: ByteArray,
            description: ByteArray,
            image: ByteArray,
            banner: ByteArray,
            discord: ByteArray,
            telegram: ByteArray,
            twitter: ByteArray,
            youtube: ByteArray,
            website: ByteArray,
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
                    Option::Some(color),
                    Option::Some(name),
                    Option::Some(description),
                    Option::Some(image),
                    Option::Some(banner),
                    Option::Some(discord),
                    Option::Some(telegram),
                    Option::Some(twitter),
                    Option::Some(youtube),
                    Option::Some(website),
                )
        }

        fn update_game(
            ref self: ContractState,
            world_address: felt252,
            namespace: felt252,
            color: felt252,
            name: ByteArray,
            description: ByteArray,
            image: ByteArray,
            banner: ByteArray,
            discord: ByteArray,
            telegram: ByteArray,
            twitter: ByteArray,
            youtube: ByteArray,
            website: ByteArray,
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
                    Option::Some(color),
                    Option::Some(name),
                    Option::Some(description),
                    Option::Some(image),
                    Option::Some(banner),
                    Option::Some(discord),
                    Option::Some(telegram),
                    Option::Some(twitter),
                    Option::Some(youtube),
                    Option::Some(website),
                )
        }

        fn publish_game(ref self: ContractState, world_address: felt252, namespace: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.registerable.publish(world, caller, world_address, namespace);
        }

        fn hide_game(ref self: ContractState, world_address: felt252, namespace: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.registerable.hide(world, caller, world_address, namespace);
        }

        fn whitelist_game(ref self: ContractState, world_address: felt252, namespace: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.registerable.whitelist(world, caller, world_address, namespace);
        }

        fn blacklist_game(ref self: ContractState, world_address: felt252, namespace: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.registerable.blacklist(world, caller, world_address, namespace);
        }

        fn remove_game(ref self: ContractState, world_address: felt252, namespace: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.registerable.remove(world, caller, world_address, namespace);
        }

        fn register_achievement(
            ref self: ContractState,
            world_address: felt252,
            namespace: felt252,
            identifier: felt252,
            karma: u16,
        ) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.trackable.register(world, caller, world_address, namespace, identifier, karma)
        }

        fn update_achievement(
            ref self: ContractState,
            world_address: felt252,
            namespace: felt252,
            identifier: felt252,
            karma: u16,
        ) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.trackable.update(world, caller, world_address, namespace, identifier, karma)
        }

        fn publish_achievement(
            ref self: ContractState, world_address: felt252, namespace: felt252, identifier: felt252
        ) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.trackable.publish(world, caller, world_address, namespace, identifier);
        }

        fn hide_achievement(
            ref self: ContractState, world_address: felt252, namespace: felt252, identifier: felt252
        ) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.trackable.hide(world, caller, world_address, namespace, identifier);
        }

        fn whitelist_achievement(
            ref self: ContractState, world_address: felt252, namespace: felt252, identifier: felt252
        ) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.trackable.whitelist(world, caller, world_address, namespace, identifier);
        }

        fn blacklist_achievement(
            ref self: ContractState, world_address: felt252, namespace: felt252, identifier: felt252
        ) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.trackable.blacklist(world, caller, world_address, namespace, identifier);
        }

        fn remove_achievement(
            ref self: ContractState, world_address: felt252, namespace: felt252, identifier: felt252
        ) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.trackable.remove(world, caller, world_address, namespace, identifier);
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
