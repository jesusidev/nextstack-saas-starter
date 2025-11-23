#!/usr/bin/env tsx

import { cleanupOrphanedFiles } from '../src/service/cleanup/orphanedFiles';

async function main() {
  console.log('Starting orphaned file cleanup...');

  try {
    const result = await cleanupOrphanedFiles();

    console.log('\nCleanup Summary:');
    console.log(`- Files deleted: ${result.deletedCount}`);
    console.log(`- Failed deletions: ${result.failedKeys.length}`);

    if (result.errors.length > 0) {
      console.log('\nErrors:');
      for (const error of result.errors) {
        console.error(`  - ${error.key}: ${error.error}`);
      }
    }

    console.log('\nCleanup completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during cleanup:', error);
    process.exit(1);
  }
}

main();
