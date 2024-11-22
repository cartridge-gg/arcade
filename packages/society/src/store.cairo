//! Store struct and component management methods.

// Starknet imports

use starknet::SyscallResultTrait;

// Dojo imports

use dojo::world::WorldStorage;
use dojo::model::ModelStorage;

// Models imports

use society::models::alliance::Alliance;
use society::models::guild::Guild;
use society::models::member::Member;


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
    fn get_alliance(self: Store, alliance_id: u32) -> Alliance {
        self.world.read_model(alliance_id)
    }

    #[inline]
    fn get_guild(self: Store, guild_id: u32) -> Guild {
        self.world.read_model(guild_id)
    }

    #[inline]
    fn get_member(self: Store, member_id: felt252) -> Member {
        self.world.read_model(member_id)
    }

    #[inline]
    fn set_alliance(ref self: Store, alliance: @Alliance) {
        self.world.write_model(alliance);
    }

    #[inline]
    fn set_guild(ref self: Store, guild: @Guild) {
        self.world.write_model(guild);
    }

    #[inline]
    fn set_member(ref self: Store, member: @Member) {
        self.world.write_model(member);
    }
}
