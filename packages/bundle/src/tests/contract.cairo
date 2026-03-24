use starknet::ContractAddress;

pub fn NAMESPACE() -> ByteArray {
    "NAMESPACE"
}

pub fn NAME() -> ByteArray {
    "Contract"
}

#[starknet::interface]
pub trait ContractTrait<TState> {
    fn register(
        ref self: TState,
        referral_percentage: u8,
        reissuable: bool,
        price: u256,
        payment_token: ContractAddress,
        payment_receiver: ContractAddress,
        metadata: ByteArray,
        allower: ContractAddress,
    ) -> u32;
    fn update(
        ref self: TState,
        bundle_id: u32,
        referral_percentage: u8,
        reissuable: bool,
        price: u256,
        payment_token: ContractAddress,
        payment_receiver: ContractAddress,
        allower: ContractAddress,
    );
    fn update_metadata(ref self: TState, bundle_id: u32, metadata: ByteArray);
}

#[dojo::contract]
pub mod Contract {
    use dojo::world::WorldStorage;
    use starknet::ContractAddress;
    use crate::component::Component;
    use crate::component::Component::{BundleFeeTrait, BundleQuote, BundleTrait};
    use crate::interface::IBundle;
    use super::{ContractTrait, NAMESPACE};

    component!(path: Component, storage: bundle, event: BundleEvent);
    pub impl InternalImpl = Component::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub bundle: Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        BundleEvent: Component::Event,
    }

    impl BundleImpl of BundleTrait<ContractState> {
        fn on_issue(
            ref self: Component::ComponentState<ContractState>,
            recipient: ContractAddress,
            bundle_id: u32,
            quantity: u32,
        ) {
            let _ = recipient;
            let _ = bundle_id;
            let _ = quantity;
        }

        fn supply(self: @Component::ComponentState<ContractState>, bundle_id: u32) -> Option<u32> {
            let _ = bundle_id;
            Option::None
        }
    }

    impl BundleFeeImpl of BundleFeeTrait<ContractState> {
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
                .bundle
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
            bundle_id: u32,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
            payment_receiver: ContractAddress,
            allower: ContractAddress,
        ) {
            let world = self.world_storage();
            self
                .bundle
                .update(
                    world,
                    bundle_id,
                    referral_percentage,
                    reissuable,
                    price,
                    payment_token,
                    payment_receiver,
                    allower,
                );
        }

        fn update_metadata(ref self: ContractState, bundle_id: u32, metadata: ByteArray) {
            let world = self.world_storage();
            self.bundle.update_metadata(world, bundle_id, metadata);
        }
    }

    #[abi(embed_v0)]
    pub impl BundleImpl of IBundle<ContractState> {
        fn quote(
            self: @ContractState,
            bundle_id: u32,
            quantity: u32,
            has_referrer: bool,
            client_percentage: u8,
        ) -> BundleQuote {
            let world = self.world_storage();
            self.bundle.quote(world, bundle_id, quantity, has_referrer, client_percentage)
        }

        fn get_metadata(self: @ContractState, bundle_id: u32) -> ByteArray {
            let world = self.world_storage();
            self.bundle.get_metadata(world, bundle_id)
        }

        fn issue(
            ref self: ContractState,
            recipient: ContractAddress,
            bundle_id: u32,
            quantity: u32,
            referrer: Option<ContractAddress>,
            referrer_group: Option<felt252>,
            client: Option<ContractAddress>,
            client_percentage: u8,
            voucher_key: Option<felt252>,
            signature: Option<Span<felt252>>,
        ) {
            let world = self.world_storage();
            self
                .bundle
                .issue(
                    world,
                    recipient,
                    bundle_id,
                    quantity,
                    referrer,
                    referrer_group,
                    client,
                    client_percentage,
                    voucher_key,
                    signature,
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
