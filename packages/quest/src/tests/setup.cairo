pub mod setup {
    use dojo::world::{WorldStorage, WorldStorageTrait, world};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };
    use starknet::ContractAddress;
    use crate::events::index as events;
    use crate::models::index as models;
    use crate::tests::contract::{Contract, ContractTraitDispatcher, NAMESPACE};
    use crate::types::metadata::{QuestMetadata, QuestMetadataTrait};

    pub fn PLAYER() -> ContractAddress {
        'PLAYER'.try_into().unwrap()
    }

    pub fn REWARDER() -> ContractAddress {
        'REWARDER'.try_into().unwrap()
    }

    pub fn METADATA() -> QuestMetadata {
        QuestMetadataTrait::new(
            "NAME", "DESCRIPTION", "ICON", 'REGISTRY'.try_into().unwrap(), array![].span(),
        )
    }

    #[derive(Copy, Drop)]
    pub struct Systems {
        pub quester: ContractTraitDispatcher,
    }

    #[inline]
    fn setup_namespace() -> NamespaceDef {
        NamespaceDef {
            namespace: NAMESPACE(),
            resources: [
                TestResource::Event(events::e_QuestCreation::TEST_CLASS_HASH),
                TestResource::Event(events::e_QuestProgression::TEST_CLASS_HASH),
                TestResource::Event(events::e_QuestUnlocked::TEST_CLASS_HASH),
                TestResource::Event(events::e_QuestCompleted::TEST_CLASS_HASH),
                TestResource::Event(events::e_QuestClaimed::TEST_CLASS_HASH),
                TestResource::Model(models::m_QuestDefinition::TEST_CLASS_HASH),
                TestResource::Model(models::m_QuestCompletion::TEST_CLASS_HASH),
                TestResource::Model(models::m_QuestAdvancement::TEST_CLASS_HASH),
                TestResource::Model(models::m_QuestAssociation::TEST_CLASS_HASH),
                TestResource::Model(models::m_QuestCondition::TEST_CLASS_HASH),
                TestResource::Contract(Contract::TEST_CLASS_HASH),
            ]
                .span(),
        }
    }

    fn setup_contracts() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@NAMESPACE(), @"Contract")
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span()),
        ]
            .span()
    }

    #[inline]
    pub fn spawn() -> (WorldStorage, Systems) {
        let namespace_def = setup_namespace();
        let world = spawn_test_world(world::TEST_CLASS_HASH, [namespace_def].span());
        world.sync_perms_and_inits(setup_contracts());

        let (contract_address, _) = world.dns(@"Contract").expect('Contract not found');
        let systems = Systems { quester: ContractTraitDispatcher { contract_address } };

        (world, systems)
    }
}
