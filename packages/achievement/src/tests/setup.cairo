pub mod setup {
    // Imports

    use dojo::world::{WorldStorage, WorldStorageTrait, world};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };
    use starknet::ContractAddress;
    use crate::events::index as events;
    use crate::models::index as models;
    use crate::tests::contract::{Contract, ContractTraitDispatcher, NAMESPACE};

    // Constants

    pub fn PLAYER() -> ContractAddress {
        'PLAYER'.try_into().unwrap()
    }

    pub fn REWARDER() -> ContractAddress {
        'REWARDER'.try_into().unwrap()
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
                TestResource::Event(events::e_TrophyCreation::TEST_CLASS_HASH),
                TestResource::Event(events::e_TrophyProgression::TEST_CLASS_HASH),
                TestResource::Event(events::e_AchievementCompleted::TEST_CLASS_HASH),
                TestResource::Event(events::e_AchievementClaimed::TEST_CLASS_HASH),
                TestResource::Model(models::m_AchievementDefinition::TEST_CLASS_HASH),
                TestResource::Model(models::m_AchievementCompletion::TEST_CLASS_HASH),
                TestResource::Model(models::m_AchievementAdvancement::TEST_CLASS_HASH),
                TestResource::Model(models::m_AchievementAssociation::TEST_CLASS_HASH),
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
        // [Setup] World
        let namespace_def = setup_namespace();
        let world = spawn_test_world(world::TEST_CLASS_HASH, [namespace_def].span());
        world.sync_perms_and_inits(setup_contracts());

        // [Setup] Systems
        let (contract_address, _) = world.dns(@"Contract").expect('Contract not found');
        let systems = Systems { contract: ContractTraitDispatcher { contract_address } };

        // [Return]
        (world, systems)
    }
}
