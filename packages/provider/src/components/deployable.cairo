#[starknet::component]
pub mod DeployableComponent {
    // Dojo imports

    use dojo::world::WorldStorage;
    use provider::models::deployment::{DeploymentAssert, DeploymentTrait};
    use provider::models::factory::{FactoryAssert, FactoryTrait};
    use provider::models::team::{TeamAssert, TeamTrait};
    use provider::models::teammate::{TeammateAssert, TeammateTrait};

    // Internal imports

    use provider::store::{Store, StoreTrait};
    use provider::types::role::Role;
    use provider::types::service::{SERVICE_COUNT, Service, ServiceTrait};
    use provider::types::tier::Tier;

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
        fn initialize(self: @ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);
            // [Effect] Create every service factories
            let mut index = SERVICE_COUNT;
            while index > 0 {
                let service: Service = index.into();
                let version = service.version();
                let factory = FactoryTrait::new(service, version, version);
                store.set_factory(@factory);
                index -= 1;
            }
        }

        fn deploy(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            service: Service,
            project: felt252,
            tier: Tier,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Factory exists
            let factory = store.get_factory(service.into());
            factory.assert_does_exist();

            // [Check] Deployment does not exist
            let deployment = store.get_deployment(service.into(), project);
            deployment.assert_does_not_exist();

            // [Check] Caller permission
            let mut team = store.get_team(project);
            if team.exists() {
                // [Check] Caller is at least an admin
                let teammate = store.get_teammate(project, team.time, caller_id);
                teammate.assert_is_allowed(Role::Admin);
                // [Effect] Increment deployment count
                team.deploy();
                store.set_team(@team);
            } else {
                // [Effect] Create team
                let time = starknet::get_block_timestamp();
                let mut team = TeamTrait::new(project, time, project, "");
                team.deploy();
                store.set_team(@team);
                // [Effect] Create teammate
                let teammate = TeammateTrait::new(project, time, caller_id, Role::Owner);
                store.set_teammate(@teammate);
            }

            // [Effect] Create deployment
            let deployment = DeploymentTrait::new(
                service: service, project: project, tier: tier, config: "",
            );
            store.set_deployment(@deployment);
        }

        fn remove(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            caller_id: felt252,
            service: Service,
            project: felt252,
        ) {
            // [Setup] Datastore
            let mut store: Store = StoreTrait::new(world);

            // [Check] Factory exists
            let factory = store.get_factory(service.into());
            factory.assert_does_exist();

            // [Check] Deployment exists
            let mut deployment = store.get_deployment(service.into(), project);
            deployment.assert_does_exist();

            // [Check] Team exists
            let mut team = store.get_team(project);
            team.assert_does_exist();

            // [Check] Caller is at least admin
            let teammate = store.get_teammate(project, team.time, caller_id);
            teammate.assert_is_allowed(Role::Admin);

            // [Effect] Delete deployment
            deployment.nullify();
            store.delete_deployment(@deployment);

            // [Effect] Decrement deployment count
            team.remove();

            // [Effect] Delete team if no deployments left
            if team.deployment_count == 0 {
                team.nullify();
                store.delete_team(@team);
            } else {
                store.set_team(@team);
            }
        }
    }
}
