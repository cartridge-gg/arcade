// Types

#[derive(Copy, Drop, Serde, Introspect, DojoStore, Default, PartialEq, Debug)]
pub enum Status {
    #[default]
    Active,
    Paused,
}

// Implementations

impl IntoStatusFelt252 of Into<Status, felt252> {
    fn into(self: Status) -> felt252 {
        match self {
            Status::Active => 'ACTIVE',
            Status::Paused => 'PAUSED',
        }
    }
}

impl IntoStatusU8 of Into<Status, u8> {
    fn into(self: Status) -> u8 {
        match self {
            Status::Active => 0,
            Status::Paused => 1,
        }
    }
}
