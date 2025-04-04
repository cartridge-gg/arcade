#[starknet::component]
pub mod TrackableComponent {
    // Dojo imports

    use dojo::world::WorldStorage;

    // Internal imports

    use registry::store::{Store, StoreTrait};
    use registry::models::access::{AccessAssert};
    use registry::models::achievement::{AchievementTrait, AchievementAssert};
    use registry::models::game::{GameTrait, GameAssert};
    use registry::types::role::Role;

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
        fn register(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            world_address: felt252,
            namespace: felt252,
            identifier: felt252,
            points: u16,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game exists
            let mut game = store.get_game(world_address, namespace);
            game.assert_does_exist();

            // [Check] Caller is owner
            game.assert_is_owner(caller_id);

            // [Check] Achievement does not exist
            let achievement = store.get_achievement(world_address, namespace, identifier);
            achievement.assert_does_not_exist();

            // [Effect] Create achievement
            let achievement = AchievementTrait::new(world_address, namespace, identifier, points);

            // [Effect] Add achievement to game
            game.add(achievement.points);

            // [Effect] Store entities
            store.set_achievement(@achievement);
            store.set_game(@game);
        }

        fn update(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            world_address: felt252,
            namespace: felt252,
            identifier: felt252,
            points: u16,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game exists
            let mut game = store.get_game(world_address, namespace);
            game.assert_does_exist();

            // [Check] Caller is owner
            game.assert_is_owner(caller_id);

            // [Check] Achievement exists
            let mut achievement = store.get_achievement(world_address, namespace, identifier);
            achievement.assert_does_exist();

            // [Effect] Update achievement and game
            game.remove(achievement.points);
            achievement.update(points);
            game.add(achievement.points);

            // [Effect] Update entities
            store.set_achievement(@achievement);
            store.set_game(@game);
        }

        fn publish(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            world_address: felt252,
            namespace: felt252,
            identifier: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game exists
            let mut game = store.get_game(world_address, namespace);
            game.assert_does_exist();

            // [Check] Caller is owner
            game.assert_is_owner(caller_id);

            // [Check] Achievement exists
            let mut achievement = store.get_achievement(world_address, namespace, identifier);
            achievement.assert_does_exist();

            // [Effect] Publish achievement
            achievement.publish();

            // [Effect] Store achievement
            store.set_achievement(@achievement);
        }

        fn hide(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            world_address: felt252,
            namespace: felt252,
            identifier: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game exists
            let mut game = store.get_game(world_address, namespace);
            game.assert_does_exist();

            // [Check] Caller is owner
            game.assert_is_owner(caller_id);

            // [Check] Achievement exists
            let mut achievement = store.get_achievement(world_address, namespace, identifier);
            achievement.assert_does_exist();

            // [Effect] Hide achievement
            achievement.hide();

            // [Effect] Store achievement
            store.set_achievement(@achievement);
        }

        fn whitelist(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            world_address: felt252,
            namespace: felt252,
            identifier: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Caller is allowed
            let access = store.get_access(caller_id);
            access.assert_is_allowed(Role::Admin);

            // [Check] Game exists
            let mut game = store.get_game(world_address, namespace);
            game.assert_does_exist();

            // [Check] Achievement exists
            let mut achievement = store.get_achievement(world_address, namespace, identifier);
            achievement.assert_does_exist();

            // [Effect] Whitelist achievement
            achievement.whitelist();

            // [Effect] Store achievement
            store.set_achievement(@achievement);
        }

        fn blacklist(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            world_address: felt252,
            namespace: felt252,
            identifier: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Caller is allowed
            let access = store.get_access(caller_id);
            access.assert_is_allowed(Role::Admin);

            // [Check] Game exists
            let mut game = store.get_game(world_address, namespace);
            game.assert_does_exist();

            // [Check] Achievement exists
            let mut achievement = store.get_achievement(world_address, namespace, identifier);
            achievement.assert_does_exist();

            // [Effect] Blacklist achievement
            achievement.blacklist();

            // [Effect] Store achievement
            store.set_achievement(@achievement);
        }

        fn remove(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            world_address: felt252,
            namespace: felt252,
            identifier: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Game exists
            let mut game = store.get_game(world_address, namespace);
            game.assert_does_exist();

            // [Check] Caller is owner
            game.assert_is_owner(caller_id);

            // [Check] Achievement exists
            let mut achievement = store.get_achievement(world_address, namespace, identifier);
            achievement.assert_does_exist();

            // [Effect] Remove achievement
            game.remove(achievement.points);
            achievement.nullify();

            // [Effect] Store entities
            store.delete_achievement(@achievement);
            store.set_game(@game);
        }
    }
}
