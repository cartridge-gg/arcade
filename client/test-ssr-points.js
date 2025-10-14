#!/usr/bin/env node

/**
 * Test script to verify SSR points fetching logic
 * Usage: node test-ssr-points.js [username]
 */

const API_URL = process.env.VITE_CARTRIDGE_API_URL || "https://api.cartridge.gg";

// Active game projects with computed model hashes - matching client configuration
const ACTIVE_PROJECTS = [
  { model: "0x2190dba87ac0c88110db0598becd5f99855ad898c2ee1a990bd1433b7012253", namespace: "ls_0_0_8", project: "arcade-ls2" },
  { model: "0x198e5fb446b41882f55a08f8baaba4387f41637ca140b0084459ce5338f617d", namespace: "s1_eternum", project: "arcade-eternum-s1" },
  { model: "0x66deddfae96c058e621e0b4e76a5b6796ae7eb7b4b5372b5c7757ab6feff232", namespace: "zkube_budo_v1_1_0", project: "arcade-zkube-v2" },
  { model: "0x6da79ec4f8ef62f705b565aeb2b23d04a449fce4c32af8ad209eb20e310b08a", namespace: "dopewars", project: "arcade-dopewars" },
  { model: "0x528aee6e1c2ad2e0f603b1bfe15e3aefc1ded821cd118e5eab5092b704c79b0", namespace: "pistols", project: "arcade-pistols" },
  { model: "0x620cf10a34caaf302accd82358cb9b55b9efa1345f8e09a6afbc7feb4a9a9b0", namespace: "ds_v1_2_0", project: "arcade-darkshuffle" },
  { model: "0x1222d9cbbe8171b953a10a4b76a5d8b9e64ae40f2aeb0912713af4b98b90b2f", namespace: "achievements", project: "arcade-blobarena" },
  { model: "0x4f4e617e4862d0202900c8503ac0ad4c5e6a7c14d033bf36c177e5852368bd3", namespace: "ponzi_land", project: "arcade-ponziland-nft" },
  { model: "0x31287b860bda95c8f615b73030945b93c746a3b4dacb9e3a927f2c6ac867aad", namespace: "ls_0_0_1", project: "arcade-ls1" },
  { model: "0x5a8f3fedb72efc9d358b86574cf362f8ed1ec12a02ca9f276e6190f49191217", namespace: "s0_eternum", project: "arcade-eternum-s0" },
  { model: "0x17b14454c7075d73430699a7e57cfb3aaa40a094fcf81c2afac7fa95667c8ec", namespace: "zkube", project: "arcade-zkube-v1" },
  { model: "0x1215b009b1e284bcf009a2dbe724e201ade476fd23970382198ad3af48fc92e", namespace: "dragark", project: "arcade-dragark" },
];

const ADDRESS_BY_USERNAME_QUERY = `
  query AddressByUsername($username: String!) {
    account(username: $username) {
      controllers(first: 1) {
        edges {
          node {
            address
          }
        }
      }
    }
  }
`;

const ProgressionsDocument = `
    query Progressions($projects: [Project!]!) {
  playerAchievements(projects: $projects) {
    items {
      meta {
        project
        model
        namespace
        count
      }
      achievements {
        playerId
        achievementId
        points
        taskId
        taskTotal
        total
        completionTime
      }
    }
  }
}
    `;

async function graphqlRequest(query, variables) {
  const response = await fetch(`${API_URL}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors && json.errors.length > 0) {
    throw new Error(`GraphQL error: ${json.errors.map((e) => e.message).join(", ")}`);
  }

  return json.data;
}

function normalizeAddress(address) {
  if (!address || typeof address !== 'string') {
    throw new Error('Invalid address: must be a non-empty string');
  }
  const cleaned = address.toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]+$/.test(cleaned)) {
    throw new Error(`Invalid address format: ${address}`);
  }
  if (cleaned.length > 64) {
    throw new Error(`Address too long: ${address}`);
  }
  return cleaned.padStart(64, "0");
}

function computePlayerStats(address, progressionsData) {
  let totalPoints = 0;
  const gameStats = {};

  const normalizedTargetAddress = normalizeAddress(address);
  console.log(`\nTarget address (normalized): ${normalizedTargetAddress}`);

  for (const item of progressionsData.playerAchievements.items) {
    const project = item.meta.project;

    const playerProgressions = item.achievements.filter((p) => {
      try {
        const normalized = normalizeAddress(p.playerId);
        return normalized === normalizedTargetAddress;
      } catch {
        return false;
      }
    });

    const projectPoints = playerProgressions.reduce((sum, p) => sum + p.points, 0);

    if (projectPoints > 0) {
      console.log(`  ${project}: ${projectPoints} points (${playerProgressions.length} achievements)`);
    }

    gameStats[project] = { points: projectPoints };
    totalPoints += projectPoints;
  }

  return { totalPoints, gameStats };
}

async function testPlayerPoints(username) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing SSR Points Fetch for: ${username}`);
  console.log("=".repeat(60));

  try {
    // Step 1: Resolve username to address
    console.log("\n[1] Resolving username to address...");
    const accountData = await graphqlRequest(ADDRESS_BY_USERNAME_QUERY, {
      username: username.toLowerCase(),
    });

    const address = accountData.account?.controllers?.edges?.[0]?.node?.address;
    if (!address) {
      console.error("❌ Could not resolve username to address");
      return;
    }
    console.log(`✓ Resolved to: ${address}`);

    // Step 2: Fetch progressions
    console.log("\n[2] Fetching player achievements...");


    const progressionsData = await graphqlRequest(ProgressionsDocument, {
      projects: ACTIVE_PROJECTS
    });

    const totalAchievements = progressionsData.playerAchievements.items.reduce(
      (sum, item) => sum + item.achievements.length,
      0
    );
    console.log(`✓ Received ${progressionsData.playerAchievements.items.length} project results`);
    console.log(`✓ Total achievements in response: ${totalAchievements}`);

    // Debug: Show first few achievements from each project
    console.log("\nDebug - Sample data from each project:");
    progressionsData.playerAchievements.items.forEach((item) => {
      console.log(`  ${item.meta.project}: ${item.achievements.length} achievements (model: ${item.meta.model})`);
    });

    // Step 3: Compute player stats
    console.log("\n[3] Computing player points...");
    const stats = computePlayerStats(address, progressionsData);

    console.log("\n" + "=".repeat(60));
    console.log(`TOTAL POINTS: ${stats.totalPoints}`);
    console.log("=".repeat(60));

    // Show breakdown by game
    console.log("\nBreakdown by game:");
    const sortedGames = Object.entries(stats.gameStats)
      .sort(([, a], [, b]) => b.points - a.points)
      .filter(([, stat]) => stat.points > 0);

    if (sortedGames.length === 0) {
      console.log("  No achievements found for this player");
    } else {
      sortedGames.forEach(([game, stat]) => {
        console.log(`  ${game.padEnd(20)} ${stat.points} points`);
      });
    }

    console.log("\n✅ Test completed successfully!\n");
    return stats;

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.stack) {
      console.error("\nStack trace:", error.stack);
    }
    process.exit(1);
  }
}

// Main execution
const username = process.argv[2] || "bal7hazar";
testPlayerPoints(username);
