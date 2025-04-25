#[starknet::component]
pub mod RegisterableComponent {
    // Starknet imports

    use starknet::ContractAddress;

    // Dojo imports

    use dojo::world::WorldStorage;

    // External imports

    use collection::interface::{CollectionTraitDispatcher, CollectionTraitDispatcherTrait};

    // Internal imports

    use registry::constants::COLLECTION_ID;
    use registry::store::{Store, StoreTrait};
    use registry::models::access::{AccessAssert};
    use registry::models::game::{GameTrait, GameAssert};
    use registry::models::edition::{EditionTrait, EditionAssert};
    use registry::models::collection::{CollectionTrait, CollectionAssert};
    use registry::models::unicity::{UnicityTrait, UnicityAssert};
    use registry::types::config::{ConfigTrait};
    use registry::types::role::Role;
    use registry::types::metadata::Metadata;
    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn token_uri(
            self: @ComponentState<TContractState>, world: WorldStorage, token_id: u256,
        ) -> ByteArray {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Metadata exists
            match core::traits::TryInto::<u256, felt252>::try_into(token_id) {
                Option::Some(id) => {
                    let edition = store.get_edition(id);
                    if edition.world_address != Default::default() {
                        Metadata::uri(
                            edition.external_url,
                            edition.description,
                            edition.name,
                            edition.attributes,
                            edition.color,
                            edition.animation_url,
                            edition.youtube_url,
                            edition.image,
                        )
                    } else {
                        let game = store.get_game(id);
                        game.assert_does_exist();
                        Metadata::uri(
                            game.external_url,
                            game.description,
                            game.name,
                            game.attributes,
                            game.color,
                            game.animation_url,
                            game.youtube_url,
                            game.image,
                        )
                    }
                },
                Option::None => Default::default(),
            }
        }
    }

    #[generate_trait]
    pub impl InternalGameImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalGameTrait<TContractState> {
        fn register(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
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
        ) -> felt252 {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game does not exist
            let mut collection = store.get_collection(COLLECTION_ID);
            let game_id = collection.mint();
            let game = store.get_game(game_id);
            game.assert_does_not_exist();

            // [Effect] Create game
            let game = GameTrait::new(
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

            // [Effect] Update entities
            store.set_game(@game);
            store.set_collection(@collection);

            // [Interaction] Mint game
            self.mint(world, caller_id, game_id.into());

            // [Return] Game ID
            game_id
        }

        fn update(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
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
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game exists
            let mut game = store.get_game(game_id);
            game.assert_does_exist();

            // [Check] Caller is authorized
            self.assert_is_authorized(world, caller_id, game.id.into());

            // [Effect] Update metadata
            game
                .update(
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

            // [Effect] Update entities
            store.set_game(@game);

            // [Interaction] Update token metadata
            self.update_token_metadata(world, game.id.into());
        }

        fn publish(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
            game_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game exists
            let mut game = store.get_game(game_id);
            game.assert_does_exist();

            // [Check] Caller is owner
            self.assert_is_owner(world, caller_id, game.id.into());

            // [Effect] Publish game
            game.publish();

            // [Effect] Store game
            store.set_game(@game);
        }

        fn hide(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
            game_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game exists
            let mut game = store.get_game(game_id);
            game.assert_does_exist();

            // [Check] Caller is owner
            self.assert_is_owner(world, caller_id, game_id.into());

            // [Effect] Hide game
            game.hide();

            // [Effect] Store game
            store.set_game(@game);
        }

        fn whitelist(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
            game_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Caller is allowed
            let access = store.get_access(caller_id.into());
            access.assert_is_allowed(Role::Admin);

            // [Check] Game exists
            let mut game = store.get_game(game_id);
            game.assert_does_exist();

            // [Effect] Whitelist game
            game.whitelist();

            // [Effect] Store game
            store.set_game(@game);
        }

        fn blacklist(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
            game_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Caller is allowed
            let access = store.get_access(caller_id.into());
            access.assert_is_allowed(Role::Admin);

            // [Check] Game exists
            let mut game = store.get_game(game_id);
            game.assert_does_exist();

            // [Effect] Blacklist game
            game.blacklist();

            // [Effect] Store game
            store.set_game(@game);
        }

        fn remove(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
            game_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game exists
            let mut game = store.get_game(game_id);
            game.assert_does_exist();

            // [Check] Caller is owner
            self.assert_is_owner(world, caller_id, game.id.into());

            // [Interaction] Burn game
            self.burn(world, game.id.into());

            // [Effect] Remove game
            store.delete_game(ref game);
        }
    }

    #[generate_trait]
    pub impl InternalEditionImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalEditionTrait<TContractState> {
        fn register(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
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
        ) -> felt252 {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game exists
            let mut game = store.get_game(game_id);
            game.assert_does_exist();

            // [Check] Edition unicity
            let unicity = store.get_unicity(world_address.into(), namespace);
            unicity.assert_does_not_exist();

            // [Effect] Create edition
            let mut collection = store.get_collection(COLLECTION_ID);
            let edition_id = collection.mint();
            let config = ConfigTrait::new(project, rpc, policies);
            let edition = EditionTrait::new(
                edition_id,
                world_address.into(),
                namespace,
                game.id,
                config,
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

            // [Effect] Create unicity
            let unicity = UnicityTrait::new(world_address.into(), namespace, edition_id);

            // [Effect] Update entities
            store.set_unicity(@unicity);
            store.set_edition(@edition);
            store.set_collection(@collection);

            // [Interaction] Mint edition
            self.mint(world, caller_id, edition.id.into());

            // [Return] Edition ID
            edition_id
        }

        fn update(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
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
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Edition exists
            let mut edition = store.get_edition(edition_id);
            edition.assert_does_exist();

            // [Check] Caller is authorized
            self.assert_is_authorized(world, caller_id, edition.id.into());

            // [Effect] Update edition
            let config = ConfigTrait::new(project, rpc, policies);
            edition
                .update(
                    config,
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

            // [Effect] Update entities
            store.set_edition(@edition);

            // [Interaction] Update token metadata
            self.update_token_metadata(world, edition.id.into());
        }

        fn prioritize(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
            edition_id: felt252,
            priority: u8,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Edition exists
            let mut edition = store.get_edition(edition_id);
            edition.assert_does_exist();

            // [Check] Caller is game authorized
            self.assert_is_authorized(world, caller_id, edition.game_id.into());

            // [Effect] Prioritize edition
            edition.set_priority(priority);

            // [Effect] Store edition
            store.set_edition(@edition);
        }

        fn publish(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
            edition_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Edition exists
            let mut edition = store.get_edition(edition_id);
            edition.assert_does_exist();

            // [Check] Caller is edition owner
            self.assert_is_owner(world, caller_id, edition.id.into());

            // [Effect] Publish edition
            edition.publish();

            // [Effect] Store edition
            store.set_edition(@edition);
        }

        fn hide(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
            edition_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Edition exists
            let mut edition = store.get_edition(edition_id);
            edition.assert_does_exist();

            // [Check] Caller is edition owner
            self.assert_is_owner(world, caller_id, edition.id.into());

            // [Effect] Hide edition
            edition.hide();

            // [Effect] Store edition
            store.set_edition(@edition);
        }

        fn whitelist(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
            edition_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Edition exists
            let mut edition = store.get_edition(edition_id);
            edition.assert_does_exist();

            // [Check] Game exists
            let game = store.get_game(edition.game_id);
            game.assert_does_exist();

            // [Check] Caller is game authorized
            self.assert_is_authorized(world, caller_id, game.id.into());

            // [Effect] Whitelist edition
            edition.whitelist();

            // [Effect] Store edition
            store.set_edition(@edition);
        }

        fn blacklist(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
            edition_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Edition exists
            let mut edition = store.get_edition(edition_id);
            edition.assert_does_exist();

            // [Check] Game exists
            let game = store.get_game(edition.game_id);
            game.assert_does_exist();

            // [Check] Caller is game authorized
            self.assert_is_authorized(world, caller_id, game.id.into());

            // [Effect] Blacklist edition
            edition.blacklist();

            // [Effect] Store edition
            store.set_edition(@edition);
        }

        fn remove(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
            edition_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Edition exists
            let mut edition = store.get_edition(edition_id);
            edition.assert_does_exist();

            // [Check] Caller is owner
            self.assert_is_owner(world, caller_id, edition.id.into());

            // [Effect] Remove unicity
            let mut unicity = store.get_unicity(edition.world_address.into(), edition.namespace);
            store.delete_unicity(ref unicity);

            // [Effect] Remove edition
            store.delete_edition(ref edition);

            // [Interaction] Burn edition
            self.burn(world, edition.id.into());
        }
    }

    #[generate_trait]
    pub impl PrivateImpl<
        TContractState, +HasComponent<TContractState>,
    > of PrivateTrait<TContractState> {
        fn assert_is_owner(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
            token_id: u256,
        ) {
            let mut store: Store = StoreTrait::new(world);
            let collection = store.get_collection(COLLECTION_ID);
            let collection_dispatcher = CollectionTraitDispatcher {
                contract_address: collection.contract_address,
            };
            collection_dispatcher.assert_token_owner(caller_id, token_id);
        }

        fn assert_is_authorized(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
            token_id: u256,
        ) {
            let mut store: Store = StoreTrait::new(world);
            let collection = store.get_collection(COLLECTION_ID);
            let collection_dispatcher = CollectionTraitDispatcher {
                contract_address: collection.contract_address,
            };
            collection_dispatcher.assert_token_authorized(caller_id, token_id);
        }

        fn mint(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: ContractAddress,
            token_id: u256,
        ) {
            let mut store: Store = StoreTrait::new(world);
            let collection = store.get_collection(COLLECTION_ID);
            let collection_dispatcher = CollectionTraitDispatcher {
                contract_address: collection.contract_address,
            };
            collection_dispatcher.mint(caller_id, token_id);
        }

        fn burn(self: @ComponentState<TContractState>, world: WorldStorage, token_id: u256) {
            let mut store: Store = StoreTrait::new(world);
            let collection = store.get_collection(COLLECTION_ID);
            let collection_dispatcher = CollectionTraitDispatcher {
                contract_address: collection.contract_address,
            };
            collection_dispatcher.burn(token_id);
        }

        fn update_token_metadata(
            self: @ComponentState<TContractState>, world: WorldStorage, token_id: u256,
        ) {
            let mut store: Store = StoreTrait::new(world);
            let collection = store.get_collection(COLLECTION_ID);
            let collection_dispatcher = CollectionTraitDispatcher {
                contract_address: collection.contract_address,
            };
            collection_dispatcher.update_token_metadata(token_id);
        }
    }
}
