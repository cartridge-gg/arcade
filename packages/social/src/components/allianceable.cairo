#[starknet::component]
pub mod AllianceableComponent {
    // Dojo imports

    use dojo::world::{IWorldDispatcherTrait, WorldStorage};
    use social::models::alliance::{AllianceAssert, AllianceTrait};
    use social::models::guild::{GuildAssert, GuildTrait};
    use social::models::member::MemberAssert;

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

            // [Check] Member is a guild master
            let member = store.get_member(player_id);
            member.assert_is_allowed(Role::Master);

            // [Check] Guild can join an alliance
            let mut guild = store.get_guild(member.guild_id);
            guild.assert_can_join();

            // [Effect] Create an alliance
            let alliance_id = world.dispatcher.uuid();
            let mut alliance = AllianceTrait::new(alliance_id, metadata, socials);

            // [Effect] Guild joins alliance
            guild.join(alliance_id);
            alliance.hire();

            // [Effect] Guild becomes alliance master
            guild.crown();

            // [Effect] Store entities
            store.set_guild(@guild);
            store.set_alliance(@alliance);
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
            let member = store.get_member(player_id);
            member.assert_is_allowed(Role::Master);

            // [Check] Guild exists and is the alliance master
            let guild = store.get_guild(member.guild_id);
            guild.assert_is_allowed(Role::Master);

            // [Effect] Alliance opens
            let mut alliance = store.get_alliance(guild.alliance_id);
            alliance.open(free);

            // [Effect] Store entities
            store.set_alliance(@alliance);
        }

        fn close(self: @ComponentState<TContractState>, world: WorldStorage, player_id: felt252) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Caller exists and is allowed
            let member = store.get_member(player_id);
            member.assert_is_allowed(Role::Master);

            // [Check] Guild exists and is the alliance master
            let guild = store.get_guild(member.guild_id);
            guild.assert_is_allowed(Role::Master);

            // [Effect] Alliance closes
            let mut alliance = store.get_alliance(guild.alliance_id);
            alliance.close();

            // [Effect] Store entities
            store.set_alliance(@alliance);
        }

        fn crown(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            guild_id: u32,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Caller exists and is allowed
            let member = store.get_member(player_id);
            member.assert_is_allowed(Role::Master);

            // [Check] Guild exists and is the alliance master
            let mut master = store.get_guild(member.guild_id);
            master.assert_is_allowed(Role::Master);

            // [Check] Guild is in the same alliance
            let mut guild = store.get_guild(guild_id);
            guild.assert_same_alliance(master.alliance_id);

            // [Effect] Transfer the master role
            master.uncrown();
            guild.crown();

            // [Effect] Store entities
            store.set_guild(@master);
            store.set_guild(@guild);
        }

        fn hire(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            guild_id: u32,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Caller exists and is allowed
            let member = store.get_member(player_id);
            member.assert_is_allowed(Role::Master);

            // [Check] Guild exists and is the alliance master
            let master = store.get_guild(member.guild_id);
            master.assert_is_allowed(Role::Master);

            // [Check] Alliance is open
            let mut alliance = store.get_alliance(master.alliance_id);
            alliance.assert_is_open();

            // [Effect] Member joins the guild and guild hires a member
            let mut guild = store.get_guild(guild_id);
            guild.join(alliance.id);
            alliance.hire();

            // [Effect] Store entities
            store.set_alliance(@alliance);
            store.set_guild(@guild);
        }

        fn fire(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            guild_id: u32,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Caller exists and is allowed
            let member = store.get_member(player_id);
            member.assert_is_allowed(Role::Master);

            // [Check] Guild exists and is the alliance master
            let master = store.get_guild(member.guild_id);
            master.assert_is_allowed(Role::Master);

            // [Check] Master has authority over the guild
            let mut guild = store.get_guild(guild_id);
            master.assert_has_authority(guild.role.into());

            // [Check] Guilds are in the same alliance
            guild.assert_same_alliance(master.alliance_id);

            // [Effect] Alliance fire a guild
            let mut alliance = store.get_alliance(master.alliance_id);
            alliance.fire();

            // [Effect] Guild leaves the alliance
            guild.leave();

            // [Effect] Store entities
            store.set_alliance(@alliance);
            store.set_guild(@guild);
        }

        fn request(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            alliance_id: u32,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Caller exists and is allowed
            let member = store.get_member(player_id);
            member.assert_is_allowed(Role::Master);

            // [Check] Alliance exists
            let mut alliance = store.get_alliance(alliance_id);
            alliance.assert_does_exist();

            // [Check] Alliance is open
            alliance.assert_is_open();

            // [Effect] Guild requests to join the alliance
            let mut guild = store.get_guild(member.guild_id);
            guild.request(alliance_id);

            // [Effect] Guild joins the alliance if it is free
            if alliance.free {
                // [Effect] Guild joins the alliance
                guild.join(alliance_id);
                // [Effect] Alliance hires a guild
                alliance.hire();
                store.set_alliance(@alliance);
            }

            // [Effect] Store entities
            store.set_guild(@guild);
        }

        fn cancel(self: @ComponentState<TContractState>, world: WorldStorage, player_id: felt252) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Caller exists and is allowed
            let member = store.get_member(player_id);
            member.assert_is_allowed(Role::Master);

            // [Effect] Guild cancels the request
            let mut guild = store.get_guild(member.guild_id);
            guild.cancel();

            // [Effect] Store entities
            store.set_guild(@guild);
        }

        fn leave(self: @ComponentState<TContractState>, world: WorldStorage, player_id: felt252) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Check] Caller exists and is allowed
            let member = store.get_member(player_id);
            member.assert_is_allowed(Role::Master);

            // [Effect] Guild leaves the alliance
            let mut guild = store.get_guild(member.guild_id);
            guild.leave();

            // [Effect] Store entities
            store.set_guild(@guild);
        }
    }
}
