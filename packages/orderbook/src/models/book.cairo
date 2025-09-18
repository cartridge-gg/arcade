// Internal imports

pub use orderbook::constants::{DEFAULT_FEE_DENOMINATOR, VERSION};
pub use orderbook::models::index::Book;

// Errors

pub mod errors {
    pub const BOOK_INVALID_ADDRESS: felt252 = 'Book: invalid address';
    pub const BOOK_INVALID_FEE: felt252 = 'Book: invalid fee';
    pub const BOOK_IS_PAUSED: felt252 = 'Book: is paused';
    pub const BOOK_CANNOT_PAUSE: felt252 = 'Book: cannot be paused';
    pub const BOOK_CANNOT_RESUME: felt252 = 'Book: cannot be resumed';
}

#[generate_trait]
pub impl BookImpl of BookTrait {
    #[inline]
    fn new(id: u32, royalties: bool, fee_num: u32, fee_receiver: felt252) -> Book {
        // [Check] Inputs
        BookAssert::assert_valid_address(fee_receiver);
        BookAssert::assert_valid_fee(fee_num);
        // [Return] Book
        Book {
            id: id,
            version: VERSION,
            paused: false,
            counter: 0,
            royalties: royalties,
            fee_num: fee_num,
            fee_receiver: fee_receiver,
        }
    }

    #[inline]
    fn protocol_fee(self: Book, price: u256) -> (felt252, u256) {
        // [Return] Fee
        (self.fee_receiver, price * self.fee_num.into() / DEFAULT_FEE_DENOMINATOR.into())
    }

    #[inline]
    fn client_fee(
        self: Book, price: u256, client_fee: u32, client_receiver: felt252,
    ) -> (felt252, u256) {
        // [Return] Fee
        (client_receiver, price * client_fee.into() / DEFAULT_FEE_DENOMINATOR.into())
    }

    #[inline]
    fn get_id(ref self: Book) -> u32 {
        // [Effect] Increment counter
        self.counter += 1;
        // [Return] New counter
        self.counter
    }

    #[inline]
    fn pause(ref self: Book) {
        // [Check] Book can be paused
        self.assert_can_pause();
        // [Update] Book
        self.paused = true;
    }

    #[inline]
    fn resume(ref self: Book) {
        // [Check] Book can be resumed
        self.assert_can_resume();
        // [Update] Book
        self.paused = false;
    }

    #[inline]
    fn set_fee(ref self: Book, fee_num: u32, fee_receiver: felt252) {
        // [Check] Inputs
        BookAssert::assert_valid_address(fee_receiver);
        BookAssert::assert_valid_fee(fee_num);
        // [Update] Book
        self.fee_num = fee_num;
        self.fee_receiver = fee_receiver;
    }

    #[inline]
    fn set_royalties(ref self: Book, enabled: bool) {
        // [Update] Book
        self.royalties = enabled;
    }
}

#[generate_trait]
pub impl BookAssert of AssertTrait {
    #[inline]
    fn assert_valid_address(address: felt252) {
        assert(address != 0, errors::BOOK_INVALID_ADDRESS);
    }

    #[inline]
    fn assert_valid_fee(fee: u32) {
        assert(fee <= DEFAULT_FEE_DENOMINATOR, errors::BOOK_INVALID_FEE);
    }

    #[inline]
    fn assert_can_pause(self: Book) {
        assert(!self.paused, errors::BOOK_CANNOT_PAUSE);
    }

    #[inline]
    fn assert_can_resume(self: Book) {
        assert(!self.paused, errors::BOOK_CANNOT_RESUME);
    }

    #[inline]
    fn assert_not_paused(self: Book) {
        assert(!self.paused, errors::BOOK_IS_PAUSED);
    }

    #[inline]
    fn assert_valid_client_fee(fee: u32, receiver: felt252) {
        Self::assert_valid_fee(fee);
        // [Check] We cannot have non zero fee without receiver
        assert(fee == 0 || receiver != 0, errors::BOOK_INVALID_ADDRESS);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use orderbook::constants::{BOOK_ID, VERSION};
    use super::{BookAssert, BookTrait};

    // Constants

    const ROYALTIES: bool = true;
    const FEE_NUM: u32 = 100;
    const FEE_RECEIVER: felt252 = 'FEE_RECEIVER';

    #[test]
    fn test_book_new() {
        let book = BookTrait::new(BOOK_ID, ROYALTIES, FEE_NUM, FEE_RECEIVER);
        assert_eq!(book.id, BOOK_ID);
        assert_eq!(book.version, VERSION);
        assert_eq!(book.paused, false);
        assert_eq!(book.counter, 0);
    }
}
