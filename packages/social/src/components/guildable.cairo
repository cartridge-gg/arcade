#[starknet::component]
pub mod GuildableComponent {
    // Dojo imports

    use dojo::world::{IWorldDispatcherTrait, WorldStorage};
    use social::models::guild::{GuildAssert, GuildTrait};
    use social::models::member::{MemberAssert, MemberTrait};

    // Internal imports

    use social::store::StoreTrait;
    use social::types::role::Role;

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
        fn create(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            metadata: ByteArray,
            socials: ByteArray,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Member does not belong to a guild
            let mut member = store.get_member(player_id);
            member.assert_can_join();

            // [Effect] Create a guild
            let guild_id = world.dispatcher.uuid();
            let mut guild = GuildTrait::new(guild_id, metadata, socials);

            // [Effect] Member joins guild
            member.join(guild_id);
            guild.hire();

            // [Effect] Member becomes guild master
            member.crown();

            // [Effect] Store entities
            store.set_member(@member);
            store.set_guild(@guild);
        }

        fn open(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            free: bool,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Caller exists and is allowed
            let admin = store.get_member(player_id);
            admin.assert_is_allowed(Role::Officer);

            // [Effect] Guild opens
            let mut guild = store.get_guild(admin.guild_id);
            guild.open(free);

            // [Effect] Store entities
            store.set_guild(@guild);
        }

        fn close(self: @ComponentState<TContractState>, world: WorldStorage, player_id: felt252) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Caller exists and is allowed
            let admin = store.get_member(player_id);
            admin.assert_is_allowed(Role::Officer);

            // [Effect] Guild closes
            let mut guild = store.get_guild(admin.guild_id);
            guild.close();

            // [Effect] Store entities
            store.set_guild(@guild);
        }

        fn crown(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            member_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Caller exists and is allowed
            let mut master = store.get_member(player_id);
            master.assert_is_allowed(Role::Master);

            // [Check] Member is in the same guild
            let mut member = store.get_member(member_id);
            member.assert_same_guild(master.guild_id);

            // [Effect] Transfer the master role
            master.uncrown();
            member.crown();

            // [Effect] Store entities
            store.set_member(@master);
            store.set_member(@member);
        }

        fn promote(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            member_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Caller exists and is allowed
            let admin = store.get_member(player_id);
            admin.assert_is_allowed(Role::Officer);

            // [Check] Member is in the same guild
            let mut member = store.get_member(member_id);
            member.assert_same_guild(admin.guild_id);

            // [Effect] Guild promotes a member
            member.promote();

            // [Effect] Store entities
            store.set_member(@member);
        }

        fn demote(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            member_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Caller exists and is allowed
            let master = store.get_member(player_id);
            master.assert_is_allowed(Role::Master);

            // [Check] Member is in the same guild
            let mut member = store.get_member(member_id);
            member.assert_same_guild(master.guild_id);

            // [Effect] Guild demotes a member
            member.demote();

            // [Effect] Store entities
            store.set_member(@member);
        }

        fn hire(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            member_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Caller exists and is allowed
            let admin = store.get_member(player_id);
            admin.assert_is_allowed(Role::Officer);

            // [Check] Guild is open
            let mut guild = store.get_guild(admin.guild_id);
            guild.assert_is_open();

            // [Effect] Member joins the guild and guild hires a member
            let mut member = store.get_member(member_id);
            member.join(guild.id);
            guild.hire();

            // [Effect] Store entities
            store.set_guild(@guild);
            store.set_member(@member);
        }

        fn fire(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            member_id: felt252,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Caller exists and is allowed
            let admin = store.get_member(player_id);
            admin.assert_is_allowed(Role::Officer);

            // [Check] Admin has authority over the member
            let mut member = store.get_member(member_id);
            admin.assert_has_authority(member.role.into());

            // [Check] Members are in the same guild
            member.assert_same_guild(admin.guild_id);

            // [Effect] Guild fire a member
            let mut guild = store.get_guild(admin.guild_id);
            guild.fire();

            // [Effect] Member leaves the guild
            member.leave();

            // [Effect] Store entities
            store.set_guild(@guild);
            store.set_member(@member);
        }

        fn request(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            guild_id: u32,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Guild exists
            let mut guild = store.get_guild(guild_id);
            guild.assert_does_exist();

            // [Check] Guild is open
            guild.assert_is_open();

            // [Effect] Member requests to join the guild
            let mut member = store.get_member(player_id);
            member.request(guild_id);

            // [Effect] Member joins the guild if it is free
            if guild.free {
                // [Effect] Member joins the guild
                member.join(guild_id);
                // [Effect] Guild hires a member
                guild.hire();
                store.set_guild(@guild);
            }

            // [Effect] Store entities
            store.set_member(@member);
        }

        fn cancel(self: @ComponentState<TContractState>, world: WorldStorage, player_id: felt252) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Effect] Member cancels the request
            let mut member = store.get_member(player_id);
            member.cancel();

            // [Effect] Store entities
            store.set_member(@member);
        }

        fn leave(self: @ComponentState<TContractState>, world: WorldStorage, player_id: felt252) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Effect] Member leaves the guild
            let mut member = store.get_member(player_id);
            member.leave();

            // [Effect] Store entities
            store.set_member(@member);
        }
    }
}
