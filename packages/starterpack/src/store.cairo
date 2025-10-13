// Dojo imports

use dojo::world::WorldStorage;

// Internal imports

use starterpack::models::config::Config;
use starterpack::models::issuance::Issuance;
use starterpack::models::starterpack::Starterpack;

// Store trait

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    fn new(world: WorldStorage) -> Store {
        Store { world }
    }
}

// Store struct

#[derive(Copy, Drop)]
pub struct Store {
    world: WorldStorage,
}

// Config getters/setters

#[generate_trait]
impl ConfigStoreImpl of ConfigStoreTrait {
    fn get_config(ref self: Store, id: u32) -> Config {
        self.world.read_model(id)
    }

    fn set_config(ref self: Store, config: @Config) {
        self.world.write_model(config);
    }
}

// Starterpack getters/setters

#[generate_trait]
impl StarterpackStoreImpl of StarterpackStoreTrait {
    fn get_starterpack(ref self: Store, starterpack_id: u32) -> Starterpack {
        self.world.read_model(starterpack_id)
    }

    fn set_starterpack(ref self: Store, starterpack: @Starterpack) {
        self.world.write_model(starterpack);
    }
}

// Issuance getters/setters

#[generate_trait]
impl IssuanceStoreImpl of IssuanceStoreTrait {
    fn get_issuance(ref self: Store, starterpack_id: u32, recipient: ContractAddress) -> Issuance {
        self.world.read_model((starterpack_id, recipient))
    }

    fn set_issuance(ref self: Store, issuance: @Issuance) {
        self.world.write_model(issuance);
    }
}

