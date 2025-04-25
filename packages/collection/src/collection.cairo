#[starknet::contract]
mod Collection {
    use starknet::ContractAddress;
    use openzeppelin_upgrades::UpgradeableComponent;
    use openzeppelin_upgrades::interface::IUpgradeable;
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_introspection::src5::SRC5Component;
    use openzeppelin_token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use openzeppelin_token::erc721::interface::IERC721Metadata;
    use collection::components::mintable::mintable::MintableComponent;
    use collection::components::erc4906::erc4906::ERC4906Component;
    use collection::components::erc7572::erc7572::ERC7572Component;
    use collection::types::contract_metadata::ContractMetadata;
    use collection::interface::{CollectionTrait, MinterDispatcher, MinterDispatcherTrait};

    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: MintableComponent, storage: mintable, event: MintableEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: ERC4906Component, storage: erc4906, event: ERC4906Event);
    component!(path: ERC7572Component, storage: erc7572, event: ERC7572Event);

    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableTwoStepMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl MintableImpl = MintableComponent::MintableImpl<ContractState>;
    impl MintableInternalImpl = MintableComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;
    impl SRC5InternalImpl = SRC5Component::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl ERC721Impl = ERC721Component::ERC721Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC721CamelOnlyImpl = ERC721Component::ERC721CamelOnlyImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    impl ERC4906InternalImpl = ERC4906Component::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl ERC7572Impl = ERC7572Component::ERC7572Impl<ContractState>;
    impl ERC7572InternalImpl = ERC7572Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        mintable: MintableComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        erc7572: ERC7572Component::Storage,
        #[substorage(v0)]
        erc4906: ERC4906Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        MintableEvent: MintableComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        ERC7572Event: ERC7572Component::Event,
        #[flat]
        ERC4906Event: ERC4906Component::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: ByteArray,
        symbol: ByteArray,
        minter: ContractAddress,
        owner: ContractAddress,
    ) {
        self.ownable.initializer(owner);
        self.mintable.initializer(minter);
        self.erc721.initializer(name, symbol, Default::default());
        self.erc4906.initializer();
        self.erc7572.initializer();
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        /// Upgrades the contract class hash to `new_class_hash`.
        /// This may only be called by the contract owner.
        fn upgrade(ref self: ContractState, new_class_hash: starknet::ClassHash) {
            self.ownable.assert_only_owner();
            self.upgradeable.upgrade(new_class_hash);
        }
    }

    #[abi(embed_v0)]
    impl MetadataImpl of IERC721Metadata<ContractState> {
        fn name(self: @ContractState) -> ByteArray {
            self.erc721.name()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.erc721.symbol()
        }

        fn token_uri(self: @ContractState, token_id: u256) -> ByteArray {
            let minter_address = self.mintable.minter();
            let minter = MinterDispatcher { contract_address: minter_address };
            minter.token_uri(token_id)
        }
    }

    #[abi(embed_v0)]
    pub impl CollectionImpl of CollectionTrait<ContractState> {
        fn assert_token_owner(self: @ContractState, caller: ContractAddress, token_id: u256) {
            // [Checks] Token must be owned by the caller
            let owner = self.erc721._require_owned(token_id);
            assert(owner == caller, ERC721Component::Errors::UNAUTHORIZED);
        }

        fn assert_token_authorized(self: @ContractState, caller: ContractAddress, token_id: u256) {
            // [Checks] Token must be owned or authorized by the caller
            let owner = self.erc721.owner_of(token_id);
            self.erc721._check_authorized(owner, caller, token_id);
        }

        fn mint(ref self: ContractState, to: ContractAddress, token_id: u256) {
            // [Checks] Only minter
            self.mintable.assert_only_minter();
            // [Effect] Mint token
            self.erc721.mint(to, token_id);
            // [Event] Mint token
            self.erc4906.update_metadata(token_id);
        }

        fn burn(ref self: ContractState, token_id: u256) {
            // [Check] Only token owner
            self.mintable.assert_only_minter();
            // [Effect] Burn token
            self.erc721.burn(token_id);
        }

        fn update_token_metadata(ref self: ContractState, token_id: u256) {
            // [Check] Only minter
            self.mintable.assert_only_minter();
            // [Event] Update token metadata
            self.erc4906.update_metadata(token_id);
        }

        fn set_contract_metadata(ref self: ContractState, metadata: ContractMetadata) {
            // [Checks] Only owner
            self.ownable.assert_only_owner();
            // [Effect] Set contract metadata
            self.erc7572.set_contract_metadata(metadata);
        }
    }
}
