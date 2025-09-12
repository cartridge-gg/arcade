//! Store struct and component management methods.

// Dojo imports

use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
// Models imports

use registry::models::access::Access;
use registry::models::collection::Collection;
use registry::models::edition::{Edition, EditionTrait};
use registry::models::game::{Game, GameTrait};
use registry::models::unicity::{Unicity, UnicityTrait};

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
    fn get_access(self: Store, address: felt252) -> Access {
        self.world.read_model(address)
    }

    #[inline]
    fn get_collection(self: Store, id: felt252) -> Collection {
        self.world.read_model(id)
    }

    #[inline]
    fn get_game(self: Store, game_id: felt252) -> Game {
        self.world.read_model(game_id)
    }

    #[inline]
    fn get_edition(self: Store, edition_id: felt252) -> Edition {
        self.world.read_model(edition_id)
    }

    #[inline]
    fn get_unicity(self: Store, world_address: felt252, namespace: felt252) -> Unicity {
        self.world.read_model((world_address, namespace))
    }

    #[inline]
    fn set_access(ref self: Store, access: @Access) {
        self.world.write_model(access);
    }

    #[inline]
    fn set_collection(ref self: Store, collection: @Collection) {
        self.world.write_model(collection);
    }

    #[inline]
    fn set_game(ref self: Store, game: @Game) {
        self.world.write_model(game);
    }

    #[inline]
    fn set_edition(ref self: Store, edition: @Edition) {
        self.world.write_model(edition);
    }

    #[inline]
    fn set_unicity(ref self: Store, unicity: @Unicity) {
        self.world.write_model(unicity);
    }

    #[inline]
    fn delete_game(ref self: Store, ref game: Game) {
        game.nullify();
        self.world.erase_model(@game);
    }

    #[inline]
    fn delete_edition(ref self: Store, ref edition: Edition) {
        edition.nullify();
        self.world.erase_model(@edition);
    }

    #[inline]
    fn delete_unicity(ref self: Store, ref unicity: Unicity) {
        unicity.nullify();
        self.world.erase_model(@unicity);
    }
}
