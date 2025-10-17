#[starknet::component]
pub mod ManageableComponent {
    // Starknet imports

    // Dojo imports

    use dojo::world::WorldStorage;

    // Shared RBAC imports
    use models::rbac::models::moderator::{ModeratorAssert, ModeratorTrait};
    use models::rbac::store::ModeratorStoreTrait;
    use models::rbac::types::role::Role;

    // Internal imports

    use orderbook::constants::BOOK_ID;
    use orderbook::models::book::{BookAssert, BookTrait};
    use orderbook::store::StoreTrait;
    use starknet::ContractAddress;

    // Constants

    pub const ADMIN_ROLE: felt252 = 'ADMIN_ROLE';

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
            mut world: WorldStorage,
            royalties: bool,
            fee_num: u32,
            fee_receiver: ContractAddress,
            owner: ContractAddress,
        ) {
            // [Effect] Initialize moderator
            let moderator = ModeratorTrait::new(owner.into(), Role::Owner);
            ModeratorStoreTrait::set_moderator(world, @moderator);

            // [Effect] Initialize book
            let mut store = StoreTrait::new(world);
            let book = BookTrait::new(BOOK_ID, royalties, fee_num, fee_receiver.into());
            store.set_book(@book);
        }

        fn grant_role(
            self: @ComponentState<TContractState>,
            mut world: WorldStorage,
            account: ContractAddress,
            role_id: u8,
        ) {
            // [Check] Caller is allowed
            let caller_address: felt252 = starknet::get_caller_address().into();
            let caller_moderator = ModeratorStoreTrait::moderator(world, caller_address);
            let role: Role = role_id.into();
            caller_moderator.assert_is_allowed(role);
            // [Effect] Grant role
            let account_address: felt252 = account.into();
            let mut moderator = ModeratorStoreTrait::moderator(world, account_address);
            moderator.grant(role);
            // [Effect] Store moderator
            ModeratorStoreTrait::set_moderator(world, @moderator);
        }

        fn revoke_role(
            self: @ComponentState<TContractState>,
            mut world: WorldStorage,
            account: ContractAddress,
        ) {
            // [Check] Caller is allowed
            let caller_address: felt252 = starknet::get_caller_address().into();
            let caller_moderator = ModeratorStoreTrait::moderator(world, caller_address);
            caller_moderator.assert_is_allowed(Role::Owner);
            // [Effect] Revoke role
            let account_address: felt252 = account.into();
            let mut moderator = ModeratorStoreTrait::moderator(world, account_address);
            moderator.revoke();
            // [Effect] Store moderator
            ModeratorStoreTrait::set_moderator(world, @moderator);
        }

        fn pause(self: @ComponentState<TContractState>, world: WorldStorage) {
            // [Check] Caller is allowed
            let caller_address: felt252 = starknet::get_caller_address().into();
            let caller_moderator = ModeratorStoreTrait::moderator(world, caller_address);
            caller_moderator.assert_is_allowed(Role::Admin);
            // [Effect] Pause component
            let mut store = StoreTrait::new(world);
            let mut book = store.book(BOOK_ID);
            book.pause();
            // [Update] Book
            store.set_book(@book);
        }

        fn resume(self: @ComponentState<TContractState>, world: WorldStorage) {
            // [Check] Caller is allowed
            let caller_address: felt252 = starknet::get_caller_address().into();
            let caller_moderator = ModeratorStoreTrait::moderator(world, caller_address);
            caller_moderator.assert_is_allowed(Role::Admin);
            // [Effect] Resume component
            let mut store = StoreTrait::new(world);
            let mut book = store.book(BOOK_ID);
            book.resume();
            // [Update] Book
            store.set_book(@book);
        }

        fn set_fee(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            fee_num: u32,
            fee_receiver: ContractAddress,
        ) {
            // [Check] Caller is allowed
            let caller_address: felt252 = starknet::get_caller_address().into();
            let caller_moderator = ModeratorStoreTrait::moderator(world, caller_address);
            caller_moderator.assert_is_allowed(Role::Owner);
            // [Effect] Set fee
            let mut store = StoreTrait::new(world);
            let mut book = store.book(BOOK_ID);
            book.set_fee(fee_num, fee_receiver.into());
            // [Update] Book
            store.set_book(@book);
        }

        fn set_royalties(
            self: @ComponentState<TContractState>, world: WorldStorage, enabled: bool,
        ) {
            // [Check] Caller is allowed
            let caller_address: felt252 = starknet::get_caller_address().into();
            let caller_moderator = ModeratorStoreTrait::moderator(world, caller_address);
            caller_moderator.assert_is_allowed(Role::Owner);
            // [Effect] Set royalties
            let mut store = StoreTrait::new(world);
            let mut book = store.book(BOOK_ID);
            book.set_royalties(enabled);
            // [Update] Book
            store.set_book(@book);
        }
    }
}
