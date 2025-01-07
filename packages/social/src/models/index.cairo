//! Models

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Member {
    #[key]
    id: felt252,
    role: u8,
    guild_id: u32,
    pending_guild_id: u32,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Guild {
    #[key]
    id: u32,
    open: bool,
    free: bool,
    role: u8,
    member_count: u8,
    alliance_id: u32,
    pending_alliance_id: u32,
    metadata: ByteArray,
    socials: ByteArray,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Alliance {
    #[key]
    id: u32,
    open: bool,
    free: bool,
    guild_count: u8,
    metadata: ByteArray,
    socials: ByteArray,
}
