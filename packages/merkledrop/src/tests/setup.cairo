pub mod setup {
    // Imports

    use dojo::world::{WorldStorageTrait, world};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };
    use crate::events::index as events;
    use crate::models::index as models;
    use crate::tests::mocks::registry::{IRegistryDispatcher, NAME as REGISTRY, NAMESPACE, Registry};

    #[derive(Copy, Drop)]
    pub struct Systems {
        pub registry: IRegistryDispatcher,
    }

    #[inline]
    fn setup_namespace() -> NamespaceDef {
        NamespaceDef {
            namespace: NAMESPACE(),
            resources: [
                TestResource::Model(models::m_MerkleTree::TEST_CLASS_HASH),
                TestResource::Model(models::m_MerkleClaim::TEST_CLASS_HASH),
                TestResource::Event(events::e_MerkleProofs::TEST_CLASS_HASH),
                TestResource::Contract(Registry::TEST_CLASS_HASH),
            ]
                .span(),
        }
    }

    fn setup_contracts() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@NAMESPACE(), @REGISTRY())
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span()),
        ]
            .span()
    }

    #[inline]
    pub fn spawn() -> Systems {
        // [Setup] World
        let namespace_def = setup_namespace();
        let world = spawn_test_world(world::TEST_CLASS_HASH, [namespace_def].span());
        world.sync_perms_and_inits(setup_contracts());

        // [Setup] Systems
        starknet::testing::set_block_timestamp(1);
        let (merkledrop_address, _) = world.dns(@REGISTRY()).expect('Merkledrop not found');
        Systems { registry: IRegistryDispatcher { contract_address: merkledrop_address } }
    }
}
