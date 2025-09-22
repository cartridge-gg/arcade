//! Store struct and component management methods.

// Dojo imports

use dojo::event::EventStorage;
use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use orderbook::events::listing::ListingTrait;
use orderbook::events::offer::OfferTrait;
use orderbook::events::sale::SaleTrait;
use orderbook::models::book::Book;

// Models imports

use orderbook::models::moderator::Moderator;
use orderbook::models::order::Order;


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
    fn moderator(self: Store, address: felt252) -> Moderator {
        self.world.read_model(address)
    }

    #[inline]
    fn book(self: Store, id: u32) -> Book {
        self.world.read_model(id)
    }

    #[inline]
    fn order(self: Store, id: u32, collection: felt252, token_id: u256) -> Order {
        self.world.read_model((id, collection, token_id))
    }

    #[inline]
    fn set_moderator(ref self: Store, moderator: @Moderator) {
        self.world.write_model(moderator);
    }

    #[inline]
    fn set_book(ref self: Store, book: @Book) {
        self.world.write_model(book);
    }

    #[inline]
    fn set_order(ref self: Store, order: @Order) {
        self.world.write_model(order);
    }

    #[inline]
    fn listing(ref self: Store, order: Order, time: u64) {
        let event = ListingTrait::new(order, time);
        self.world.emit_event(@event);
    }

    #[inline]
    fn sale(ref self: Store, order: Order, from: felt252, to: felt252, time: u64) {
        let event = SaleTrait::new(order, from, to, time);
        self.world.emit_event(@event);
    }

    #[inline]
    fn offer(ref self: Store, order: Order, time: u64) {
        let event = OfferTrait::new(order, time);
        self.world.emit_event(@event);
    }
}
