// Interfaces

#[starknet::interface]
pub trait ISocial<TContractState> {
    fn pin(ref self: TContractState, achievement_id: felt252);
    fn unpin(ref self: TContractState, achievement_id: felt252);
    fn follow(ref self: TContractState, target: felt252);
    fn unfollow(ref self: TContractState, target: felt252);
    fn create_alliance(
        ref self: TContractState,
        color: felt252,
        name: ByteArray,
        description: ByteArray,
        image: ByteArray,
        banner: ByteArray,
        discord: ByteArray,
        telegram: ByteArray,
        twitter: ByteArray,
        youtube: ByteArray,
        website: ByteArray,
    );
    fn open_alliance(ref self: TContractState, free: bool);
    fn close_alliance(ref self: TContractState);
    fn crown_guild(ref self: TContractState, guild_id: u32);
    fn hire_guild(ref self: TContractState, guild_id: u32);
    fn fire_guild(ref self: TContractState, guild_id: u32);
    fn request_alliance(ref self: TContractState, alliance_id: u32);
    fn cancel_alliance(ref self: TContractState);
    fn leave_alliance(ref self: TContractState);
    fn create_guild(
        ref self: TContractState,
        color: felt252,
        name: ByteArray,
        description: ByteArray,
        image: ByteArray,
        banner: ByteArray,
        discord: ByteArray,
        telegram: ByteArray,
        twitter: ByteArray,
        youtube: ByteArray,
        website: ByteArray,
    );
    fn open_guild(ref self: TContractState, free: bool);
    fn close_guild(ref self: TContractState);
    fn crown_member(ref self: TContractState, member_id: felt252);
    fn promote_member(ref self: TContractState, member_id: felt252);
    fn demote_member(ref self: TContractState, member_id: felt252);
    fn hire_member(ref self: TContractState, member_id: felt252);
    fn fire_member(ref self: TContractState, member_id: felt252);
    fn request_guild(ref self: TContractState, guild_id: u32);
    fn cancel_guild(ref self: TContractState);
    fn leave_guild(ref self: TContractState);
}

// Contracts

#[dojo::contract]
pub mod Social {
    // Dojo imports

    use dojo::world::WorldStorage;

    // Component imports

    use achievement::components::pinnable::PinnableComponent;
    use social::components::allianceable::AllianceableComponent;
    use social::components::followable::FollowableComponent;
    use social::components::guildable::GuildableComponent;

    // Internal imports

    use arcade::constants::NAMESPACE;

    // Local imports

    use super::ISocial;

    // Components

    component!(path: PinnableComponent, storage: pinnable, event: PinnableEvent);
    impl PinnableInternalImpl = PinnableComponent::InternalImpl<ContractState>;
    component!(path: AllianceableComponent, storage: allianceable, event: AllianceableEvent);
    impl AllianceableImpl = AllianceableComponent::InternalImpl<ContractState>;
    component!(path: FollowableComponent, storage: followable, event: FollowableEvent);
    impl FollowableImpl = FollowableComponent::InternalImpl<ContractState>;
    component!(path: GuildableComponent, storage: guildable, event: GuildableEvent);
    impl GuildableImpl = GuildableComponent::InternalImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        pinnable: PinnableComponent::Storage,
        #[substorage(v0)]
        allianceable: AllianceableComponent::Storage,
        #[substorage(v0)]
        followable: FollowableComponent::Storage,
        #[substorage(v0)]
        guildable: GuildableComponent::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        PinnableEvent: PinnableComponent::Event,
        #[flat]
        AllianceableEvent: AllianceableComponent::Event,
        #[flat]
        FollowableEvent: FollowableComponent::Event,
        #[flat]
        GuildableEvent: GuildableComponent::Event,
    }

    // Implementations

    #[abi(embed_v0)]
    impl SocialImpl of ISocial<ContractState> {
        fn pin(ref self: ContractState, achievement_id: felt252) {
            let world: WorldStorage = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.pinnable.pin(world, caller, achievement_id);
        }

        fn unpin(ref self: ContractState, achievement_id: felt252) {
            let world: WorldStorage = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.pinnable.unpin(world, caller, achievement_id);
        }

        fn follow(ref self: ContractState, target: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.followable.follow(world, caller, target);
        }

        fn unfollow(ref self: ContractState, target: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.followable.unfollow(world, caller, target);
        }

        // Alliance

        fn create_alliance(
            ref self: ContractState,
            color: felt252,
            name: ByteArray,
            description: ByteArray,
            image: ByteArray,
            banner: ByteArray,
            discord: ByteArray,
            telegram: ByteArray,
            twitter: ByteArray,
            youtube: ByteArray,
            website: ByteArray,
        ) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self
                .allianceable
                .create(
                    world,
                    caller,
                    Option::Some(color),
                    Option::Some(name),
                    Option::Some(description),
                    Option::Some(image),
                    Option::Some(banner),
                    Option::Some(discord),
                    Option::Some(telegram),
                    Option::Some(twitter),
                    Option::Some(youtube),
                    Option::Some(website),
                );
        }

        fn open_alliance(ref self: ContractState, free: bool) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.allianceable.open(world, caller, free);
        }

        fn close_alliance(ref self: ContractState) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.allianceable.close(world, caller);
        }

        fn crown_guild(ref self: ContractState, guild_id: u32) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.allianceable.crown(world, caller, guild_id);
        }

        fn hire_guild(ref self: ContractState, guild_id: u32) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.allianceable.hire(world, caller, guild_id);
        }

        fn fire_guild(ref self: ContractState, guild_id: u32) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.allianceable.fire(world, caller, guild_id);
        }

        fn request_alliance(ref self: ContractState, alliance_id: u32) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.allianceable.request(world, caller, alliance_id);
        }

        fn cancel_alliance(ref self: ContractState) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.allianceable.cancel(world, caller);
        }

        fn leave_alliance(ref self: ContractState) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.allianceable.leave(world, caller);
        }

        // Guild

        fn create_guild(
            ref self: ContractState,
            color: felt252,
            name: ByteArray,
            description: ByteArray,
            image: ByteArray,
            banner: ByteArray,
            discord: ByteArray,
            telegram: ByteArray,
            twitter: ByteArray,
            youtube: ByteArray,
            website: ByteArray,
        ) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self
                .guildable
                .create(
                    world,
                    caller,
                    Option::Some(color),
                    Option::Some(name),
                    Option::Some(description),
                    Option::Some(image),
                    Option::Some(banner),
                    Option::Some(discord),
                    Option::Some(telegram),
                    Option::Some(twitter),
                    Option::Some(youtube),
                    Option::Some(website),
                );
        }

        fn open_guild(ref self: ContractState, free: bool) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.guildable.open(world, caller, free);
        }

        fn close_guild(ref self: ContractState) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.guildable.close(world, caller);
        }

        fn crown_member(ref self: ContractState, member_id: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.guildable.crown(world, caller, member_id);
        }

        fn promote_member(ref self: ContractState, member_id: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.guildable.promote(world, caller, member_id);
        }

        fn demote_member(ref self: ContractState, member_id: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.guildable.demote(world, caller, member_id);
        }

        fn hire_member(ref self: ContractState, member_id: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.guildable.hire(world, caller, member_id);
        }

        fn fire_member(ref self: ContractState, member_id: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.guildable.fire(world, caller, member_id);
        }

        fn request_guild(ref self: ContractState, guild_id: u32) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.guildable.request(world, caller, guild_id);
        }

        fn cancel_guild(ref self: ContractState) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.guildable.cancel(world, caller);
        }

        fn leave_guild(ref self: ContractState) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.guildable.leave(world, caller);
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
