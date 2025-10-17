#[starknet::contract]
pub mod ERC721 {
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::common::erc2981::ERC2981Component;
    use openzeppelin::token::erc721::{ERC721Component, ERC721HooksEmptyImpl};

    const TOKEN_ID: u256 = 1;

    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: ERC2981Component, storage: erc2981, event: ERC2981Event);

    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;
    impl SRC5InternalImpl = SRC5Component::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl ERC721Impl = ERC721Component::ERC721Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC721CamelOnlyImpl = ERC721Component::ERC721CamelOnlyImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;
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
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        erc2981: ERC2981Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        ERC2981Event: ERC2981Component::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        recipient: starknet::ContractAddress,
        creator: starknet::ContractAddress,
    ) {
        self.erc721.initializer("Token", "TOKEN", Default::default());
        self.erc721.mint(recipient, TOKEN_ID);
        self.erc2981.initializer(creator, 500);
    }
}
