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
        fn register_starterpack(ref self: ContractState, implementation: ContractAddress, referral_percentage: u8, reissuable: bool, soulbound: bool, price: u256, payment_token: ContractAddress, metadata: StarterPackMetadata) -> u32 {
        }

        fn issue_starterpack(ref self: ContractState, recipient: ContractAddress, starterpack_id: u32, referrer: Option<ContractAddress>, referrer_group: Option<felt252>) {
        }
    }
}