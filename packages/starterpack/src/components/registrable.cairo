#[starknet::component]
pub mod RegistrableComponent {
    // Dojo imports

    use dojo::event::EventStorage;
    use dojo::world::{IWorldDispatcherTrait, WorldStorage};
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address};

    // Internal imports

    use starterpack::constants::MAX_REFERRAL_FEE;
    use starterpack::events::index::{StarterpackPaused, StarterpackRegistered, StarterpackResumed};
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
            soulbound: bool,
            price: u256,
            payment_token: ContractAddress,
            name: ByteArray,
            description: ByteArray,
            image_uri: ByteArray,
        ) -> u32 {
            let mut store = StoreTrait::new(world);

            assert!(
                referral_percentage <= MAX_REFERRAL_FEE,
                "Starterpack: referral percentage too high",
            );

            let starterpack_id = world.dispatcher.uuid();

            let time = get_block_timestamp();
            let owner = get_caller_address();
            let starterpack = StarterpackTrait::new(
                starterpack_id,
                implementation,
                owner,
                referral_percentage,
                reissuable,
                soulbound,
                price,
                payment_token,
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
                        name,
                        description,
                        image_uri,
                        time,
                    },
                );

            starterpack_id
        }

        fn pause(
            self: @ComponentState<TContractState>, mut world: WorldStorage, starterpack_id: u32,
        ) {
            let mut store = StoreTrait::new(world);

            let caller = get_caller_address();
            let mut starterpack = store.get_starterpack(starterpack_id);
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

            let caller = get_caller_address();
            let mut starterpack = store.get_starterpack(starterpack_id);
            starterpack.assert_is_owner(caller);

            starterpack.resume();

            store.set_starterpack(@starterpack);

            let time = get_block_timestamp();
            world.emit_event(@StarterpackResumed { starterpack_id, time });
        }
    }
}

