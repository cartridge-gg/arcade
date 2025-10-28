#[starknet::component]
pub mod RegistrableComponent {
    // Dojo imports

    use dojo::event::EventStorage;
    use dojo::world::{IWorldDispatcherTrait, WorldStorage};
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address};

    // Internal imports

    use starterpack::constants::MAX_REFERRAL_FEE;
    use starterpack::events::index::{
        StarterpackPaused, StarterpackRegistered, StarterpackResumed, StarterpackUpdated,
    };
    use starterpack::models::starterpack::{StarterpackAssert, StarterpackTrait};
    use starterpack::store::{StarterpackStoreTrait, StoreTrait};

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
            mut world: WorldStorage,
            implementation: ContractAddress,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
            metadata: ByteArray,
        ) -> u32 {
            let mut store = StoreTrait::new(world);

            assert(referral_percentage <= MAX_REFERRAL_FEE, 'Starterpack: referral too high');

            let starterpack_id = world.dispatcher.uuid();

            let time = get_block_timestamp();
            let owner = get_caller_address();
            let starterpack = StarterpackTrait::new(
                starterpack_id,
                implementation,
                owner,
                referral_percentage,
                reissuable,
                price,
                payment_token,
                metadata,
                time,
            );

            store.set_starterpack(@starterpack);

            world
                .emit_event(
                    @StarterpackRegistered {
                        starterpack_id,
                        implementation,
                        referral_percentage,
                        reissuable,
                        owner,
                        time,
                    },
                );

            starterpack_id
        }

        fn update(
            self: @ComponentState<TContractState>,
            mut world: WorldStorage,
            starterpack_id: u32,
            implementation: ContractAddress,
            referral_percentage: u8,
            reissuable: bool,
            price: u256,
            payment_token: ContractAddress,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

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
                .update(implementation, referral_percentage, reissuable, price, payment_token);

            // [Effect] Store updated starterpack
            store.set_starterpack(@starterpack);

            // [Event] Emit event
            let time = get_block_timestamp();
            world
                .emit_event(
                    @StarterpackUpdated {
                        starterpack_id,
                        implementation,
                        referral_percentage,
                        reissuable,
                        price,
                        payment_token,
                        metadata: starterpack.metadata.clone(),
                        time,
                    },
                );
        }

        fn update_metadata(
            self: @ComponentState<TContractState>,
            mut world: WorldStorage,
            starterpack_id: u32,
            metadata: ByteArray,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

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
            world
                .emit_event(
                    @StarterpackUpdated {
                        starterpack_id: starterpack.starterpack_id,
                        implementation: starterpack.implementation,
                        referral_percentage: starterpack.referral_percentage,
                        reissuable: starterpack.reissuable,
                        price: starterpack.price,
                        payment_token: starterpack.payment_token,
                        metadata,
                        time,
                    },
                );
        }

        fn pause(
            self: @ComponentState<TContractState>, mut world: WorldStorage, starterpack_id: u32,
        ) {
            let mut store = StoreTrait::new(world);

            // [Check] Starterpack exists
            let mut starterpack = store.get_starterpack(starterpack_id);
            starterpack.assert_does_exist();

            // [Check] Caller is owner
            let caller = get_caller_address();
            starterpack.assert_is_owner(caller);

            starterpack.pause();

            store.set_starterpack(@starterpack);

            let time = get_block_timestamp();
            world.emit_event(@StarterpackPaused { starterpack_id, time });
        }

        fn resume(
            self: @ComponentState<TContractState>, mut world: WorldStorage, starterpack_id: u32,
        ) {
            let mut store = StoreTrait::new(world);

            // [Check] Starterpack exists
            let mut starterpack = store.get_starterpack(starterpack_id);
            starterpack.assert_does_exist();

            // [Check] Caller is owner
            let caller = get_caller_address();
            starterpack.assert_is_owner(caller);

            starterpack.resume();

            store.set_starterpack(@starterpack);

            let time = get_block_timestamp();
            world.emit_event(@StarterpackResumed { starterpack_id, time });
        }
    }
}

