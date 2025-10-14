#!/usr/bin/env node

/**
 * Final test script to verify SSR points calculation matches client logic
 * Tests dynamic fetching + completion-based counting
 * Usage: node test-ssr-final.js [username]
 */

import { byteArray, hash } from "starknet";

const API_URL = process.env.VITE_CARTRIDGE_API_URL || "https://api.cartridge.gg";
const TORII_URL = "https://api.cartridge.gg/x/arcade-main/torii/graphql";

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

const EDITIONS_QUERY = `
  query {
    arcadeEditionModels(first: 100) {
      edges {
        node {
          namespace
          config
          whitelisted
          published
          priority
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

function serializeByteArray(byteArrayObj) {
  const result = [
    BigInt(byteArrayObj.data.length),
    ...byteArrayObj.data.map((word) => BigInt(word.toString())),
    BigInt(byteArrayObj.pending_word),
    BigInt(byteArrayObj.pending_word_len),
  ];
  return result;
}

function computeByteArrayHash(str) {
  const bytes = byteArray.byteArrayFromString(str);
  return hash.computePoseidonHashOnElements(serializeByteArray(bytes));
}

function getSelectorFromTag(namespace, event) {
  return hash.computePoseidonHashOnElements([
    computeByteArrayHash(namespace),
    computeByteArrayHash(event),
  ]);
}

function decodeFelt252(hex) {
  const cleaned = hex.replace(/^0x/, '');
  let result = '';
  for (let i = 0; i < cleaned.length; i += 2) {
    const byte = parseInt(cleaned.substr(i, 2), 16);
    if (byte > 0) {
      result += String.fromCharCode(byte);
    }
  }
  return result;
}

async function getActiveProjects() {
  console.log('Fetching active editions from Torii...');

  const response = await fetch(TORII_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: EDITIONS_QUERY }),
  });

  if (!response.ok) {
    throw new Error(`Torii request failed: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(`GraphQL errors: ${json.errors.map(e => e.message).join(", ")}`);
  }

  if (!json.data?.arcadeEditionModels?.edges) {
    throw new Error("No edition data returned");
  }

  const activeEditions = json.data.arcadeEditionModels.edges
    .map(edge => edge.node)
    .filter(node => node.whitelisted && node.published)
    .sort((a, b) => b.priority - a.priority);

  console.log(`Found ${activeEditions.length} active editions\n`);

  const projects = activeEditions.map(edition => {
    const namespace = decodeFelt252(edition.namespace);
    const config = JSON.parse(edition.config);
    const project = config.project;
    const model = getSelectorFromTag(namespace, "TrophyProgression");

    return { model, namespace, project };
  });

  return projects;
}

function computePlayerStats(address, progressionsData) {
  let totalPoints = 0;
  const gameStats = {};

  const normalizedTargetAddress = normalizeAddress(address);

  for (const item of progressionsData.playerAchievements.items) {
    const project = item.meta.project;

    // Get player's progressions for this project
    const playerProgressions = item.achievements.filter((p) => {
      try {
        const normalized = normalizeAddress(p.playerId);
        return normalized === normalizedTargetAddress;
      } catch {
        return false;
      }
    });

    // Group progressions by achievementId to check completion
    const achievementGroups = new Map();
    playerProgressions.forEach(p => {
      if (!achievementGroups.has(p.achievementId)) {
        achievementGroups.set(p.achievementId, []);
      }
      achievementGroups.get(p.achievementId).push(p);
    });

    // Calculate points - only count completed achievements
    let projectPoints = 0;
    let completedCount = 0;
    let incompleteCount = 0;

    achievementGroups.forEach((tasks, achievementId) => {
      const allTasksComplete = tasks.every(task => task.total >= task.taskTotal);
      if (allTasksComplete) {
        const achievementPoints = tasks[0].points;
        projectPoints += achievementPoints;
        completedCount++;
      } else {
        incompleteCount++;
      }
    });

    if (projectPoints > 0 || completedCount > 0) {
      console.log(`  ${project.padEnd(25)} ${projectPoints.toString().padStart(4)} points (${completedCount} completed, ${incompleteCount} incomplete)`);
    }

    gameStats[project] = { points: projectPoints };
    totalPoints += projectPoints;
  }

  return { totalPoints, gameStats };
}

async function testPlayerPoints(username) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`Testing SSR Points for: ${username}`);
  console.log(`(with dynamic fetching + completion-based counting)`);
  console.log("=".repeat(70));

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

    // Step 2: Fetch active projects dynamically
    console.log("\n[2] Fetching active projects dynamically...\n");
    const activeProjects = await getActiveProjects();

    console.log('Active projects:');
    activeProjects.forEach(p => {
      console.log(`  - ${p.project} (${p.namespace})`);
    });

    // Step 3: Fetch progressions
    console.log(`\n[3] Fetching player achievements for ${activeProjects.length} projects...`);
    const progressionsData = await graphqlRequest(ProgressionsDocument, {
      projects: activeProjects
    });

    const totalAchievements = progressionsData.playerAchievements.items.reduce(
      (sum, item) => sum + item.achievements.length,
      0
    );
    console.log(`✓ Received ${progressionsData.playerAchievements.items.length} project results`);
    console.log(`✓ Total achievement progressions: ${totalAchievements}`);

    // Step 4: Compute player stats
    console.log("\n[4] Computing player points (only completed achievements)...\n");
    const stats = computePlayerStats(address, progressionsData);

    console.log("\n" + "=".repeat(70));
    console.log(`TOTAL POINTS: ${stats.totalPoints}`);
    console.log("=".repeat(70));

    console.log("\n✅ Test completed successfully!");
    console.log(`\nExpected: 2325 points`);
    console.log(`Actual:   ${stats.totalPoints} points`);
    console.log(`Match:    ${stats.totalPoints === 2325 ? '✅ YES' : '❌ NO'}\n`);

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
