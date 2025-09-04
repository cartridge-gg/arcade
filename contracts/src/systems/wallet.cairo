// Interfaces

#[starknet::interface]
pub trait IWallet<TContractState> {}

// Contracts

#[dojo::contract]
pub mod Wallet {
    // Dojo imports

    // Internal imports

    use arcade::constants::NAMESPACE;

    // Component imports

    use controller::components::controllable::ControllableComponent;
    use dojo::world::WorldStorage;

    // Local imports

    use super::IWallet;

    // Components

    component!(path: ControllableComponent, storage: controllable, event: ControllableEvent);
    impl ControllableInternalImpl = ControllableComponent::InternalImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        controllable: ControllableComponent::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ControllableEvent: ControllableComponent::Event,
    }

    // Implementations

    #[abi(embed_v0)]
    impl WalletImpl of IWallet<ContractState> {}

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
