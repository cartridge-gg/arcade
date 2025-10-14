#!/usr/bin/env node

/**
 * Script to fetch active editions from the Arcade Registry
 * This generates a list that can be used by SSR
 */

import { Registry, constants } from '@cartridge/arcade';

async function fetchActiveEditions() {
  console.log('Initializing Arcade Registry...');
  await Registry.init(constants.StarknetChainId.SN_MAIN);

  const editions = [];

  const handler = (models) => {
    models.forEach(model => {
      if (model.constructor.name === 'EditionModel') {
        if (model.whitelisted && model.published) {
          editions.push({
            id: model.id,
            gameId: model.gameId,
            project: model.config?.project,
            namespace: model.namespace,
            priority: model.priority,
            whitelisted: model.whitelisted,
            published: model.published,
          });
        }
      }
    });
  };

  console.log('Fetching editions from Registry...');
  await Registry.fetch(handler, { edition: true });

  console.log(`\nFound ${editions.length} active editions:\n`);

  // Sort by priority like the client does
  editions.sort((a, b) => b.priority - a.priority);

  console.log('export const ACTIVE_EDITIONS = [');
  editions.forEach((edition, i) => {
    const comma = i < editions.length - 1 ? ',' : '';
    console.log(`  { project: "${edition.project}", namespace: "${edition.namespace}" }${comma}`);
  });
  console.log('];');
}

fetchActiveEditions().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
