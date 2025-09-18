// Internal imports

pub use orderbook::events::index::Listing;
pub use orderbook::models::index::Order;

// Errors

pub mod errors {
    pub const LISTING_INVALID_ORDER: felt252 = 'Listing: invalid order';
    pub const LISTING_INVALID_ADDRESS: felt252 = 'Listing: invalid address';
}

#[generate_trait]
pub impl ListingImpl of ListingTrait {
    #[inline]
    fn new(order: Order, time: u64) -> Listing {
        // [Check] Inputs
        ListingAssert::assert_valid_order(order.id);
        // [Return] Listing
        Listing { order_id: order.id, order: order, time: time }
    }
}

#[generate_trait]
pub impl ListingAssert of AssertTrait {
    #[inline]
    fn assert_valid_order(order_id: u32) {
        assert(order_id != 0, errors::LISTING_INVALID_ORDER);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    pub use orderbook::models::order::tests::{ORDER_ID, setup};
    use super::{ListingAssert, ListingTrait};

    // Constants

    const TIME: u64 = 1622547801;

    #[test]
    fn test_sale_new() {
        let order = setup();
        let sale = ListingTrait::new(order, TIME);
        assert_eq!(sale.order_id, ORDER_ID);
        assert_eq!(sale.time, TIME);
    }
}
