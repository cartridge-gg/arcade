pub mod setup {
    // Imports

    use dojo::world::{WorldStorage, WorldStorageTrait, world};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };
    use starknet::ContractAddress;
    use starknet::testing::set_contract_address;
    use crate::models::index as crate_models;
    use crate::tests::mocks::collection::Collection;
    use crate::tests::mocks::register::{IRegisterDispatcher, NAMESPACE, Register};

    // Constant

    pub fn OWNER() -> ContractAddress {
        'OWNER'.try_into().unwrap()
    }

    pub fn PLAYER() -> ContractAddress {
        'PLAYER'.try_into().unwrap()
    }

    #[derive(Copy, Drop)]
    pub struct Systems {
        pub registry: IRegisterDispatcher,
    }

    #[derive(Copy, Drop)]
    pub struct Context {
        pub player_id: starknet::ContractAddress,
        pub owner: starknet::ContractAddress,
    }

    #[inline]
    fn setup_namespace() -> NamespaceDef {
        NamespaceDef {
            namespace: NAMESPACE(),
            resources: [
                TestResource::Model(crate_models::m_Access::TEST_CLASS_HASH),
                TestResource::Model(crate_models::m_Collection::TEST_CLASS_HASH),
                TestResource::Model(crate_models::m_CollectionEdition::TEST_CLASS_HASH),
                TestResource::Model(crate_models::m_Game::TEST_CLASS_HASH),
                TestResource::Model(crate_models::m_Edition::TEST_CLASS_HASH),
                TestResource::Model(crate_models::m_Unicity::TEST_CLASS_HASH),
                TestResource::Contract(Register::TEST_CLASS_HASH),
            ]
                .span(),
        }
    }

    #[inline]
    fn setup_contracts() -> Span<ContractDef> {
        [
            // TODO: Find a way to go through the deploy process
            ContractDefTrait::new(@NAMESPACE(), @"Register")
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span())
                .with_init_calldata(
                    array![OWNER().into(), Collection::TEST_CLASS_HASH.into()].span(),
                )
        ]
            .span()
    }

    #[inline]
    pub fn spawn() -> (WorldStorage, Systems, Context) {
        // [Setup] World
        set_contract_address(OWNER());
        let namespace_def = setup_namespace();
        let world = spawn_test_world(world::TEST_CLASS_HASH, [namespace_def].span());
        // [Setup] Context
        let context = Context { player_id: PLAYER(), owner: OWNER() };
        world.sync_perms_and_inits(setup_contracts());
        // [Setup] Systems
        let (registry_address, _) = world.dns(@"Register").unwrap();
        let systems = Systems {
            registry: IRegisterDispatcher { contract_address: registry_address },
        };

        // [Return]
        (world, systems, context)
    }
}
