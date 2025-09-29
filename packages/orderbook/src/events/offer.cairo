// Internal imports

pub use orderbook::events::index::Offer;
pub use orderbook::models::index::Order;

// Errors

pub mod errors {
    pub const OFFER_INVALID_ORDER: felt252 = 'Offer: invalid order';
    pub const OFFER_INVALID_ADDRESS: felt252 = 'Offer: invalid address';
}

#[generate_trait]
pub impl OfferImpl of OfferTrait {
    #[inline]
    fn new(order: Order, time: u64) -> Offer {
        // [Check] Inputs
        OfferAssert::assert_valid_order(order.id);
        // [Return] Order
        Offer { order_id: order.id, order: order, time: time }
    }
}

#[generate_trait]
pub impl OfferAssert of AssertTrait {
    #[inline]
    fn assert_valid_order(order_id: u32) {
        assert(order_id != 0, errors::OFFER_INVALID_ORDER);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    pub use orderbook::models::order::tests::{ORDER_ID, setup};
    use super::{OfferAssert, OfferTrait};

    // Constants

    const FROM: felt252 = 'FROM';
    const TO: felt252 = 'TO';
    const TIME: u64 = 1622547801;

    #[test]
    fn test_order_new() {
        let order = setup();
        let offer = OfferTrait::new(order, TIME);
        assert_eq!(offer.order_id, ORDER_ID);
        assert_eq!(offer.time, TIME);
    }
}
