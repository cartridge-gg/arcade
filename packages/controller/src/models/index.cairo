//! Models

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Account {
    #[key]
    id: felt252,
    controllers: u32,
    name: felt252,
    username: felt252,
    socials: ByteArray,
    credits: felt252,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Controller {
    #[key]
    account_id: felt252,
    #[key]
    id: felt252,
    signers: u32,
    address: felt252,
    network: felt252,
    constructor_calldata: ByteArray,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Member {
    #[key]
    account_id: felt252,
    #[key]
    team_id: felt252,
    role: u8,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Signer {
    #[key]
    account_id: felt252,
    #[key]
    controller_id: felt252,
    method: u8,
    metadata: ByteArray,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Team {
    #[key]
    id: felt252,
    name: felt252,
    description: ByteArray,
}