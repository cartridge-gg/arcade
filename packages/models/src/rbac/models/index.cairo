//! RBAC Models

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Moderator {
    #[key]
    pub address: felt252,
    pub role: u8,
}

