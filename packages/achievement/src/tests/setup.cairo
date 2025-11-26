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
    use crate::tests::mocks::achiever::{Achiever, IAchieverDispatcher, NAMESPACE};
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
        pub achiever: IAchieverDispatcher,
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
                TestResource::Event(events::e_TrophyCreation::TEST_CLASS_HASH),
                TestResource::Event(events::e_TrophyProgression::TEST_CLASS_HASH),
                TestResource::Event(events::e_AchievementCompleted::TEST_CLASS_HASH),
                TestResource::Event(events::e_AchievementClaimed::TEST_CLASS_HASH),
                TestResource::Model(models::m_AchievementDefinition::TEST_CLASS_HASH),
                TestResource::Model(models::m_AchievementCompletion::TEST_CLASS_HASH),
                TestResource::Model(models::m_AchievementAdvancement::TEST_CLASS_HASH),
                TestResource::Model(models::m_AchievementAssociation::TEST_CLASS_HASH),
                TestResource::Contract(Achiever::TEST_CLASS_HASH),
                TestResource::Contract(Rewarder::TEST_CLASS_HASH),
            ]
                .span(),
        }
    }

    fn setup_contracts() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@NAMESPACE(), @"Achiever")
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
        let (achiever_address, _) = world.dns(@"Achiever").expect('Achiever not found');
        let (rewarder_address, _) = world.dns(@"Rewarder").expect('Rewarder not found');
        let systems = Systems {
            achiever: IAchieverDispatcher { contract_address: achiever_address },
        };

        // [Setup] Context
        let context = Context { player_id: PLAYER().into(), rewarder: rewarder_address };

        // [Return]
        (world, systems, context)
    }
}
