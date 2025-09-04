pub mod setup {
    // Starknet imports

    use achievement::events::index as achievement_events;
    // use collection::collection::Collection;

    // Internal imports

    use arcade::constants::NAMESPACE;
    use arcade::systems::registry::{IRegistryDispatcher, Registry};
    use arcade::systems::slot::{ISlotDispatcher, Slot};
    use arcade::systems::social::{ISocialDispatcher, Social};
    use arcade::systems::wallet::{IWalletDispatcher, Wallet};

    // External imports

    use controller::models::{index as controller_models};

    // Dojo imports

    use dojo::world::{WorldStorage, WorldStorageTrait};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };
    use provider::models::index as provider_models;
    use registry::models::index as registry_models;
    use social::events::index as social_events;
    use social::models::index as social_models;
    use starknet::ContractAddress;
    use starknet::testing::set_contract_address;

    // Constant

    fn OWNER() -> ContractAddress {
        'OWNER'.try_into().unwrap()
    }

    fn PLAYER() -> ContractAddress {
        'PLAYER'.try_into().unwrap()
    }

    #[derive(Copy, Drop)]
    pub struct Systems {
        pub registry: IRegistryDispatcher,
        pub slot: ISlotDispatcher,
        pub social: ISocialDispatcher,
        pub wallet: IWalletDispatcher,
    }

    #[derive(Copy, Drop)]
    pub struct Context {
        pub player_id: felt252,
    }

    #[inline]
    fn setup_namespace() -> NamespaceDef {
        NamespaceDef {
            namespace: NAMESPACE(),
            resources: [
                TestResource::Model(controller_models::m_Account::TEST_CLASS_HASH.into()),
                TestResource::Model(controller_models::m_Controller::TEST_CLASS_HASH.into()),
                TestResource::Model(controller_models::m_Signer::TEST_CLASS_HASH.into()),
                TestResource::Model(provider_models::m_Deployment::TEST_CLASS_HASH.into()),
                TestResource::Model(provider_models::m_Factory::TEST_CLASS_HASH.into()),
                TestResource::Model(provider_models::m_Team::TEST_CLASS_HASH.into()),
                TestResource::Model(provider_models::m_Teammate::TEST_CLASS_HASH.into()),
                TestResource::Model(registry_models::m_Access::TEST_CLASS_HASH.into()),
                TestResource::Model(registry_models::m_Collection::TEST_CLASS_HASH.into()),
                TestResource::Model(registry_models::m_Game::TEST_CLASS_HASH.into()),
                TestResource::Model(registry_models::m_Edition::TEST_CLASS_HASH.into()),
                TestResource::Model(registry_models::m_Unicity::TEST_CLASS_HASH.into()),
                TestResource::Model(social_models::m_Alliance::TEST_CLASS_HASH.into()),
                TestResource::Model(social_models::m_Guild::TEST_CLASS_HASH.into()),
                TestResource::Model(social_models::m_Member::TEST_CLASS_HASH.into()),
                TestResource::Event(social_events::e_Follow::TEST_CLASS_HASH.into()),
                TestResource::Event(achievement_events::e_TrophyPinning::TEST_CLASS_HASH.into()),
                TestResource::Contract(Registry::TEST_CLASS_HASH.into()),
                TestResource::Contract(Slot::TEST_CLASS_HASH.into()),
                TestResource::Contract(Social::TEST_CLASS_HASH.into()),
                TestResource::Contract(Wallet::TEST_CLASS_HASH.into()),
            ]
                .span(),
        }
    }

    #[inline]
    fn setup_contracts() -> Span<ContractDef> {
        [
            // TODO: Find a way to go through the deploy process
            // ContractDefTrait::new(@NAMESPACE(), @"Registry")
            //     .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span()),
            //     .with_init_calldata(array![OWNER().into(), Collection::TEST_CLASS_HASH].span()),
            ContractDefTrait::new(@NAMESPACE(), @"Slot")
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span())
                .with_init_calldata(array![].span()),
            ContractDefTrait::new(@NAMESPACE(), @"Social")
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span()),
            ContractDefTrait::new(@NAMESPACE(), @"Wallet")
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span()),
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
        let (registry_address, _) = world.dns(@"Registry").unwrap();
        let (slot_address, _) = world.dns(@"Slot").unwrap();
        let (social_address, _) = world.dns(@"Social").unwrap();
        let (wallet_address, _) = world.dns(@"Wallet").unwrap();
        let systems = Systems {
            registry: IRegistryDispatcher { contract_address: registry_address },
            slot: ISlotDispatcher { contract_address: slot_address },
            social: ISocialDispatcher { contract_address: social_address },
            wallet: IWalletDispatcher { contract_address: wallet_address },
        };

        // [Setup] Context
        let context = Context { player_id: PLAYER().into() };

        // [Return]
        (world, systems, context)
    }
}
