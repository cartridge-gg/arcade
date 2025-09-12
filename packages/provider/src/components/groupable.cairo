#[starknet::component]
pub mod GroupableComponent {
    // Dojo imports

    use dojo::world::WorldStorage;
    use provider::models::team::TeamAssert;
    use provider::models::teammate::{TeammateAssert, TeammateTrait};

    // Internal imports

    use provider::store::{Store, StoreTrait};
    use provider::types::role::Role;

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
        fn add(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            name: felt252,
            account_id: felt252,
            role: Role,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Team exists
            let team = store.get_team(name);
            team.assert_does_exist();

            // [Check] Caller is at least admin
            let callermate = store.get_teammate(name, team.time, caller_id);
            callermate.assert_is_allowed(Role::Admin);

            // [Check] Teammate does not exist
            let teammate = store.get_teammate(name, team.time, account_id);
            teammate.assert_does_not_exist();

            // [Effect] Create teammate
            let teammate = TeammateTrait::new(name, team.time, account_id, role);
            store.set_teammate(@teammate);
        }

        fn remove(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            name: felt252,
            account_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Team exists
            let team = store.get_team(name);
            team.assert_does_exist();

            // [Check] Caller is at least admin
            let callermate = store.get_teammate(name, team.time, caller_id);
            callermate.assert_is_allowed(Role::Admin);

            // [Check] Teammate exists
            let mut teammate = store.get_teammate(name, team.time, account_id);
            teammate.assert_does_exist();

            // [Check] Caller has greater role than teammate
            callermate.assert_is_greater(teammate.role.into());

            // [Effect] Delete teammate
            teammate.nullify();
            store.delete_teammate(@teammate);
        }
    }
}
