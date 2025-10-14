// Dojo imports

use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use starknet::ContractAddress;

// Internal imports

use starterpack::models::index::{Config, Issuance, Starterpack};

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
pub impl ConfigStoreImpl of ConfigStoreTrait {
    fn get_config(ref self: Store, id: u32) -> Config {
        self.world.read_model(id)
    }

    fn set_config(ref self: Store, config: @Config) {
        self.world.write_model(config);
    }
}

// Starterpack getters/setters

#[generate_trait]
pub impl StarterpackStoreImpl of StarterpackStoreTrait {
    fn get_starterpack(ref self: Store, starterpack_id: u32) -> Starterpack {
        self.world.read_model(starterpack_id)
    }

    fn set_starterpack(ref self: Store, starterpack: @Starterpack) {
        self.world.write_model(starterpack);
    }
}

// Issuance getters/setters

#[generate_trait]
pub impl IssuanceStoreImpl of IssuanceStoreTrait {
    fn get_issuance(ref self: Store, starterpack_id: u32, recipient: ContractAddress) -> Issuance {
        self.world.read_model((starterpack_id, recipient))
    }

    fn set_issuance(ref self: Store, issuance: @Issuance) {
        self.world.write_model(issuance);
    }
}

