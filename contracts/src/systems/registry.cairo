// Starknet imports

use starknet::ContractAddress;

// Interfaces

#[starknet::interface]
pub trait IRegistry<TContractState> {
    fn token_uri(self: @TContractState, token_id: u256) -> ByteArray;
    fn grant(
        ref self: TContractState,
        world_address: ContractAddress,
        account: ContractAddress,
        role_id: u8,
    );
    fn revoke(ref self: TContractState, world_address: ContractAddress, account: ContractAddress);
    fn register_game(
        self: @TContractState,
        world_address: ContractAddress,
        namespace: felt252,
        project: ByteArray,
        rpc: ByteArray,
        policies: ByteArray,
        color: ByteArray,
        game_image: ByteArray,
        edition_image: ByteArray,
        external_url: ByteArray,
        description: ByteArray,
        game_name: ByteArray,
        edition_name: ByteArray,
        game_attributes: ByteArray,
        edition_attributes: ByteArray,
        animation_url: ByteArray,
        youtube_url: ByteArray,
        properties: ByteArray,
        game_socials: ByteArray,
        edition_socials: ByteArray,
    );
    fn update_game(
        self: @TContractState,
        game_id: felt252,
        color: ByteArray,
        image: ByteArray,
        image_data: ByteArray,
        external_url: ByteArray,
        description: ByteArray,
        name: ByteArray,
        attributes: ByteArray,
        animation_url: ByteArray,
        youtube_url: ByteArray,
        properties: ByteArray,
        socials: ByteArray,
    );
    fn publish_game(self: @TContractState, game_id: felt252);
    fn hide_game(self: @TContractState, game_id: felt252);
    fn whitelist_game(self: @TContractState, game_id: felt252);
    fn blacklist_game(self: @TContractState, game_id: felt252);
    fn remove_game(self: @TContractState, game_id: felt252);
    fn register_edition(
        self: @TContractState,
        world_address: ContractAddress,
        namespace: felt252,
        game_id: felt252,
        project: ByteArray,
        rpc: ByteArray,
        policies: ByteArray,
        color: ByteArray,
        image: ByteArray,
        image_data: ByteArray,
        external_url: ByteArray,
        description: ByteArray,
        name: ByteArray,
        attributes: ByteArray,
        animation_url: ByteArray,
        youtube_url: ByteArray,
        properties: ByteArray,
        socials: ByteArray,
    );
    fn update_edition(
        self: @TContractState,
        edition_id: felt252,
        project: ByteArray,
        rpc: ByteArray,
        policies: ByteArray,
        color: ByteArray,
        image: ByteArray,
        image_data: ByteArray,
        external_url: ByteArray,
        description: ByteArray,
        name: ByteArray,
        attributes: ByteArray,
        animation_url: ByteArray,
        youtube_url: ByteArray,
        properties: ByteArray,
        socials: ByteArray,
    );
    fn prioritize_edition(self: @TContractState, edition_id: felt252, priority: u8);
    fn publish_edition(self: @TContractState, edition_id: felt252);
    fn hide_edition(self: @TContractState, edition_id: felt252);
    fn whitelist_edition(self: @TContractState, edition_id: felt252);
    fn blacklist_edition(self: @TContractState, edition_id: felt252);
    fn remove_edition(self: @TContractState, edition_id: felt252);
}

// Contracts

#[dojo::contract]
pub mod Registry {
    // Starknet imports

    // Internal imports

    use arcade::constants::NAMESPACE;

    // Dojo imports

    use dojo::world::WorldStorage;

    // Component imports

    use registry::components::initializable::InitializableComponent;
    use registry::components::registerable::RegisterableComponent;
    use starknet::{ClassHash, ContractAddress, get_caller_address};

    // Local imports

    use super::IRegistry;

    // Components

