pub mod setup {
    // Starknet imports

    // Dojo imports

    use dojo::world::{WorldStorage, WorldStorageTrait};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };

    // Internal imports

    use registry::models::{index as models};
    use registry::tests::mocks::collection::Collection;
    use registry::tests::mocks::register::{IRegisterDispatcher, Register};
    use starknet::ContractAddress;
    use starknet::testing::set_contract_address;

    // Constant

    pub fn OWNER() -> ContractAddress {
        'OWNER'.try_into().unwrap()
    }

    pub fn PLAYER() -> ContractAddress {
        'PLAYER'.try_into().unwrap()
    }

    #[derive(Copy, Drop)]
    pub struct Systems {
        pub register: IRegisterDispatcher,
    }

    #[derive(Copy, Drop)]
    pub struct Context {
        pub player_id: felt252,
    }

    /// Drop all events from the given contract address
    pub fn clear_events(address: ContractAddress) {
        loop {
            match starknet::testing::pop_log_raw(address) {
                core::option::Option::Some(_) => {},
                core::option::Option::None => { break; },
            };
        }
    }

    #[inline]
    fn setup_namespace() -> NamespaceDef {
        NamespaceDef {
            namespace: "namespace",
            resources: [
                TestResource::Model(models::m_Access::TEST_CLASS_HASH.into()),
                TestResource::Model(models::m_Collection::TEST_CLASS_HASH.into()),
                TestResource::Model(models::m_Game::TEST_CLASS_HASH.into()),
                TestResource::Model(models::m_Edition::TEST_CLASS_HASH.into()),
                TestResource::Model(models::m_Unicity::TEST_CLASS_HASH.into()),
                TestResource::Contract(Register::TEST_CLASS_HASH.into()),
            ]
                .span(),
        }
    }

    fn setup_contracts() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@"namespace", @"Register")
                .with_writer_of([dojo::utils::bytearray_hash(@"namespace")].span())
                .with_init_calldata(
                    array![OWNER().into(), Collection::TEST_CLASS_HASH.into()].span(),
                ),
        ]
            .span()
    }

    #[inline]
    pub fn spawn() -> (WorldStorage, Systems, Context) {
        // [Setup] World
        set_contract_address(OWNER());
        let namespace_def = setup_namespace();
        let world = spawn_test_world([namespace_def].span());
        world.sync_perms_and_inits(setup_contracts());
        // [Setup] Systems
        let (register_address, _) = world.dns(@"Register").unwrap();
        let systems = Systems {
            register: IRegisterDispatcher { contract_address: register_address },
        };

        // [Setup] Context
        let context = Context { player_id: PLAYER().into() };

        // [Return]
        (world, systems, context)
    }
}
