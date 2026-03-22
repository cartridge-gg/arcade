pub mod setup {
    use dojo::world::{WorldStorage, WorldStorageTrait, world};
    use dojo_cairo_test::{
        ContractDef,
        ContractDefTrait,
        NamespaceDef,
        TestResource,
        WorldStorageTestTrait,
        spawn_test_world,
    };
    use starknet::ContractAddress;
    use crate::events::index as events;
    use crate::models::index as kit_models;
    use crate::tests::contract::{Contract, ContractTraitDispatcher, NAME as CONTRACT, NAMESPACE};

    pub fn CREATOR() -> ContractAddress {
        'CREATOR'.try_into().unwrap()
    }

    pub fn PLAYER() -> ContractAddress {
        'PLAYER'.try_into().unwrap()
    }

    pub fn PAYMENT_TOKEN() -> ContractAddress {
        0.try_into().unwrap()
    }

    pub fn METADATA() -> ByteArray {
        "KIT_METADATA"
    }

    #[derive(Copy, Drop)]
    pub struct Systems {
        pub contract: ContractTraitDispatcher,
    }

    #[inline]
    fn setup_namespace() -> NamespaceDef {
        NamespaceDef {
            namespace: NAMESPACE(),
            resources: [
                TestResource::Model(kit_models::m_Kit::TEST_CLASS_HASH),
                TestResource::Model(kit_models::m_KitIssuance::TEST_CLASS_HASH),
                TestResource::Model(kit_models::m_KitReferral::TEST_CLASS_HASH),
                TestResource::Model(kit_models::m_KitGroup::TEST_CLASS_HASH),
                TestResource::Model(kit_models::m_KitVoucher::TEST_CLASS_HASH),
                TestResource::Event(events::e_KitRegistered::TEST_CLASS_HASH),
                TestResource::Event(events::e_KitUpdated::TEST_CLASS_HASH),
                TestResource::Event(events::e_KitIssued::TEST_CLASS_HASH),
                TestResource::Contract(Contract::TEST_CLASS_HASH),
            ]
                .span(),
        }
    }

    fn setup_contracts() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@NAMESPACE(), @CONTRACT())
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span()),
        ]
            .span()
    }

    #[inline]
    pub fn spawn() -> (WorldStorage, Systems) {
        let namespace_def = setup_namespace();
        let world = spawn_test_world(world::TEST_CLASS_HASH, [namespace_def].span());
        world.sync_perms_and_inits(setup_contracts());

        let (contract_address, _) = world.dns(@CONTRACT()).expect('Contract not found');
        let systems = Systems { contract: ContractTraitDispatcher { contract_address } };

        (world, systems)
    }
}
