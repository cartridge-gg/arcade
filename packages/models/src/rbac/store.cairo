// Dojo imports

use dojo::model::ModelStorage;
use dojo::world::WorldStorage;

// Internal imports

use models::rbac::models::index::Moderator;

// Moderator store trait

#[generate_trait]
pub impl ModeratorStoreImpl of ModeratorStoreTrait {
    fn moderator(world: WorldStorage, address: felt252) -> Moderator {
        world.read_model(address)
    }

    fn set_moderator(mut world: WorldStorage, moderator: @Moderator) {
        world.write_model(moderator);
    }
}

