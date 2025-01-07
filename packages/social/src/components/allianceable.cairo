#[starknet::component]
mod AllianceableComponent {
    // Dojo imports

    use dojo::world::WorldStorage;
    use dojo::world::IWorldDispatcherTrait;

    // External imports

    use registry::types::metadata::MetadataTrait;
    use registry::types::socials::SocialsTrait;

    // Internal imports

    use social::store::{Store, StoreTrait};
    use social::models::alliance::{Alliance, AllianceTrait, AllianceAssert};
    use social::models::guild::{Guild, GuildTrait, GuildAssert};
    use social::models::member::{Member, MemberTrait, MemberAssert};
    use social::types::role::Role;

    // Storage

    #[storage]
    struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {}

    #[generate_trait]
    impl InternalImpl<
        TContractState, +HasComponent<TContractState>
    > of InternalTrait<TContractState> {
        fn create(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            color: Option<felt252>,
            name: Option<ByteArray>,
            description: Option<ByteArray>,
            image: Option<ByteArray>,
            banner: Option<ByteArray>,
            discord: Option<ByteArray>,
            telegram: Option<ByteArray>,
            twitter: Option<ByteArray>,
            youtube: Option<ByteArray>,
            website: Option<ByteArray>
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
            let metadata = MetadataTrait::new(color, name, description, image, banner);
            let socials = SocialsTrait::new(discord, telegram, twitter, youtube, website);
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
            free: bool
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
            guild_id: u32
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
            guild_id: u32
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
            guild_id: u32
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
            alliance_id: u32
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
            };

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
