import { constants } from "starknet";

export const policies = {
  [constants.StarknetChainId.SN_SEPOLIA]: {
    contracts: {
      "0x3af383ca009f2066f44ec9c6e760072b58142468bdf2b2b87053e4ee0012ed2": {
        name: "Registry",
        description: "Arcade registry contract for games and achievements",
        methods: [
          {
            name: "pin",
            entrypoint: "pin",
            description: "Pin an achievement.",
          },
          {
            name: "unpin",
            entrypoint: "unpin",
            description: "Unpin an achievement.",
          },
          {
            name: "register_game",
            entrypoint: "register_game",
            description: "Register a game.",
          },
          {
            name: "update_game",
            entrypoint: "update_game",
            description: "Update a game.",
          },
          {
            name: "publish_game",
            entrypoint: "publish_game",
            description: "Publish a game.",
          },
          {
            name: "hide_game",
            entrypoint: "hide_game",
            description: "Hide a game.",
          },
          {
            name: "whitelist_game",
            entrypoint: "whitelist_game",
            description: "Whitelist a game.",
          },
          {
            name: "blacklist_game",
            entrypoint: "blacklist_game",
            description: "Blacklist a game.",
          },
          {
            name: "remove_game",
            entrypoint: "remove_game",
            description: "Remove a game.",
          },
          {
            name: "register_achievement",
            entrypoint: "register_achievement",
            description: "Register an achievement.",
          },
          {
            name: "update_achievement",
            entrypoint: "update_achievement",
            description: "Update an achievement.",
          },
          {
            name: "publish_achievement",
            entrypoint: "publish_achievement",
            description: "Publish an achievement.",
          },
          {
            name: "hide_achievement",
            entrypoint: "hide_achievement",
            description: "Hide an achievement.",
          },
          {
            name: "whitelist_achievement",
            entrypoint: "whitelist_achievement",
            description: "Whitelist an achievement.",
          },
          {
            name: "blacklist_achievement",
            entrypoint: "blacklist_achievement",
            description: "Blacklist an achievement.",
          },
          {
            name: "remove_achievement",
            entrypoint: "remove_achievement",
            description: "Remove an achievement.",
          },
        ],
      },
      "0x73576c09ed2112c95cd9c7a3aa6de2f0094edfe0acc569c2f79cb56147885ea": {
        name: "Slot",
        description: "Slot contract to manage your services",
        methods: [
          {
            name: "deploy",
            entrypoint: "deploy",
            description: "Deploy a service.",
          },
          {
            name: "remove",
            entrypoint: "remove",
            description: "Remove a service.",
          },
          {
            name: "hire",
            entrypoint: "hire",
            description: "Hire a team member.",
          },
          {
            name: "fire",
            entrypoint: "fire",
            description: "Fire a team member.",
          },
        ],
      },
      "0x259a19cf745d528e85492524d3d8c4721b1357fdad7538d7be22e88208fd89b": {
        name: "Social",
        description: "Social contract to manage your social activities",
        methods: [
          {
            name: "follow",
            entrypoint: "follow",
            description: "Follow another player.",
          },
          {
            name: "unfollow",
            entrypoint: "unfollow",
            description: "Unfollow a player.",
          },
          {
            name: "create_alliance",
            entrypoint: "create_alliance",
            description: "Create an alliance.",
          },
          {
            name: "open_alliance",
            entrypoint: "open_alliance",
            description: "Open an alliance.",
          },
          {
            name: "close_alliance",
            entrypoint: "close_alliance",
            description: "Close an alliance.",
          },
          {
            name: "crown_guild",
            entrypoint: "crown_guild",
            description: "Crown a guild to lead the alliance.",
          },
          {
            name: "hire_guild",
            entrypoint: "hire_guild",
            description: "Hire a guild in the alliance.",
          },
          {
            name: "fire_guild",
            entrypoint: "fire_guild",
            description: "Fire a guild from the alliance.",
          },
          {
            name: "request_alliance",
            entrypoint: "request_alliance",
            description: "Request to join an alliance.",
          },
          {
            name: "cancel_alliance",
            entrypoint: "cancel_alliance",
            description: "Cancel a request to join an alliance.",
          },
          {
            name: "leave_alliance",
            entrypoint: "leave_alliance",
            description: "Leave an alliance.",
          },
          {
            name: "create_guild",
            entrypoint: "create_guild",
            description: "Create a guild.",
          },
          {
            name: "open_guild",
            entrypoint: "open_guild",
            description: "Open a guild.",
          },
          {
            name: "close_guild",
            entrypoint: "close_guild",
            description: "Close a guild.",
          },
          {
            name: "crown_member",
            entrypoint: "crown_member",
            description: "Crown a member to lead the guild.",
          },
          {
            name: "promote_member",
            entrypoint: "promote_member",
            description: "Promote a member to officer.",
          },
          {
            name: "demote_member",
            entrypoint: "demote_member",
            description: "Demote an officer to member.",
          },
          {
            name: "hire_member",
            entrypoint: "hire_member",
            description: "Hire a member to the guild.",
          },
          {
            name: "fire_member",
            entrypoint: "fire_member",
            description: "Fire a member from the guild.",
          },
        ],
      },
      "0x764c8b778e11a48cd6c6f626eaa1b515c272a3ee3c52de2b13bd10969afec38": {
        name: "Wallet",
        description: "Wallet contract to manage your account",
        methods: [],
      },
    },
  },
  [constants.StarknetChainId.SN_MAIN]: {
    contracts: {},
  },
};
