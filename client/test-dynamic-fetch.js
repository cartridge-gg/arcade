#!/usr/bin/env node

/**
 * Test script to verify dynamic fetching of active editions
 */

const TORII_URL = "https://api.cartridge.gg/x/arcade-main/torii/graphql";

const EDITIONS_QUERY = `
  query {
    arcadeEditionModels {
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

/**
 * Decode hex-encoded felt252 string (namespace) to ASCII
 */
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

async function testDynamicFetch() {
  console.log('Fetching active editions from Torii...\n');

  try {
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

    console.log(`Found ${activeEditions.length} active editions:\n`);

    const projects = activeEditions.map(edition => {
      const namespace = decodeFelt252(edition.namespace);
      const config = JSON.parse(edition.config);
      const project = config.project;

      console.log(`  - ${project}`);
      console.log(`    namespace: ${namespace}`);
      console.log(`    priority: ${edition.priority}`);
      console.log(`    whitelisted: ${edition.whitelisted}, published: ${edition.published}\n`);

      return { project, namespace };
    });

    console.log(`\nTotal active projects: ${projects.length}\n`);
    console.log('Projects list:');
    projects.forEach(p => {
      console.log(`  { project: "${p.project}", namespace: "${p.namespace}" }`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testDynamicFetch();
