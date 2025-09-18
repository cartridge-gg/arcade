// Internal imports

pub use orderbook::constants::ORDER_MINIMUM_DURATION;
pub use orderbook::models::index::Order;
pub use orderbook::types::category::Category;
pub use orderbook::types::status::Status;

// Errors

pub mod errors {
    pub const ORDER_ALREADY_EXISTS: felt252 = 'Order: already exists';
    pub const ORDER_NOT_EXIST: felt252 = 'Order: does not exist';
    pub const ORDER_NOT_BUY: felt252 = 'Order: not a buy order';
    pub const ORDER_NOT_BUY_ANY: felt252 = 'Order: not a buy any order';
    pub const ORDER_NOT_SELL: felt252 = 'Order: not a sell order';
    pub const ORDER_CANNOT_CANCEL: felt252 = 'Order: cannot be canceled';
    pub const ORDER_CANNOT_DELETE: felt252 = 'Order: cannot be deleted';
    pub const ORDER_INVALID_QUANTITY: felt252 = 'Order: invalid quantity';
    pub const ORDER_IS_EXPIRED: felt252 = 'Order: is expired';
    pub const ORDER_INVALID_STATUS: felt252 = 'Order: invalid status';
    pub const ORDER_INVALID_COLLECTION: felt252 = 'Order: invalid collection';
    pub const ORDER_INVALID_PRICE: felt252 = 'Order: invalid price';
    pub const ORDER_INVALID_CURRENCY: felt252 = 'Order: invalid currency';
    pub const ORDER_INVALID_EXPIRATION: felt252 = 'Order: invalid expiration';
    pub const ORDER_CALLER_NOT_ALLOWED: felt252 = 'Order: caller not allowed';
}

#[generate_trait]
pub impl OrderImpl of OrderTrait {
    #[inline]
    fn new(
        id: u32,
        category: Category,
        collection: felt252,
        token_id: u256,
        royalties: bool,
        quantity: u128,
        price: u128,
        currency: felt252,
        expiration: u64,
        now: u64,
        owner: felt252,
    ) -> Order {
        // [Check] Inputs
        OrderAssert::assert_valid_collection(collection);
        OrderAssert::assert_valid_price(price);
        OrderAssert::assert_valid_currency(currency);
        OrderAssert::assert_valid_expiration(expiration, now);
        // [Return] Order
        Order {
            id: id,
            category: category.into(),
            royalties: royalties,
            status: Status::Placed.into(),
            collection: collection,
            token_id: token_id,
            expiration: expiration,
            quantity: quantity,
            price: price,
            currency: currency,
            owner: owner,
        }
    }

    #[inline]
    fn is_buy_order(self: @Order) -> bool {
        *self.category == Category::Buy.into() || self.is_buy_any()
    }

    #[inline]
    fn is_buy_any(self: @Order) -> bool {
        *self.category == Category::BuyAny.into()
    }

    #[inline]
    fn is_sell_order(self: @Order) -> bool {
        *self.category == Category::Sell.into()
    }

    #[inline]
    fn execute(ref self: Order, quantity: u128, now: u64) {
        // [Check] Order can be closed
        self.assert_can_execute(quantity, now);
        // [Update] Order
        self.quantity -= quantity;
        if self.quantity != 0 {
            return;
        }
        self.status = Status::Executed.into();
    }

    #[inline]
    fn cancel(ref self: Order) {
        // [Check] Order can be closed
        self.assert_can_cancel();
        // [Update] Order
        self.status = Status::Canceled.into();
    }

    #[inline]
    fn delete(ref self: Order) {
        // [Check] Order can be deleted
        self.assert_can_delete();
        // [Update] Order
        self.status = Status::Canceled.into();
    }

    #[inline]
    fn nullify(ref self: Order) {
        // [Update] Order
        self.status = Status::None.into();
    }
}

