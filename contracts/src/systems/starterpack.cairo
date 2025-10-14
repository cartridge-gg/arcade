use starknet::ContractAddress;

#[derive(Drop, Serde)]
pub struct StarterPackMetadata {
    pub name: ByteArray,
    pub description: ByteArray,
    pub image_uri: ByteArray,
}

#[derive(Drop, Serde)]
pub struct StarterpackQuote {
    pub base_price: u256,
    pub referral_fee: u256,
    pub protocol_fee: u256,
    pub total_cost: u256,
    pub payment_token: ContractAddress,
}

#[starknet::interface]
pub trait IAdministration<TContractState> {
    fn initialize_config(
        ref self: TContractState, protocol_fee: u8, fee_receiver: ContractAddress,
    );
    fn set_protocol_fee(ref self: TContractState, fee_percentage: u8);
    fn set_fee_receiver(ref self: TContractState, receiver: ContractAddress);
    fn pause_starterpack(ref self: TContractState, starterpack_id: u32);
    fn resume_starterpack(ref self: TContractState, starterpack_id: u32);
}


#[starknet::interface]
pub trait IStarterpack<TContractState> {
    fn get_quote(
        self: @TContractState,
        starterpack_id: u32,
        has_referrer: bool,
    ) -> StarterpackQuote;
    fn register_starterpack(
        ref self: TContractState,
        implementation: ContractAddress,
        referral_percentage: u8,
        reissuable: bool,
        soulbound: bool,
        price: u256,
        payment_token: ContractAddress,
        metadata: StarterPackMetadata,
    ) -> u32; // returns starterpack_id

    fn issue_starterpack(
        ref self: TContractState,
        recipient: ContractAddress,
        starterpack_id: u32,
        referrer: Option<ContractAddress>,
        referrer_group: Option<felt252>
    );
}



#[dojo::contract]
pub mod Starterpack {
    use super::{StarterPackMetadata, StarterpackQuote, IAdministration, IStarterpack};
    use starknet::ContractAddress;
    use starterpack::models::config::ConfigTrait;

    #[storage]
    struct Storage {}

    #[abi(embed_v0)]
    impl AdministrationImpl of IAdministration<ContractState> {
        fn initialize_config(
            ref self: ContractState, protocol_fee: u8, fee_receiver: ContractAddress,
        ) {
            // TODO: Initialize config model
        }

        fn set_protocol_fee(ref self: ContractState, fee_percentage: u8) {
            // TODO: Update config model
        }
        
        fn set_fee_receiver(ref self: ContractState, receiver: ContractAddress) {
            // TODO: Update config model
        }

        fn pause_starterpack(ref self: ContractState, starterpack_id: u32) {
            // TODO: Call registrable component
        }

        fn resume_starterpack(ref self: ContractState, starterpack_id: u32) {
            // TODO: Call registrable component
        }
    }

    #[abi(embed_v0)]
    impl StarterpackImpl of IStarterpack<ContractState> {
        fn get_quote(
            self: @ContractState,
            starterpack_id: u32,
            has_referrer: bool,
        ) -> StarterpackQuote {
            let world = self.world_default();
            
            // Get starterpack details
            let starterpack = starterpack::store::StoreTrait::new(world).get_starterpack(starterpack_id);
            
            // Get config for protocol fee
            let config = starterpack::store::StoreTrait::new(world).get_config(starterpack::constants::CONFIG_ID);
            
            let base_price = starterpack.price;
            let payment_token = starterpack.payment_token;
            
            // Calculate referral fee if has_referrer
            let referral_fee = if has_referrer {
                base_price * starterpack.referral_percentage.into() / starterpack::constants::FEE_DENOMINATOR.into()
            } else {
                0
            };
            
            // Calculate protocol fee (added on top of base price)
            let protocol_fee = config.protocol_fee_amount(base_price);
            
            // Total cost = base price + protocol fee
            let total_cost = base_price + protocol_fee;
            
            StarterpackQuote {
                base_price,
                referral_fee,
                protocol_fee,
                total_cost,
                payment_token,
            }
        }

        fn register_starterpack(ref self: ContractState, implementation: ContractAddress, referral_percentage: u8, reissuable: bool, soulbound: bool, price: u256, payment_token: ContractAddress, metadata: StarterPackMetadata) -> u32 {
        }

        fn issue_starterpack(ref self: ContractState, recipient: ContractAddress, starterpack_id: u32, referrer: Option<ContractAddress>, referrer_group: Option<felt252>) {
        }
    }
}