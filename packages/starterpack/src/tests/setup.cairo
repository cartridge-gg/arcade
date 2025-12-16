pub mod setup {
    // Imports

    use dojo::world::{WorldStorage, WorldStorageTrait, world};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };
    use models::rbac::models::index as rbac_models;
    use openzeppelin::token::erc20::interface::IERC20Dispatcher;
    use starknet::syscalls::deploy_syscall;
    use starknet::testing::set_contract_address;
    use starknet::{ContractAddress, SyscallResultTrait};
    use crate::events::index as starterpack_events;
    use crate::models::index as starterpack_models;
    use crate::tests::mocks::account::Account;
    use crate::tests::mocks::erc20::ERC20;
    use crate::tests::mocks::implementation::StarterpackImplementation;
    use crate::tests::mocks::registry::{
        IAdministrationDispatcher, IRegistryDispatcher, NAMESPACE, Registry,
    };
    use crate::types::item::ItemTrait;
    use crate::types::metadata::MetadataTrait;

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

    pub fn METADATA() -> ByteArray {
        MetadataTrait::new(
            name: "Test Pack",
            description: "Test",
            image_uri: "https://example.com/image.png",
            items: [
                ItemTrait::new(
                    name: "Starter Item",
                    description: "A basic starter item",
                    image_uri: "https://example.com/item.png",
                ),
            ]
                .span(),
            tokens: array![].span(),
        )
            .jsonify()
    }

    #[derive(Copy, Drop)]
    pub struct Systems {
        pub starterpack: IRegistryDispatcher,
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
                TestResource::Model(rbac_models::m_Moderator::TEST_CLASS_HASH),
                TestResource::Model(starterpack_models::m_Config::TEST_CLASS_HASH),
                TestResource::Model(starterpack_models::m_Starterpack::TEST_CLASS_HASH),
                TestResource::Model(starterpack_models::m_Issuance::TEST_CLASS_HASH),
                TestResource::Model(starterpack_models::m_ReferralReward::TEST_CLASS_HASH),
                TestResource::Model(starterpack_models::m_GroupReward::TEST_CLASS_HASH),
                TestResource::Event(starterpack_events::e_StarterpackRegistered::TEST_CLASS_HASH),
                TestResource::Event(starterpack_events::e_StarterpackUpdated::TEST_CLASS_HASH),
                TestResource::Event(starterpack_events::e_StarterpackIssued::TEST_CLASS_HASH),
                TestResource::Event(starterpack_events::e_StarterpackPaused::TEST_CLASS_HASH),
                TestResource::Event(starterpack_events::e_StarterpackResumed::TEST_CLASS_HASH),
                TestResource::Contract(Registry::TEST_CLASS_HASH),
            ]
                .span(),
        }
    }

    #[inline]
    fn setup_contracts(receiver: ContractAddress) -> Span<ContractDef> {
        [
            ContractDefTrait::new(@NAMESPACE(), @"Registry")
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

    fn setup_implementation() -> ContractAddress {
        let (impl_address, _) = deploy_syscall(
            class_hash: StarterpackImplementation::TEST_CLASS_HASH,
            contract_address_salt: 'STARTERPACK_IMPL',
            calldata: [].span(),
            deploy_from_zero: false,
        )
            .unwrap_syscall();
        impl_address
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
        let (starterpack_address, _) = world.dns(@"Registry").unwrap();
        let implementation = setup_implementation();
        let systems = Systems {
            starterpack: IRegistryDispatcher { contract_address: starterpack_address },
            starterpack_admin: IAdministrationDispatcher { contract_address: starterpack_address },
            starterpack_impl: implementation,
            erc20: setup_erc20(context.spender),
        };

        // [Return]
        (world, systems, context)
    }
}
