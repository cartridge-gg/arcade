/// Models

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Access {
    #[key]
    pub address: felt252,
    pub role: u8,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Collection {
    #[key]
    pub id: felt252,
    pub uuid: felt252,
    pub contract_address: starknet::ContractAddress,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Game {
    #[key]
    pub id: felt252,
    // Arcade registry
    pub published: bool,
    pub whitelisted: bool,
    // OpenSea standard metadata
    pub color: ByteArray,
    pub image: ByteArray,
    pub image_data: ByteArray,
    pub external_url: ByteArray,
    pub description: ByteArray,
    pub name: ByteArray,
    pub animation_url: ByteArray,
    pub youtube_url: ByteArray,
    pub attributes: ByteArray,
    pub properties: ByteArray,
    pub socials: ByteArray,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Edition {
    #[key]
    pub id: felt252,
    pub world_address: felt252,
    pub namespace: felt252,
    // Arcade registry
    pub published: bool,
    pub whitelisted: bool,
    pub priority: u8,
    pub game_id: felt252,
    pub config: ByteArray,
    // OpenSea standard metadata
    pub color: ByteArray,
    pub image: ByteArray,
    pub image_data: ByteArray,
    pub external_url: ByteArray,
    pub description: ByteArray,
    pub name: ByteArray,
    pub animation_url: ByteArray,
    pub youtube_url: ByteArray,
    pub attributes: ByteArray,
    pub properties: ByteArray,
    pub socials: ByteArray,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Unicity {
    #[key]
    pub world_address: felt252,
    #[key]
    pub namespace: felt252,
    pub token_id: felt252,
}
