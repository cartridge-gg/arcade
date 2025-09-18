// Internal imports

pub use orderbook::events::index::Sale;
pub use orderbook::models::index::Order;

// Errors

pub mod errors {
    pub const SALE_INVALID_ORDER: felt252 = 'Sale: invalid order';
    pub const SALE_INVALID_ADDRESS: felt252 = 'Sale: invalid address';
}

#[generate_trait]
pub impl SaleImpl of SaleTrait {
    #[inline]
    fn new(order: Order, from: felt252, to: felt252, time: u64) -> Sale {
        // [Check] Inputs
        SaleAssert::assert_valid_order(order.id);
        SaleAssert::assert_valid_address(from);
        SaleAssert::assert_valid_address(to);
        // [Return] Sale
        Sale { order_id: order.id, order: order, from: from, to: to, time: time }
    }
}

#[generate_trait]
pub impl SaleAssert of AssertTrait {
    #[inline]
    fn assert_valid_order(order_id: u32) {
        assert(order_id != 0, errors::SALE_INVALID_ORDER);
    }

    #[inline]
    fn assert_valid_address(address: felt252) {
        assert(address != 0, errors::SALE_INVALID_ADDRESS);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    pub use orderbook::models::order::tests::{ORDER_ID, setup};
    use super::{SaleAssert, SaleTrait};

    // Constants

    const FROM: felt252 = 'FROM';
    const TO: felt252 = 'TO';
    const TIME: u64 = 1622547801;

    #[test]
    fn test_sale_new() {
        let order = setup();
        let sale = SaleTrait::new(order, FROM, TO, TIME);
        assert_eq!(sale.order_id, ORDER_ID);
        assert_eq!(sale.from, FROM);
        assert_eq!(sale.to, TO);
        assert_eq!(sale.time, TIME);
    }
}
