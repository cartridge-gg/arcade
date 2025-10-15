pub mod setup {
    // Starknet imports

    use achievement::events::index as achievement_events;
    // use collection::collection::Collection;

    // Internal imports

    use arcade::constants::NAMESPACE;
    use arcade::systems::marketplace::{IMarketplaceDispatcher, Marketplace};
    use arcade::systems::registry::{IRegistryDispatcher, Registry};
    use arcade::systems::slot::{ISlotDispatcher, Slot};
    use arcade::systems::social::{ISocialDispatcher, Social};
    use arcade::systems::wallet::{IWalletDispatcher, Wallet};
    use arcade::tests::mocks::account::Account;
    use arcade::tests::mocks::collection::Collection;
    use arcade::tests::mocks::erc1155::ERC1155;
    use arcade::tests::mocks::erc20::ERC20;
    use arcade::tests::mocks::erc721::ERC721;

    // External imports

    use controller::models::{index as controller_models};

    // Dojo imports

    use dojo::world::{WorldStorage, WorldStorageTrait, world};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };
    use models::rbac::models::index as rbac_models;
    use openzeppelin_token::erc1155::interface::IERC1155Dispatcher;
    use openzeppelin_token::erc20::interface::IERC20Dispatcher;
    use openzeppelin_token::erc721::interface::IERC721Dispatcher;
    use orderbook::events::index as orderbook_events;
    use orderbook::models::index as orderbook_models;
    use provider::models::index as provider_models;
    use registry::models::index as registry_models;
    use social::events::index as social_events;
    use social::models::index as social_models;
    use starknet::syscalls::deploy_syscall;
    use starknet::testing::set_contract_address;
    use starknet::{ContractAddress, SyscallResultTrait};

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
        pub erc20: IERC20Dispatcher,
        pub erc721: IERC721Dispatcher,
        pub erc1155: IERC1155Dispatcher,
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
                TestResource::Event(social_events::e_Follow::TEST_CLASS_HASH),
                TestResource::Event(achievement_events::e_TrophyPinning::TEST_CLASS_HASH),
                TestResource::Event(orderbook_events::e_Listing::TEST_CLASS_HASH),
                TestResource::Event(orderbook_events::e_Sale::TEST_CLASS_HASH),
                TestResource::Event(orderbook_events::e_Offer::TEST_CLASS_HASH),
                TestResource::Contract(Registry::TEST_CLASS_HASH),
                TestResource::Contract(Slot::TEST_CLASS_HASH),
                TestResource::Contract(Social::TEST_CLASS_HASH),
                TestResource::Contract(Wallet::TEST_CLASS_HASH),
                TestResource::Contract(Marketplace::TEST_CLASS_HASH),
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
        ]
            .span()
    }

    fn setup_account(public_key: felt252) -> ContractAddress {
        let (account_address, _) = deploy_syscall(
            class_hash: Account::TEST_CLASS_HASH.try_into().unwrap(),
            contract_address_salt: public_key,
            calldata: [public_key].span(),
            deploy_from_zero: false,
        )
            .unwrap_syscall();
        account_address
    }

    fn setup_erc20(recipient: ContractAddress) -> IERC20Dispatcher {
        let (erc20_address, _) = deploy_syscall(
            class_hash: ERC20::TEST_CLASS_HASH.try_into().unwrap(),
            contract_address_salt: 'ERC20',
            calldata: [recipient.into()].span(),
            deploy_from_zero: false,
        )
            .unwrap_syscall();
        IERC20Dispatcher { contract_address: erc20_address }
    }

    fn setup_erc721(recipient: ContractAddress, creator: ContractAddress) -> IERC721Dispatcher {
        let (erc721_address, _) = deploy_syscall(
            class_hash: ERC721::TEST_CLASS_HASH.try_into().unwrap(),
            contract_address_salt: 'ERC721',
            calldata: [recipient.into(), creator.into()].span(),
            deploy_from_zero: false,
        )
            .unwrap_syscall();
        IERC721Dispatcher { contract_address: erc721_address }
    }

    fn setup_erc1155(recipient: ContractAddress, creator: ContractAddress) -> IERC1155Dispatcher {
        let (erc1155_address, _) = deploy_syscall(
            class_hash: ERC1155::TEST_CLASS_HASH.try_into().unwrap(),
            contract_address_salt: 'ERC1155',
            calldata: [recipient.into(), creator.into()].span(),
            deploy_from_zero: false,
        )
            .unwrap_syscall();
        IERC1155Dispatcher { contract_address: erc1155_address }
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
        let systems = Systems {
            registry: IRegistryDispatcher { contract_address: registry_address },
            slot: ISlotDispatcher { contract_address: slot_address },
            social: ISocialDispatcher { contract_address: social_address },
            wallet: IWalletDispatcher { contract_address: wallet_address },
            marketplace: IMarketplaceDispatcher { contract_address: marketplace_address },
            erc20: setup_erc20(context.spender),
            erc721: setup_erc721(context.holder, context.creator),
            erc1155: setup_erc1155(context.holder, context.creator),
        };

        // [Return]
        (world, systems, context)
    }
}
