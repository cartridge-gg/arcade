pub mod setup {
    use dojo::world::{WorldStorage, WorldStorageTrait, world};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };
    use openzeppelin::interfaces::accounts::ISRC6Dispatcher;
    use openzeppelin::presets::account::AccountUpgradeable;
    use starknet::syscalls::deploy_syscall;
    use starknet::{ContractAddress, SyscallResultTrait};
    use crate::events::index as events;
    use crate::models::index as bundle_models;
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

    pub fn ALLOWER() -> ContractAddress {
        0.try_into().unwrap()
    }

    pub fn METADATA() -> ByteArray {
        "BUNDLE_METADATA"
    }

    #[derive(Copy, Drop)]
    pub struct Systems {
        pub contract: ContractTraitDispatcher,
        pub allower: ISRC6Dispatcher,
    }

    #[inline]
    fn setup_namespace() -> NamespaceDef {
        NamespaceDef {
            namespace: NAMESPACE(),
            resources: [
                TestResource::Model(bundle_models::m_Bundle::TEST_CLASS_HASH),
                TestResource::Model(bundle_models::m_BundleIssuance::TEST_CLASS_HASH),
                TestResource::Model(bundle_models::m_BundleReferral::TEST_CLASS_HASH),
                TestResource::Model(bundle_models::m_BundleGroup::TEST_CLASS_HASH),
                TestResource::Model(bundle_models::m_BundleVoucher::TEST_CLASS_HASH),
                TestResource::Event(events::e_BundleRegistered::TEST_CLASS_HASH),
                TestResource::Event(events::e_BundleUpdated::TEST_CLASS_HASH),
                TestResource::Event(events::e_BundleIssued::TEST_CLASS_HASH),
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

    fn setup_account() -> ContractAddress {
        let (account_address, _) = deploy_syscall(
            class_hash: AccountUpgradeable::TEST_CLASS_HASH,
            contract_address_salt: 'ALLOWER_ACCOUNT',
            calldata: [0x773269bac247154a75fd12b5c8e307baac1c520c6654b1227bae0e47e47939a].span(),
            deploy_from_zero: false,
        )
            .unwrap_syscall();
        account_address
    }

    #[inline]
    pub fn spawn() -> (WorldStorage, Systems) {
        let namespace_def = setup_namespace();
        let world = spawn_test_world(world::TEST_CLASS_HASH, [namespace_def].span());
        world.sync_perms_and_inits(setup_contracts());
        let allower = setup_account();

        let (contract_address, _) = world.dns(@CONTRACT()).expect('Contract not found');
        let systems = Systems {
            contract: ContractTraitDispatcher { contract_address },
            allower: ISRC6Dispatcher { contract_address: allower },
        };

        (world, systems)
    }
}
