// Starknet imports

use starknet::ContractAddress;

// Interfaces

#[starknet::interface]
pub trait IRegistry<TContractState> {
    fn token_uri(self: @TContractState, token_id: u256) -> ByteArray;
    fn grant(ref self: TContractState, account: ContractAddress, role_id: u8);
    fn revoke(ref self: TContractState, account: ContractAddress);
    fn register_collection(ref self: TContractState, collection_address: ContractAddress);
    fn register_collection_admin(
        ref self: TContractState, collection_address: ContractAddress, collection_type: ByteArray,
    );
    fn associate_collection(
        ref self: TContractState, collection_address: ContractAddress, edition_id: felt252,
    );
    fn dissociate_collection(
        ref self: TContractState, collection_address: ContractAddress, edition_id: felt252,
    );
    fn register_game(
        ref self: TContractState,
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
        ref self: TContractState,
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
    fn publish_game(ref self: TContractState, game_id: felt252);
    fn hide_game(ref self: TContractState, game_id: felt252);
    fn whitelist_game(ref self: TContractState, game_id: felt252);
    fn blacklist_game(ref self: TContractState, game_id: felt252);
    fn remove_game(ref self: TContractState, game_id: felt252);
    fn register_edition(
        ref self: TContractState,
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
        ref self: TContractState,
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
    fn prioritize_edition(ref self: TContractState, edition_id: felt252, priority: u8);
    fn publish_edition(ref self: TContractState, edition_id: felt252);
    fn hide_edition(ref self: TContractState, edition_id: felt252);
    fn whitelist_edition(ref self: TContractState, edition_id: felt252);
    fn blacklist_edition(ref self: TContractState, edition_id: felt252);
    fn remove_edition(ref self: TContractState, edition_id: felt252);
}

// Contracts

#[dojo::contract]
pub mod Registry {
    // Starknet imports

    // Internal imports

    use arcade::constants::NAMESPACE;

    // Dojo imports

    use dojo::world::WorldStorage;

    // External imports

    use openzeppelin_introspection::interface::{ISRC5Dispatcher, ISRC5DispatcherTrait};
    use openzeppelin_token::erc1155::interface::IERC1155_ID;
    use openzeppelin_token::erc721::interface::IERC721_ID;

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
    impl RegisterableCollectionImpl = RegisterableComponent::InternalCollectionImpl<ContractState>;
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
            RegisterableImpl::token_uri(self: self.registerable, world: world, token_id: token_id)
        }

        fn grant(ref self: ContractState, account: ContractAddress, role_id: u8) {
            let world = self.world_storage();
            RegisterableImpl::grant_role(
                self: @self.registerable, world: world, account: account, role_id: role_id,
            );
        }

        fn revoke(ref self: ContractState, account: ContractAddress) {
            let world = self.world_storage();
            RegisterableImpl::revoke_role(self: @self.registerable, world: world, account: account);
        }

        fn register_collection(ref self: ContractState, collection_address: ContractAddress) {
            let world = self.world_storage();

            let src5_dispatcher = ISRC5Dispatcher { contract_address: collection_address };
            let contract_type: ByteArray = if src5_dispatcher.supports_interface(IERC1155_ID) {
                "ERC1155"
            } else if src5_dispatcher.supports_interface(IERC721_ID) {
                "ERC721"
            } else {
                match starknet::syscalls::call_contract_syscall(
                    collection_address, selector!("decimals"), [].span(),
                ) {
                    Result::Ok(_) => "ERC20",
                    Result::Err(_) => panic!("Unsupported collection"),
                }
            };

            let instance_name: felt252 = collection_address.into();
            RegisterableCollectionImpl::register(
                self: @self.registerable,
                world: world,
                collection_address: collection_address,
                namespace: NAMESPACE(),
                contract_type: contract_type,
                instance_name: format!("{}", instance_name),
            );
        }

        fn register_collection_admin(
            ref self: ContractState,
            collection_address: ContractAddress,
            collection_type: ByteArray,
        ) {
            let world = self.world_storage();
            let instance_name: felt252 = collection_address.into();
            RegisterableCollectionImpl::register_admin(
                self: @self.registerable,
                world: world,
                collection_address: collection_address,
                namespace: NAMESPACE(),
                contract_type: collection_type,
                instance_name: format!("{}", instance_name),
            );
        }

        fn associate_collection(
            ref self: ContractState, collection_address: ContractAddress, edition_id: felt252,
        ) {
            let world = self.world_storage();
            RegisterableCollectionImpl::associate(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                collection_address: collection_address,
                edition_id: edition_id,
            );
        }

        fn dissociate_collection(
            ref self: ContractState, collection_address: ContractAddress, edition_id: felt252,
        ) {
            let world = self.world_storage();
            RegisterableCollectionImpl::dissociate(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                collection_address: collection_address,
                edition_id: edition_id,
            );
        }

        fn register_game(
            ref self: ContractState,
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
                self: @self.registerable,
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
                self: @self.registerable,
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
            ref self: ContractState,
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
            RegisterableGameImpl::update(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                game_id: game_id,
                color: color,
                image: image,
                image_data: image_data,
                external_url: external_url,
                description: description,
                name: name,
                attributes: attributes,
                animation_url: animation_url,
                youtube_url: youtube_url,
                properties: properties,
                socials: socials,
            );
        }

        fn publish_game(ref self: ContractState, game_id: felt252) {
            let world = self.world_storage();
            RegisterableGameImpl::publish(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                game_id: game_id,
            );
        }

        fn hide_game(ref self: ContractState, game_id: felt252) {
            let world = self.world_storage();
            RegisterableGameImpl::hide(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                game_id: game_id,
            );
        }

        fn whitelist_game(ref self: ContractState, game_id: felt252) {
            let world = self.world_storage();
            RegisterableGameImpl::whitelist(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                game_id: game_id,
            );
        }

        fn blacklist_game(ref self: ContractState, game_id: felt252) {
            let world = self.world_storage();
            RegisterableGameImpl::blacklist(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                game_id: game_id,
            );
        }

        fn remove_game(ref self: ContractState, game_id: felt252) {
            let world = self.world_storage();
            RegisterableGameImpl::remove(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                game_id: game_id,
            );
        }

        fn register_edition(
            ref self: ContractState,
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
            RegisterableEditionImpl::register(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                world_address: world_address,
                namespace: namespace,
                game_id: game_id,
                project: project,
                rpc: rpc,
                policies: policies,
                color: color,
                image: image,
                image_data: image_data,
                external_url: external_url,
                description: description,
                name: name,
                attributes: attributes,
                animation_url: animation_url,
                youtube_url: youtube_url,
                properties: properties,
                socials: socials,
            );
        }

        fn update_edition(
            ref self: ContractState,
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
            RegisterableEditionImpl::update(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                edition_id: edition_id,
                project: project,
                rpc: rpc,
                policies: policies,
                color: color,
                image: image,
                image_data: image_data,
                external_url: external_url,
                description: description,
                name: name,
                attributes: attributes,
                animation_url: animation_url,
                youtube_url: youtube_url,
                properties: properties,
                socials: socials,
            );
        }

        fn prioritize_edition(ref self: ContractState, edition_id: felt252, priority: u8) {
            let world = self.world_storage();
            RegisterableEditionImpl::prioritize(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                edition_id: edition_id,
                priority: priority,
            );
        }

        fn publish_edition(ref self: ContractState, edition_id: felt252) {
            let world = self.world_storage();
            RegisterableEditionImpl::publish(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                edition_id: edition_id,
            );
        }

        fn hide_edition(ref self: ContractState, edition_id: felt252) {
            let world = self.world_storage();
            RegisterableEditionImpl::hide(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                edition_id: edition_id,
            );
        }

        fn whitelist_edition(ref self: ContractState, edition_id: felt252) {
            let world = self.world_storage();
            RegisterableEditionImpl::whitelist(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                edition_id: edition_id,
            );
        }

        fn blacklist_edition(ref self: ContractState, edition_id: felt252) {
            let world = self.world_storage();
            RegisterableEditionImpl::blacklist(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                edition_id: edition_id,
            );
        }

        fn remove_edition(ref self: ContractState, edition_id: felt252) {
            let world = self.world_storage();
            RegisterableEditionImpl::remove(
                self: @self.registerable,
                world: world,
                caller_id: get_caller_address(),
                edition_id: edition_id,
            );
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
