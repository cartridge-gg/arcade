pub mod setup {
    // Imports

    use controller::models::index as controller_models;
    use dojo::world::{WorldStorage, WorldStorageTrait, world};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };
    use models::rbac::models::index as rbac_models;
    use openzeppelin::token::erc20::interface::IERC20Dispatcher;
    use orderbook::events::index as orderbook_events;
    use orderbook::models::index as orderbook_models;
    use provider::models::index as provider_models;
    use registry::models::index as registry_models;
    use social::events::index as social_events;
    use social::models::index as social_models;
    use starknet::syscalls::deploy_syscall;
    use starknet::testing::set_contract_address;
    use starknet::{ContractAddress, SyscallResultTrait};
    use starterpack::events::index as starterpack_events;
    use starterpack::models::index as starterpack_models;
    use crate::constants::NAMESPACE;
    use crate::systems::marketplace::{IMarketplaceDispatcher, Marketplace};
    use crate::systems::registry::{IRegistryDispatcher, Registry};
    use crate::systems::slot::{ISlotDispatcher, Slot};
    use crate::systems::social::{ISocialDispatcher, Social};
    use crate::systems::starterpack::{
        IAdministrationDispatcher, IStarterpackRegistryDispatcher, StarterpackRegistry,
    };
    use crate::systems::wallet::{IWalletDispatcher, Wallet};
    use crate::tests::mocks::account::Account;
    use crate::tests::mocks::collection::Collection;
    use crate::tests::mocks::erc20::ERC20;
    use crate::tests::mocks::starterpack_impl::StarterpackImplementation;

    // Constant

    pub fn OWNER() -> ContractAddress {
        'OWNER'.try_into().unwrap()
    }

    pub fn CREATOR() -> ContractAddress {
        'CREATOR'.try_into().unwrap()
    }

    pub fn CLIENT_RECEIVER() -> ContractAddress {
        'CLIENT_RECEIVER'.try_into().unwrap()
    }

    pub fn RECEIVER() -> ContractAddress {
        'RECEIVER'.try_into().unwrap()
    }

    pub fn SPENDER() -> ContractAddress {
        'SPENDER'.try_into().unwrap()
    }

    pub fn HOLDER() -> ContractAddress {
        'HOLDER'.try_into().unwrap()
    }

    pub fn PLAYER() -> ContractAddress {
        'PLAYER'.try_into().unwrap()
    }

    #[derive(Copy, Drop)]
    pub struct Systems {
        pub registry: IRegistryDispatcher,
        pub slot: ISlotDispatcher,
        pub social: ISocialDispatcher,
        pub wallet: IWalletDispatcher,
        pub marketplace: IMarketplaceDispatcher,
        pub starterpack: IStarterpackRegistryDispatcher,
        pub starterpack_admin: IAdministrationDispatcher,
        pub starterpack_impl: ContractAddress,
        pub erc20: IERC20Dispatcher,
    }

    #[derive(Copy, Drop)]
    pub struct Context {
        pub player_id: felt252,
        pub owner: starknet::ContractAddress,
        pub receiver: starknet::ContractAddress,
        pub spender: starknet::ContractAddress,
        pub holder: starknet::ContractAddress,
        pub creator: starknet::ContractAddress,
        pub client_receiver: starknet::ContractAddress,
    }

    #[inline]
    fn setup_namespace() -> NamespaceDef {
        NamespaceDef {
            namespace: NAMESPACE(),
            resources: [
                TestResource::Model(controller_models::m_Account::TEST_CLASS_HASH),
                TestResource::Model(controller_models::m_Controller::TEST_CLASS_HASH),
                TestResource::Model(controller_models::m_Signer::TEST_CLASS_HASH),
                TestResource::Model(provider_models::m_Deployment::TEST_CLASS_HASH),
                TestResource::Model(provider_models::m_Factory::TEST_CLASS_HASH),
                TestResource::Model(provider_models::m_Team::TEST_CLASS_HASH),
                TestResource::Model(provider_models::m_Teammate::TEST_CLASS_HASH),
                TestResource::Model(registry_models::m_Access::TEST_CLASS_HASH),
                TestResource::Model(registry_models::m_Collection::TEST_CLASS_HASH),
                TestResource::Model(registry_models::m_CollectionEdition::TEST_CLASS_HASH),
                TestResource::Model(registry_models::m_Game::TEST_CLASS_HASH),
                TestResource::Model(registry_models::m_Edition::TEST_CLASS_HASH),
                TestResource::Model(registry_models::m_Unicity::TEST_CLASS_HASH),
                TestResource::Model(social_models::m_Alliance::TEST_CLASS_HASH),
                TestResource::Model(social_models::m_Guild::TEST_CLASS_HASH),
                TestResource::Model(social_models::m_Member::TEST_CLASS_HASH),
                TestResource::Model(rbac_models::m_Moderator::TEST_CLASS_HASH),
                TestResource::Model(orderbook_models::m_Book::TEST_CLASS_HASH),
                TestResource::Model(orderbook_models::m_Order::TEST_CLASS_HASH),
                TestResource::Model(orderbook_models::m_MetadataAttribute::TEST_CLASS_HASH),
                TestResource::Model(starterpack_models::m_Config::TEST_CLASS_HASH),
                TestResource::Model(starterpack_models::m_Starterpack::TEST_CLASS_HASH),
                TestResource::Model(starterpack_models::m_Issuance::TEST_CLASS_HASH),
                TestResource::Model(starterpack_models::m_ReferralReward::TEST_CLASS_HASH),
                TestResource::Model(starterpack_models::m_GroupReward::TEST_CLASS_HASH),
                TestResource::Event(social_events::e_Follow::TEST_CLASS_HASH),
                TestResource::Event(orderbook_events::e_Listing::TEST_CLASS_HASH),
                TestResource::Event(orderbook_events::e_Sale::TEST_CLASS_HASH),
                TestResource::Event(orderbook_events::e_Offer::TEST_CLASS_HASH),
                TestResource::Event(starterpack_events::e_StarterpackRegistered::TEST_CLASS_HASH),
                TestResource::Event(starterpack_events::e_StarterpackUpdated::TEST_CLASS_HASH),
                TestResource::Event(starterpack_events::e_StarterpackIssued::TEST_CLASS_HASH),
                TestResource::Event(starterpack_events::e_StarterpackPaused::TEST_CLASS_HASH),
                TestResource::Event(starterpack_events::e_StarterpackResumed::TEST_CLASS_HASH),
                TestResource::Contract(Registry::TEST_CLASS_HASH),
                TestResource::Contract(Slot::TEST_CLASS_HASH),
                TestResource::Contract(Social::TEST_CLASS_HASH),
                TestResource::Contract(Wallet::TEST_CLASS_HASH),
                TestResource::Contract(Marketplace::TEST_CLASS_HASH),
                TestResource::Contract(StarterpackRegistry::TEST_CLASS_HASH),
            ]
                .span(),
        }
    }

    #[inline]
    fn setup_contracts(receiver: ContractAddress) -> Span<ContractDef> {
        [
            // TODO: Find a way to go through the deploy process
            ContractDefTrait::new(@NAMESPACE(), @"Registry")
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span())
                .with_init_calldata(
                    array![OWNER().into(), Collection::TEST_CLASS_HASH.into()].span(),
                ),
            ContractDefTrait::new(@NAMESPACE(), @"Slot")
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span())
                .with_init_calldata(array![].span()),
            ContractDefTrait::new(@NAMESPACE(), @"Social")
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span()),
            ContractDefTrait::new(@NAMESPACE(), @"Wallet")
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span()),
            ContractDefTrait::new(@NAMESPACE(), @"Marketplace")
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span())
                .with_init_calldata(array![0x1, 0x1F4, receiver.into(), OWNER().into()].span()),
            ContractDefTrait::new(@NAMESPACE(), @"StarterpackRegistry")
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span())
                .with_init_calldata(
                    array![5, receiver.into(), OWNER().into()].span(),
                ) // protocol_fee=5%, fee_receiver, owner
        ]
            .span()
    }

    fn setup_account(public_key: felt252) -> ContractAddress {
        let (account_address, _) = deploy_syscall(
            class_hash: Account::TEST_CLASS_HASH,
            contract_address_salt: public_key,
            calldata: [public_key].span(),
            deploy_from_zero: false,
        )
            .unwrap_syscall();
        account_address
    }

    fn setup_erc20(recipient: ContractAddress) -> IERC20Dispatcher {
        let (erc20_address, _) = deploy_syscall(
            class_hash: ERC20::TEST_CLASS_HASH,
            contract_address_salt: 'ERC20',
            calldata: [recipient.into()].span(),
            deploy_from_zero: false,
        )
            .unwrap_syscall();
        IERC20Dispatcher { contract_address: erc20_address }
    }

    #[inline]
    pub fn spawn() -> (WorldStorage, Systems, Context) {
        // [Setup] World
        set_contract_address(OWNER());
        let namespace_def = setup_namespace();
        let world = spawn_test_world(world::TEST_CLASS_HASH, [namespace_def].span());
        // [Setup] Context
        let context = Context {
            player_id: PLAYER().into(),
            owner: setup_account(OWNER().into()),
            receiver: setup_account(RECEIVER().into()),
            spender: setup_account(SPENDER().into()),
            holder: setup_account(HOLDER().into()),
            creator: setup_account(CREATOR().into()),
            client_receiver: setup_account(CLIENT_RECEIVER().into()),
        };
        world.sync_perms_and_inits(setup_contracts(context.receiver));
        // [Setup] Systems
        let (registry_address, _) = world.dns(@"Registry").unwrap();
        let (slot_address, _) = world.dns(@"Slot").unwrap();
        let (social_address, _) = world.dns(@"Social").unwrap();
        let (wallet_address, _) = world.dns(@"Wallet").unwrap();
        let (marketplace_address, _) = world.dns(@"Marketplace").unwrap();
        let (starterpack_address, _) = world.dns(@"StarterpackRegistry").unwrap();
        let starterpack_impl = setup_starterpack_impl();
        let systems = Systems {
            registry: IRegistryDispatcher { contract_address: registry_address },
            slot: ISlotDispatcher { contract_address: slot_address },
            social: ISocialDispatcher { contract_address: social_address },
            wallet: IWalletDispatcher { contract_address: wallet_address },
            marketplace: IMarketplaceDispatcher { contract_address: marketplace_address },
            starterpack: IStarterpackRegistryDispatcher { contract_address: starterpack_address },
            starterpack_admin: IAdministrationDispatcher { contract_address: starterpack_address },
            starterpack_impl: starterpack_impl,
            erc20: setup_erc20(context.spender),
        };

        // [Return]
        (world, systems, context)
    }

    fn setup_starterpack_impl() -> ContractAddress {
        let (impl_address, _) = deploy_syscall(
            class_hash: StarterpackImplementation::TEST_CLASS_HASH,
            contract_address_salt: 'STARTERPACK_IMPL',
            calldata: [].span(),
            deploy_from_zero: false,
        )
            .unwrap_syscall();
        impl_address
    }
}
