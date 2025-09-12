//! Store struct and component management methods.

// Dojo imports

use dojo::model::ModelStorage;
use dojo::world::WorldStorage;

// Models imports

use provider::models::deployment::Deployment;
use provider::models::factory::Factory;
use provider::models::index::{Team, Teammate};

// Structs

#[derive(Copy, Drop)]
pub struct Store {
    world: WorldStorage,
}

// Implementations

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    #[inline]
    fn new(world: WorldStorage) -> Store {
        Store { world: world }
    }

    #[inline]
    fn get_deployment(self: Store, service: u8, project: felt252) -> Deployment {
        self.world.read_model((service, project))
    }

    #[inline]
    fn get_factory(self: Store, factory_id: u8) -> Factory {
        self.world.read_model(factory_id)
    }

    #[inline]
    fn get_team(self: Store, team_id: felt252) -> Team {
        self.world.read_model(team_id)
    }

    #[inline]
    fn get_teammate(self: Store, team_id: felt252, time: u64, account_id: felt252) -> Teammate {
        self.world.read_model((team_id, time, account_id))
    }

    #[inline]
    fn set_deployment(ref self: Store, deployment: @Deployment) {
        self.world.write_model(deployment);
    }

    #[inline]
    fn set_factory(ref self: Store, factory: @Factory) {
        self.world.write_model(factory);
    }

    #[inline]
    fn set_team(ref self: Store, team: @Team) {
        self.world.write_model(team);
    }

    #[inline]
    fn set_teammate(ref self: Store, teammate: @Teammate) {
        self.world.write_model(teammate);
    }

    #[inline]
    fn delete_deployment(ref self: Store, deployment: @Deployment) {
        self.world.erase_model(deployment);
    }

    #[inline]
    fn delete_team(ref self: Store, team: @Team) {
        self.world.erase_model(team);
    }

    #[inline]
    fn delete_teammate(ref self: Store, teammate: @Teammate) {
        self.world.erase_model(teammate);
    }
}
