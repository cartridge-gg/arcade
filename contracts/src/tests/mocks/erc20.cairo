#[starknet::contract]
pub mod ERC20 {
    use openzeppelin_token::erc20::{ERC20Component, ERC20HooksEmptyImpl};

    const AMOUNT: u256 = 10_000_000_000_000_000_000; // 10 ETH

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    #[abi(embed_v0)]
    impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC20CamelOnlyImpl = ERC20Component::ERC20CamelOnlyImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, recipient: starknet::ContractAddress) {
        self.erc20.initializer("Ether", "ETH");
        self.erc20.mint(recipient, AMOUNT);
    }
}
