// Starknet imports

use starknet::ContractAddress;

#[starknet::interface]
pub trait IRegister<TContractState> {
    fn token_uri(self: @TContractState, token_id: u256) -> ByteArray;
    fn register_game(
        self: @TContractState,
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

#[dojo::contract]
pub mod Register {
    // Starknet imports

    use starknet::{ContractAddress, ClassHash};
    use starknet::get_caller_address;

    // Dojo imports

    use dojo::world::WorldStorage;

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
    impl RegisterableGameImpl = RegisterableComponent::InternalGameImpl<ContractState>;
    impl RegisterableEditionImpl = RegisterableComponent::InternalEditionImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub initializable: InitializableComponent::Storage,
        #[substorage(v0)]
        pub registerable: RegisterableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        InitializableEvent: InitializableComponent::Event,
        #[flat]
        RegisterableEvent: RegisterableComponent::Event,
    }

    fn dojo_init(self: @ContractState, owner: ContractAddress, class_hash: ClassHash) {
        self.initializable.initialize(self.world_storage(), owner, class_hash);
    }

    #[abi(embed_v0)]
    impl RegisterImpl of IRegister<ContractState> {
        fn token_uri(self: @ContractState, token_id: u256) -> ByteArray {
            let world = self.world_storage();
            RegisterableImpl::token_uri(self.registerable, world, token_id)
        }

        fn register_game(
            self: @ContractState,
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
            RegisterableGameImpl::register(
                self.registerable,
                world,
                caller,
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
            self.world(@"namespace")
        }
    }
}
