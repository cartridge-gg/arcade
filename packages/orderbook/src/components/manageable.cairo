#[starknet::component]
pub mod ManageableComponent {
    // Starknet imports

    // Dojo imports

    use dojo::world::WorldStorage;

    // Internal imports

    use orderbook::constants::BOOK_ID;
    use orderbook::models::book::{BookAssert, BookTrait};
    use orderbook::models::moderator::{ModeratorAssert, ModeratorTrait};
    use orderbook::store::StoreTrait;
    use orderbook::types::role::Role;
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
            world: WorldStorage,
            royalties: bool,
            fee_num: u32,
            fee_receiver: ContractAddress,
            owner: ContractAddress,
        ) {
            // [Effect] Initialize moderator
            let mut store = StoreTrait::new(world);
            let moderator = ModeratorTrait::new(owner.into(), Role::Owner);
            store.set_moderator(@moderator);
            // [Effect] Initialize book
            let mut store = StoreTrait::new(world);
            let book = BookTrait::new(BOOK_ID, royalties, fee_num, fee_receiver.into());
            store.set_book(@book);
        }

        fn grant_role(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            account: ContractAddress,
            role_id: u8,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);
            // [Check] Caller is allowed
            let caller_moderator = store.moderator(starknet::get_caller_address().into());
            let role: Role = role_id.into();
            caller_moderator.assert_is_allowed(role);
            // [Effect] Grant role
            let mut moderator = store.moderator(account.into());
            moderator.grant(role);
            // [Effect] Store moderator
            store.set_moderator(@moderator);
        }

        fn revoke_role(
            self: @ComponentState<TContractState>, world: WorldStorage, account: ContractAddress,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);
            // [Check] Caller is allowed
            let caller_moderator = store.moderator(starknet::get_caller_address().into());
            caller_moderator.assert_is_allowed(Role::Owner);
            // [Effect] Grant role
            let mut moderator = store.moderator(account.into());
            moderator.revoke();
            // [Effect] Store moderator
            store.set_moderator(@moderator);
        }

        fn pause(self: @ComponentState<TContractState>, world: WorldStorage) {
            // [Check] Caller is allowed
            let mut store = StoreTrait::new(world);
            let caller_moderator = store.moderator(starknet::get_caller_address().into());
            caller_moderator.assert_is_allowed(Role::Admin);
            // [Effect] Pause component
            let mut book = store.book(BOOK_ID);
            book.pause();
            // [Update] Book
            store.set_book(@book);
        }

        fn resume(self: @ComponentState<TContractState>, world: WorldStorage) {
            // [Check] Caller is allowed
            let mut store = StoreTrait::new(world);
            let caller_moderator = store.moderator(starknet::get_caller_address().into());
            caller_moderator.assert_is_allowed(Role::Admin);
            // [Effect] Resume component
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
            let mut store = StoreTrait::new(world);
            let caller_moderator = store.moderator(starknet::get_caller_address().into());
            caller_moderator.assert_is_allowed(Role::Owner);
            // [Effect] Set fee
            let mut book = store.book(BOOK_ID);
            book.set_fee(fee_num, fee_receiver.into());
            // [Update] Book
            store.set_book(@book);
        }

        fn set_royalties(
            self: @ComponentState<TContractState>, world: WorldStorage, enabled: bool,
        ) {
            // [Check] Caller is allowed
            let mut store = StoreTrait::new(world);
            let caller_moderator = store.moderator(starknet::get_caller_address().into());
            caller_moderator.assert_is_allowed(Role::Owner);
            // [Effect] Set royalties
            let mut book = store.book(BOOK_ID);
            book.set_royalties(enabled);
            // [Update] Book
            store.set_book(@book);
        }
    }
}
