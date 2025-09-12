#[starknet::component]
pub mod InitializableComponent {
    // Starknet imports

    // Dojo imports

    use dojo::world::WorldStorage;

    // Internal imports

    use registry::constants::{COLLECTION_ID, COLLECTION_NAME, COLLECTION_SYMBOL};
    use registry::models::access::AccessTrait;
    use registry::models::collection::CollectionTrait;
    use registry::store::StoreTrait;
    use registry::types::role::Role;
    use starknet::syscalls::deploy_syscall;
    use starknet::{
        ClassHash, ContractAddress, SyscallResultTrait, get_contract_address, get_tx_info,
    };

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn initialize(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            owner: ContractAddress,
            class_hash: ClassHash,
        ) {
            // [Effect] Initialize component
            let mut store = StoreTrait::new(world);
            let access = AccessTrait::new(owner.into(), Role::Owner);
            store.set_access(@access);

            // [Effect] Initialize collection
            let minter_address = get_contract_address();
            let salt = get_tx_info().transaction_hash;
            let mut calldata: Array<felt252> = array![];
            Serde::serialize(@COLLECTION_NAME(), ref calldata);
            Serde::serialize(@COLLECTION_SYMBOL(), ref calldata);
            calldata.append(minter_address.into());
            calldata.append(owner.into());
            let (collection_address, _) = deploy_syscall(
                class_hash: class_hash,
                contract_address_salt: salt + COLLECTION_ID,
                calldata: calldata.span(),
                deploy_from_zero: false,
            )
                .unwrap_syscall();
            let collection = CollectionTrait::new(COLLECTION_ID, collection_address);
            store.set_collection(@collection);
        }
    }
}