#[generate_trait]
pub impl OrderAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @Order) {
        assert(*self.status == Status::None.into(), errors::ORDER_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Order) {
        assert(*self.status != Status::None.into(), errors::ORDER_NOT_EXIST);
    }

    #[inline]
    fn assert_buy_order(self: @Order) {
        assert(self.is_buy_order(), errors::ORDER_NOT_BUY);
    }

    #[inline]
    fn assert_buy_any(self: @Order) {
        assert(self.is_buy_any(), errors::ORDER_NOT_BUY_ANY);
    }

    #[inline]
    fn assert_sell_order(self: @Order) {
        assert(self.is_sell_order(), errors::ORDER_NOT_SELL);
    }

    #[inline]
    fn assert_is_allowed(self: @Order, caller: felt252) {
        assert(*self.owner == caller, errors::ORDER_CALLER_NOT_ALLOWED);
    }

    #[inline]
    fn assert_can_execute(self: @Order, quantity: u128, now: u64) {
        assert(*self.quantity >= quantity, errors::ORDER_INVALID_QUANTITY);
        assert(*self.expiration >= now, errors::ORDER_IS_EXPIRED);
        assert(*self.status == Status::Placed.into(), errors::ORDER_INVALID_STATUS);
    }

    #[inline]
    fn assert_can_cancel(self: @Order) {
        assert(*self.status == Status::Placed.into(), errors::ORDER_CANNOT_CANCEL);
    }

    #[inline]
    fn assert_can_delete(self: @Order) {
        assert(*self.status == Status::Placed.into(), errors::ORDER_CANNOT_DELETE);
    }

    #[inline]
    fn assert_valid_collection(collection: felt252) {
        assert(collection != 0, errors::ORDER_INVALID_COLLECTION);
    }

    #[inline]
    fn assert_valid_price(price: u128) {
        assert(price != 0, errors::ORDER_INVALID_PRICE);
    }

    #[inline]
    fn assert_valid_currency(currency: felt252) {
        assert(currency != 0, errors::ORDER_INVALID_CURRENCY);
    }

    #[inline]
    fn assert_valid_expiration(time: u64, now: u64) {
        assert(time >= now + ORDER_MINIMUM_DURATION, errors::ORDER_INVALID_EXPIRATION);
    }
}

#[cfg(test)]
pub mod tests {
    // Local imports

    use super::{Category, ORDER_MINIMUM_DURATION, Order, OrderAssert, OrderTrait, Status};

    // Constants

    pub const ORDER_ID: u32 = 1;
    pub const COLLECTION: felt252 = 'COLLECTION';
    pub const TOKEN_ID: u256 = 42;
    pub const ROYALTIES: bool = true;
    pub const QUANTITY: u128 = 100;
    pub const PRICE: u128 = 1234;
    pub const CURRENCY: felt252 = 'CURRENCY';
    pub const NOW: u64 = 1622547800;
    pub const EXPIRATION: u64 = NOW + ORDER_MINIMUM_DURATION;
    pub const OWNER: felt252 = 'OWNER';
    pub const CATEGORY: Category = Category::Sell;

    pub fn setup() -> Order {
        OrderTrait::new(
            ORDER_ID,
            CATEGORY,
            COLLECTION,
            TOKEN_ID,
            ROYALTIES,
            QUANTITY,
            PRICE,
            CURRENCY,
            EXPIRATION,
            NOW,
            OWNER,
        )
    }

    #[test]
    fn test_order_new() {
        let order = setup();
        assert_eq!(order.id, ORDER_ID);
        assert_eq!(order.category, CATEGORY.into());
        assert_eq!(order.status, Status::Placed.into());
        assert_eq!(order.collection, COLLECTION);
        assert_eq!(order.token_id, TOKEN_ID);
        assert_eq!(order.quantity, QUANTITY);
        assert_eq!(order.price, PRICE);
        assert_eq!(order.currency, CURRENCY);
        assert_eq!(order.expiration, EXPIRATION);
    }
}
