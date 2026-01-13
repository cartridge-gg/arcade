#[starknet::component]
pub mod RegistrableComponent {
    // Dojo imports

    use dojo::world::{IWorldDispatcherTrait, WorldStorage};
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address};

    // Internal imports

    use crate::constants::MAX_REFERRAL_FEE;
    use crate::models::starterpack::{StarterpackAssert, StarterpackTrait};
    use crate::store::{StarterpackStoreTrait, StoreTrait};

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn register(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            implementation: ContractAddress,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
            payment_receiver: Option<ContractAddress>,
            metadata: ByteArray,
        ) -> u32 {
            // [Setup] Datastore
            let store = StoreTrait::new(world);

            // [Check] Referral percentage is valid
            assert(referral_percentage <= MAX_REFERRAL_FEE, 'Starterpack: referral too high');

            // [Effect] Create starterpack
            let starterpack_id = world.dispatcher.uuid();
            let time = get_block_timestamp();
            let owner = get_caller_address();
            let starterpack = StarterpackTrait::new(
                starterpack_id: starterpack_id,
                implementation: implementation,
                owner: owner,
                referral_percentage: referral_percentage,
                reissuable: reissuable,
                price: price,
                payment_token: payment_token,
                payment_receiver: payment_receiver,
                metadata: metadata,
                time: time,
            );
            store.set_starterpack(@starterpack);

            // [Event] Emit event
            store.registered(@starterpack);

            // [Return] Starterpack ID
            starterpack_id
        }

        fn update(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            starterpack_id: u32,
            implementation: ContractAddress,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
            payment_receiver: Option<ContractAddress>,
        ) {
            // [Setup] Datastore
            let store = StoreTrait::new(world);

            // [Check] Starterpack exists
            let mut starterpack = store.get_starterpack(starterpack_id);
            starterpack.assert_does_exist();

            // [Check] Caller is owner
            let caller = get_caller_address();
            starterpack.assert_is_owner(caller);

            // [Check] Referral percentage is valid
            assert(referral_percentage <= MAX_REFERRAL_FEE, 'Starterpack: referral too high');

            // [Effect] Update starterpack fields
            starterpack
                .update(
                    implementation,
                    referral_percentage,
                    reissuable,
                    price,
                    payment_token,
                    payment_receiver,
                );

            // [Effect] Store updated starterpack
            store.set_starterpack(@starterpack);

            // [Event] Emit event
            let time = get_block_timestamp();
            store.updated(@starterpack, time);
        }

        fn update_metadata(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            starterpack_id: u32,
            metadata: ByteArray,
        ) {
            // [Setup] Datastore
            let store = StoreTrait::new(world);

            // [Check] Starterpack exists
            let mut starterpack = store.get_starterpack(starterpack_id);
            starterpack.assert_does_exist();

            // [Check] Caller is owner
            let caller = get_caller_address();
            starterpack.assert_is_owner(caller);

            // [Effect] Update metadata
            starterpack.update_metadata(metadata.clone());

            // [Effect] Store updated starterpack
            store.set_starterpack(@starterpack);

            // [Event] Emit event
            let time = get_block_timestamp();
            store.updated(@starterpack, time);
        }

        fn pause(self: @ComponentState<TContractState>, world: WorldStorage, starterpack_id: u32) {
            // [Setup] Datastore
            let store = StoreTrait::new(world);

            // [Check] Starterpack exists
            let mut starterpack = store.get_starterpack(starterpack_id);
            starterpack.assert_does_exist();

            // [Check] Caller is owner
            let caller = get_caller_address();
            starterpack.assert_is_owner(caller);

            // [Effect] Pause starterpack
            starterpack.pause();
            store.set_starterpack(@starterpack);

            // [Event] Emit event
            let time = get_block_timestamp();
            store.paused(starterpack_id, time);
        }

        fn resume(self: @ComponentState<TContractState>, world: WorldStorage, starterpack_id: u32) {
            // [Setup] Datastore
            let store = StoreTrait::new(world);

            // [Check] Starterpack exists
            let mut starterpack = store.get_starterpack(starterpack_id);
            starterpack.assert_does_exist();

            // [Check] Caller is owner
            let caller = get_caller_address();
            starterpack.assert_is_owner(caller);

            // [Effect] Resume starterpack
            starterpack.resume();
            store.set_starterpack(@starterpack);

            // [Event] Emit event
            let time = get_block_timestamp();
            store.resumed(starterpack_id, time);
        }
    }
}

