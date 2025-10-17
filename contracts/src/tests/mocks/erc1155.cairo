#[starknet::contract]
pub mod ERC1155 {
    use core::num::traits::Zero;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::common::erc2981::ERC2981Component;
    use openzeppelin::token::erc1155::{ERC1155Component, ERC1155HooksEmptyImpl};

    const TOKEN_ID: u256 = 1;
    const QUANTITY: u256 = 10;

    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: ERC1155Component, storage: erc1155, event: ERC1155Event);
    component!(path: ERC2981Component, storage: erc2981, event: ERC2981Event);

    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;
    impl SRC5InternalImpl = SRC5Component::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl ERC1155Impl = ERC1155Component::ERC1155Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC1155CamelOnlyImpl = ERC1155Component::ERC1155CamelImpl<ContractState>;
    impl ERC1155InternalImpl = ERC1155Component::InternalImpl<ContractState>;
    #[abi(embed_v0)]
    impl ERC2981Impl = ERC2981Component::ERC2981Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC2981InfoImpl = ERC2981Component::ERC2981InfoImpl<ContractState>;
    impl ERC2981InternalImpl = ERC2981Component::InternalImpl<ContractState>;

    impl ERC2981ImmutableConfig of ERC2981Component::ImmutableConfig {
        const FEE_DENOMINATOR: u128 = 10000;
    }

    #[storage]
    struct Storage {
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        erc1155: ERC1155Component::Storage,
        #[substorage(v0)]
        erc2981: ERC2981Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        ERC1155Event: ERC1155Component::Event,
        #[flat]
        ERC2981Event: ERC2981Component::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        recipient: starknet::ContractAddress,
        creator: starknet::ContractAddress,
    ) {
        self.erc1155.initializer(Default::default());
        self.erc1155.update(Zero::zero(), recipient, [TOKEN_ID].span(), [QUANTITY].span());
        self.erc2981.initializer(creator, 500);
    }
}
