#[derive(Copy, Drop, PartialEq)]
pub enum Role {
    None,
    Member,
    Officer,
    Master,
}

// Implementations

impl IntoRoleU8 of core::Into<Role, u8> {
    #[inline]
    fn into(self: Role) -> u8 {
        match self {
            Role::None => 0,
            Role::Member => 1,
            Role::Officer => 2,
            Role::Master => 3,
        }
    }
}

impl IntoU8Role of core::Into<u8, Role> {
    #[inline]
    fn into(self: u8) -> Role {
        match self {
            0 => Role::None,
            1 => Role::Member,
            2 => Role::Officer,
            3 => Role::Master,
            _ => Role::None,
        }
    }
}
