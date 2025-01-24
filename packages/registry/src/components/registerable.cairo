#[starknet::component]
mod RegisterableComponent {
    // Dojo imports

    use dojo::world::WorldStorage;

    // Internal imports

    use registry::store::{Store, StoreTrait};
    use registry::models::access::{Access, AccessTrait, AccessAssert};
    use registry::models::game::{Game, GameTrait, GameAssert};
    use registry::types::metadata::{Metadata, MetadataTrait};
    use registry::types::socials::{Socials, SocialsTrait};
    use registry::types::role::Role;

    // Storage

    #[storage]
    struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {}

    #[generate_trait]
    impl InternalImpl<
        TContractState, +HasComponent<TContractState>
    > of InternalTrait<TContractState> {
        fn register(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
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
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game does not exist
            let game = store.get_game(world_address, namespace);
            game.assert_does_not_exist();

            // [Effect] Create game
            let metadata = MetadataTrait::new(color, name, description, image, banner);
            let socials = SocialsTrait::new(discord, telegram, twitter, youtube, website);
            let game = GameTrait::new(
                world_address, namespace, project, preset, metadata, socials, caller_id
            );

            // [Effect] Store game
            store.set_game(@game);
        }

        fn update(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
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
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game exists
            let mut game = store.get_game(world_address, namespace);
            game.assert_does_exist();

            // [Check] Caller is owner
            game.assert_is_owner(caller_id);

            // [Effect] Update game
            let metadata = MetadataTrait::new(color, name, description, image, banner);
            let socials = SocialsTrait::new(discord, telegram, twitter, youtube, website);
            game.update(project, preset, metadata, socials);

            // [Effect] Update game
            store.set_game(@game);
        }

        fn publish(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            world_address: felt252,
            namespace: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game exists
            let mut game = store.get_game(world_address, namespace);
            game.assert_does_exist();

            // [Check] Caller is owner
            game.assert_is_owner(caller_id);

            // [Effect] Publish game
            game.publish();

            // [Effect] Store game
            store.set_game(@game);
        }

        fn hide(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            world_address: felt252,
            namespace: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game exists
            let mut game = store.get_game(world_address, namespace);
            game.assert_does_exist();

            // [Check] Caller is owner
            game.assert_is_owner(caller_id);

            // [Effect] Hide game
            game.hide();

            // [Effect] Store game
            store.set_game(@game);
        }

        fn whitelist(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            world_address: felt252,
            namespace: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Caller is allowed
            let access = store.get_access(caller_id);
            access.assert_is_allowed(Role::Admin);

            // [Check] Game exists
            let mut game = store.get_game(world_address, namespace);
            game.assert_does_exist();

            // [Effect] Whitelist game
            game.whitelist();

            // [Effect] Store game
            store.set_game(@game);
        }

        fn blacklist(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            world_address: felt252,
            namespace: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Caller is allowed
            let access = store.get_access(caller_id);
            access.assert_is_allowed(Role::Admin);

            // [Check] Game exists
            let mut game = store.get_game(world_address, namespace);
            game.assert_does_exist();

            // [Effect] Blacklist game
            game.blacklist();

            // [Effect] Store game
            store.set_game(@game);
        }

        fn remove(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            world_address: felt252,
            namespace: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game exists
            let mut game = store.get_game(world_address, namespace);
            game.assert_does_exist();

            // [Check] Caller is owner
            game.assert_is_owner(caller_id);

            // [Effect] Remove game
            game.nullify();

            // [Effect] Store game
            store.delete_game(@game);
        }
    }
}
