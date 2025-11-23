pub mod setup {
    // Starknet imports

    // Internal imports

    // Dojo imports

    use dojo::world::{WorldStorage, WorldStorageTrait, world};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };
    use starknet::ContractAddress;
    use starknet::testing::set_contract_address;
    use crate::events::index as events;
    use crate::models::index as models;
    use crate::tests::mocks::quester::{IQuesterDispatcher, NAMESPACE, Quester};
    use crate::tests::mocks::rewarder::Rewarder;

    // Constant

    pub fn OWNER() -> ContractAddress {
        'OWNER'.try_into().unwrap()
    }

    pub fn PLAYER() -> ContractAddress {
        'PLAYER'.try_into().unwrap()
    }

    #[derive(Copy, Drop)]
    pub struct Systems {
        pub quester: IQuesterDispatcher,
    }

    #[derive(Copy, Drop)]
    pub struct Context {
        pub player_id: felt252,
        pub rewarder: ContractAddress,
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
                TestResource::Contract(Quester::TEST_CLASS_HASH),
                TestResource::Contract(Rewarder::TEST_CLASS_HASH),
            ]
                .span(),
        }
    }

    fn setup_contracts() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@NAMESPACE(), @"Quester")
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span()),
        ]
            .span()
    }

    #[inline]
    pub fn spawn_game() -> (WorldStorage, Systems, Context) {
        // [Setup] World
        set_contract_address(OWNER());
        let namespace_def = setup_namespace();
        let world = spawn_test_world(world::TEST_CLASS_HASH, [namespace_def].span());
        world.sync_perms_and_inits(setup_contracts());
        // [Setup] Systems
        let (quester_address, _) = world.dns(@"Quester").expect('Quester not found');
        let (rewarder_address, _) = world.dns(@"Rewarder").expect('Rewarder not found');
        let systems = Systems { quester: IQuesterDispatcher { contract_address: quester_address } };

        // [Setup] Context
        let context = Context { player_id: PLAYER().into(), rewarder: rewarder_address };

        // [Return]
        (world, systems, context)
    }
}
