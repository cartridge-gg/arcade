#[derive(Copy, Drop, PartialEq)]
pub enum Category {
    None,
    Buy,
    Sell,
    BuyAny,
}

// Implementations

pub impl IntoCategoryU8 of core::traits::Into<Category, u8> {
    #[inline]
    fn into(self: Category) -> u8 {
        match self {
            Category::None => 0,
            Category::Buy => 1,
            Category::Sell => 2,
            Category::BuyAny => 3,
        }
    }
}

pub impl IntoU8Category of core::traits::Into<u8, Category> {
    #[inline]
    fn into(self: u8) -> Category {
        match self {
            0 => Category::None,
            1 => Category::Buy,
            2 => Category::Sell,
            3 => Category::BuyAny,
            _ => Category::None,
        }
    }
}
