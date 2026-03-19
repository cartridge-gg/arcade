pub mod setup {
    // Imports

    use dojo::world::{WorldStorageTrait, world};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };
    use starknet::syscalls::deploy_syscall;
    use starknet::{ContractAddress, SyscallResultTrait};
    use crate::events::index as events;
    use crate::models::index as models;
    use crate::tests::mocks::implementation::MerkleDropImplementation;
    use crate::tests::mocks::registry::{IRegistryDispatcher, NAMESPACE, Registry};

    #[derive(Copy, Drop)]
    pub struct Systems {
        pub registry: IRegistryDispatcher,
        pub implementation: ContractAddress,
    }

    #[inline]
    fn setup_namespace() -> NamespaceDef {
        NamespaceDef {
            namespace: NAMESPACE(),
            resources: [
                TestResource::Model(models::m_MerkleTree::TEST_CLASS_HASH),
                TestResource::Model(models::m_MerkleClaim::TEST_CLASS_HASH),
                TestResource::Event(events::e_MerkleProofs::TEST_CLASS_HASH),
                TestResource::Contract(Registry::TEST_CLASS_HASH),
            ]
                .span(),
        }
    }

    fn setup_contracts() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@NAMESPACE(), @"Merkledrop")
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span()),
        ]
            .span()
    }

    fn setup_implementation() -> ContractAddress {
        let (impl_address, _) = deploy_syscall(
            class_hash: MerkleDropImplementation::TEST_CLASS_HASH,
            contract_address_salt: 'MERKLEDROP_IMPL',
            calldata: [].span(),
            deploy_from_zero: false,
        )
            .unwrap_syscall();
        impl_address
    }

    #[inline]
    pub fn spawn() -> Systems {
        // [Setup] World
        let namespace_def = setup_namespace();
        let world = spawn_test_world(world::TEST_CLASS_HASH, [namespace_def].span());
        world.sync_perms_and_inits(setup_contracts());

        // [Setup] Systems
        let (merkledrop_address, _) = world.dns(@"Merkledrop").expect('Merkledrop not found');
        let implementation = setup_implementation();
        Systems {
            registry: IRegistryDispatcher { contract_address: merkledrop_address }, implementation,
        }
    }
}
