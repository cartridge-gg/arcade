// Internal imports

use orderbook::models::index::Order;

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Listing {
    #[key]
    pub order_id: u32,
    pub order: Order,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Sale {
    #[key]
    pub order_id: u32,
    pub order: Order,
    pub from: felt252,
    pub to: felt252,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Offer {
    #[key]
    pub order_id: u32,
    pub order: Order,
    pub time: u64,
}
