//! Store struct and component management methods.

// Starknet imports

use starknet::SyscallResultTrait;

// Dojo imports

use dojo::world::WorldStorage;
use dojo::model::ModelStorage;
// Models imports

use arcade_slot::models::deployment::Deployment;

// Structs

#[derive(Copy, Drop)]
struct Store {
    world: WorldStorage,
}

// Implementations

#[generate_trait]
impl StoreImpl of StoreTrait {
    #[inline]
    fn new(world: WorldStorage) -> Store {
        Store { world: world }
    }

    #[inline]
    fn get_deployment(self: Store, deployment_id: u32) -> Deployment {
        self.world.read_model(deployment_id)
    }

    #[inline]
    fn set_deployment(ref self: Store, deployment: Deployment) {
        self.world.write_model(@deployment);
    }
}
