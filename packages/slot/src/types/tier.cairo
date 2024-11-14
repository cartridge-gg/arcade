#[derive(Copy, Drop, PartialEq)]
pub enum Tier {
    None,
    Basic,
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
    Insane,
}

// Implementations

impl IntoTierU8 of core::Into<Tier, u8> {
    #[inline]
    fn into(self: Tier) -> u8 {
        match self {
            Tier::None => 0,
            Tier::Basic => 1,
            Tier::Common => 2,
            Tier::Uncommon => 3,
            Tier::Rare => 4,
            Tier::Epic => 5,
            Tier::Legendary => 6,
            Tier::Insane => 7,
        }
    }
}

impl IntoU8Tier of core::Into<u8, Tier> {
    #[inline]
    fn into(self: u8) -> Tier {
        match self {
            0 => Tier::None,
            1 => Tier::Basic,
            2 => Tier::Common,
            3 => Tier::Uncommon,
            4 => Tier::Rare,
            5 => Tier::Epic,
            6 => Tier::Legendary,
            7 => Tier::Insane,
            _ => Tier::None,
        }
    }
}
