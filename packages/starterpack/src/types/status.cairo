// Types

#[derive(Copy, Drop, Serde)]
pub enum Status {
    None,
    Active,
    Paused,
}

// Implementations

impl IntoStatusFelt252 of Into<Status, felt252> {
    fn into(self: Status) -> felt252 {
        match self {
            Status::None => 'NONE',
            Status::Active => 'ACTIVE',
            Status::Paused => 'PAUSED',
        }
    }
}

impl IntoStatusU8 of Into<Status, u8> {
    fn into(self: Status) -> u8 {
        match self {
            Status::None => 0,
            Status::Active => 1,
            Status::Paused => 2,
        }
    }
}

