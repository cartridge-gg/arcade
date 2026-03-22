use starknet::ContractAddress;
use crate::component::Component::KitQuote;

pub fn NAMESPACE() -> ByteArray {
    "NAMESPACE"
}

pub fn NAME() -> ByteArray {
    "Contract"
}

#[starknet::interface]
pub trait ContractTrait<TContractState> {
    fn register(
        ref self: TContractState,
        referral_percentage: u8,
        reissuable: bool,
        price: u256,
        payment_token: ContractAddress,
        payment_receiver: ContractAddress,
        metadata: ByteArray,
        allower: ContractAddress,
    ) -> u32;
    fn update(
        ref self: TContractState,
        kit_id: u32,
        referral_percentage: u8,
        reissuable: bool,
        price: u256,
        payment_token: ContractAddress,
        payment_receiver: ContractAddress,
        allower: ContractAddress,
    );
    fn update_metadata(ref self: TContractState, kit_id: u32, metadata: ByteArray);
    fn allow(
        ref self: TContractState, recipient: ContractAddress, kit_id: u32, voucher_key: felt252,
    );
    fn quote(
        self: @TContractState,
        kit_id: u32,
        quantity: u32,
        has_referrer: bool,
        client_percentage: u8,
    ) -> KitQuote;
    fn get_metadata(self: @TContractState, kit_id: u32) -> ByteArray;
    fn issue(
        ref self: TContractState,
        recipient: ContractAddress,
        kit_id: u32,
        quantity: u32,
        referrer: Option<ContractAddress>,
        referrer_group: Option<felt252>,
        client: Option<ContractAddress>,
        client_percentage: u8,
        voucher_key: Option<felt252>,
    );
}

#[dojo::contract]
pub mod Contract {
    use dojo::world::WorldStorage;
    use starknet::ContractAddress;
    use crate::component::Component;
    use crate::component::Component::{KitFeeTrait, KitQuote, KitTrait};
    use super::{ContractTrait, NAMESPACE};

    component!(path: Component, storage: kit, event: KitEvent);
    pub impl InternalImpl = Component::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub kit: Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        KitEvent: Component::Event,
    }

    impl KitImpl of KitTrait<ContractState> {
        fn on_issue(
            ref self: Component::ComponentState<ContractState>,
            recipient: ContractAddress,
            kit_id: u32,
            quantity: u32,
        ) {
            let _ = recipient;
            let _ = kit_id;
            let _ = quantity;
        }

        fn supply(self: @Component::ComponentState<ContractState>, kit_id: u32) -> Option<u32> {
            let _ = kit_id;
            Option::None
        }
    }

    impl KitFeeImpl of KitFeeTrait<ContractState> {
        fn protocol_fee(
            self: @Component::ComponentState<ContractState>, amount: u256,
        ) -> (ContractAddress, u256) {
            // 5% protocol fee
            let receiver: ContractAddress = 'FEE_RECEIVER'.try_into().unwrap();
            let fee = amount * 5 / 100;
            (receiver, fee)
        }
    }

    #[abi(embed_v0)]
    pub impl ContractImpl of ContractTrait<ContractState> {
        fn register(
            ref self: ContractState,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
            payment_receiver: ContractAddress,
            metadata: ByteArray,
            allower: ContractAddress,
        ) -> u32 {
            let world = self.world_storage();
            self
                .kit
                .register(
                    world,
                    referral_percentage,
                    reissuable,
                    price,
                    payment_token,
                    payment_receiver,
                    metadata,
                    allower,
                )
        }

        fn update(
            ref self: ContractState,
            kit_id: u32,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
            payment_receiver: ContractAddress,
            allower: ContractAddress,
        ) {
            let world = self.world_storage();
            self
                .kit
                .update(
                    world,
                    kit_id,
                    referral_percentage,
                    reissuable,
                    price,
                    payment_token,
                    payment_receiver,
                    allower,
                );
        }

        fn update_metadata(ref self: ContractState, kit_id: u32, metadata: ByteArray) {
            let world = self.world_storage();
            self.kit.update_metadata(world, kit_id, metadata);
        }

        fn allow(
            ref self: ContractState, recipient: ContractAddress, kit_id: u32, voucher_key: felt252,
        ) {
            let world = self.world_storage();
            self.kit.allow(world, recipient, kit_id, voucher_key);
        }

        fn quote(
            self: @ContractState,
            kit_id: u32,
            quantity: u32,
            has_referrer: bool,
            client_percentage: u8,
        ) -> KitQuote {
            let world = self.world_storage();
            self.kit.quote(world, kit_id, quantity, has_referrer, client_percentage)
        }

        fn get_metadata(self: @ContractState, kit_id: u32) -> ByteArray {
            let world = self.world_storage();
            self.kit.get_metadata(world, kit_id)
        }

        fn issue(
            ref self: ContractState,
            recipient: ContractAddress,
            kit_id: u32,
            quantity: u32,
            referrer: Option<ContractAddress>,
            referrer_group: Option<felt252>,
            client: Option<ContractAddress>,
            client_percentage: u8,
            voucher_key: Option<felt252>,
        ) {
            let world = self.world_storage();
            self
                .kit
                .issue(
                    world,
                    recipient,
                    kit_id,
                    quantity,
                    referrer,
                    referrer_group,
                    client,
                    client_percentage,
                    voucher_key,
                );
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