    component!(path: InitializableComponent, storage: initializable, event: InitializableEvent);
    impl InitializableImpl = InitializableComponent::InternalImpl<ContractState>;
    component!(path: RegisterableComponent, storage: registerable, event: RegisterableEvent);
    impl RegisterableImpl = RegisterableComponent::InternalImpl<ContractState>;
    impl RegisterableGameImpl = RegisterableComponent::InternalGameImpl<ContractState>;
    impl RegisterableEditionImpl = RegisterableComponent::InternalEditionImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        initializable: InitializableComponent::Storage,
        #[substorage(v0)]
        registerable: RegisterableComponent::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        InitializableEvent: InitializableComponent::Event,
        #[flat]
        RegisterableEvent: RegisterableComponent::Event,
    }

    // Constructor

    fn dojo_init(ref self: ContractState, owner: ContractAddress, class_hash: ClassHash) {
        self.initializable.initialize(self.world_storage(), owner, class_hash);
    }

    // Implementations

    #[abi(embed_v0)]
    impl RegistryImpl of IRegistry<ContractState> {
        fn token_uri(self: @ContractState, token_id: u256) -> ByteArray {
            let world = self.world_storage();
            RegisterableImpl::token_uri(self.registerable, world, token_id)
        }

        fn grant(
            ref self: ContractState,
            world_address: ContractAddress,
            account: ContractAddress,
            role_id: u8,
        ) {
            let world = self.world_storage();
            RegisterableImpl::grant_role(@self.registerable, world, account, role_id);
        }

        fn revoke(
            ref self: ContractState, world_address: ContractAddress, account: ContractAddress,
        ) {
            let world = self.world_storage();
            RegisterableImpl::revoke_role(@self.registerable, world, account);
        }

        fn register_game(
            self: @ContractState,
            world_address: ContractAddress,
            namespace: felt252,
            project: ByteArray,
            rpc: ByteArray,
            policies: ByteArray,
            color: ByteArray,
            game_image: ByteArray,
            edition_image: ByteArray,
            external_url: ByteArray,
            description: ByteArray,
            game_name: ByteArray,
            edition_name: ByteArray,
            game_attributes: ByteArray,
            edition_attributes: ByteArray,
            animation_url: ByteArray,
            youtube_url: ByteArray,
            properties: ByteArray,
            game_socials: ByteArray,
            edition_socials: ByteArray,
        ) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            // [Effect] Register game
            let game_id = RegisterableGameImpl::register(
                self: self.registerable,
                world: world,
                caller_id: caller,
                color: color.clone(),
                image: game_image.clone(),
                image_data: "",
                external_url: external_url.clone(),
                description: description.clone(),
                name: game_name,
                attributes: game_attributes,
                animation_url: animation_url.clone(),
                youtube_url: youtube_url.clone(),
                properties: properties.clone(),
                socials: game_socials,
            );
            // [Effect] Register edition
            RegisterableEditionImpl::register(
                self: self.registerable,
                world: world,
                caller_id: caller,
                world_address: world_address,
                namespace: namespace,
                game_id: game_id,
                project: project,
                rpc: rpc,
                policies: policies,
                color: color,
                image: edition_image,
                image_data: "",
                external_url: external_url,
                description: description,
                name: edition_name,
                attributes: edition_attributes,
                animation_url: animation_url,
                youtube_url: youtube_url,
                properties: properties,
                socials: edition_socials,
            );
        }

        fn update_game(
            self: @ContractState,
            game_id: felt252,
            color: ByteArray,
            image: ByteArray,
            image_data: ByteArray,
            external_url: ByteArray,
            description: ByteArray,
            name: ByteArray,
            attributes: ByteArray,
            animation_url: ByteArray,
            youtube_url: ByteArray,
            properties: ByteArray,
            socials: ByteArray,
        ) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            RegisterableGameImpl::update(
                self.registerable,
                world,
                caller,
                game_id,
                color,
                image,
                image_data,
                external_url,
                description,
                name,
                attributes,
                animation_url,
                youtube_url,
                properties,
                socials,
            );
        }

        fn publish_game(self: @ContractState, game_id: felt252) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            RegisterableGameImpl::publish(self.registerable, world, caller, game_id);
        }

        fn hide_game(self: @ContractState, game_id: felt252) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            RegisterableGameImpl::hide(self.registerable, world, caller, game_id);
        }

        fn whitelist_game(self: @ContractState, game_id: felt252) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            RegisterableGameImpl::whitelist(self.registerable, world, caller, game_id);
        }

        fn blacklist_game(self: @ContractState, game_id: felt252) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            RegisterableGameImpl::blacklist(self.registerable, world, caller, game_id);
        }

        fn remove_game(self: @ContractState, game_id: felt252) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            RegisterableGameImpl::remove(self.registerable, world, caller, game_id);
        }

        fn register_edition(
            self: @ContractState,
            world_address: ContractAddress,
            namespace: felt252,
            game_id: felt252,
            project: ByteArray,
            rpc: ByteArray,
            policies: ByteArray,
            color: ByteArray,
            image: ByteArray,
            image_data: ByteArray,
            external_url: ByteArray,
            description: ByteArray,
            name: ByteArray,
            attributes: ByteArray,
            animation_url: ByteArray,
            youtube_url: ByteArray,
            properties: ByteArray,
            socials: ByteArray,
        ) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            RegisterableEditionImpl::register(
                self.registerable,
                world,
                caller,
                world_address,
                namespace,
                game_id,
                project,
                rpc,
                policies,
                color,
                image,
                image_data,
                external_url,
                description,
                name,
                attributes,
                animation_url,
                youtube_url,
                properties,
                socials,
            );
        }

        fn update_edition(
            self: @ContractState,
            edition_id: felt252,
            project: ByteArray,
            rpc: ByteArray,
            policies: ByteArray,
            color: ByteArray,
            image: ByteArray,
            image_data: ByteArray,
            external_url: ByteArray,
            description: ByteArray,
            name: ByteArray,
            attributes: ByteArray,
            animation_url: ByteArray,
            youtube_url: ByteArray,
            properties: ByteArray,
            socials: ByteArray,
        ) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            RegisterableEditionImpl::update(
                self.registerable,
                world,
                caller,
                edition_id,
                project,
                rpc,
                policies,
                color,
                image,
                image_data,
                external_url,
                description,
                name,
                attributes,
                animation_url,
                youtube_url,
                properties,
                socials,
            );
        }

        fn prioritize_edition(self: @ContractState, edition_id: felt252, priority: u8) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            RegisterableEditionImpl::prioritize(
                self.registerable, world, caller, edition_id, priority,
            );
        }

        fn publish_edition(self: @ContractState, edition_id: felt252) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            RegisterableEditionImpl::publish(self.registerable, world, caller, edition_id);
        }

        fn hide_edition(self: @ContractState, edition_id: felt252) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            RegisterableEditionImpl::hide(self.registerable, world, caller, edition_id);
        }

        fn whitelist_edition(self: @ContractState, edition_id: felt252) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            RegisterableEditionImpl::whitelist(self.registerable, world, caller, edition_id);
        }

        fn blacklist_edition(self: @ContractState, edition_id: felt252) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            RegisterableEditionImpl::blacklist(self.registerable, world, caller, edition_id);
        }

        fn remove_edition(self: @ContractState, edition_id: felt252) {
            let world = self.world_storage();
            let caller: ContractAddress = get_caller_address();
            RegisterableEditionImpl::remove(self.registerable, world, caller, edition_id);
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
