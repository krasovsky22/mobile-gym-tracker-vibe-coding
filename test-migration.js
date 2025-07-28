#!/usr/bin/env node

/**
 * Migration Test Script for Mobile Gym Tracker
 *
 * This script tests the seeding functionality for:
 * - Exercise categories
 * - Muscle groups
 * - Default exercises
 *
 * Usage:
 *   node test-migration.js [command]
 *
 * Commands:
 *   stats     - Show current database statistics
 *   seed      - Run full seeding migration
 *   categories - Seed only categories
 *   muscle-groups - Seed only muscle groups
 *   exercises - Seed only exercises
 *   reset     - Reset all seeded data (WARNING: destructive)
 */

const { ConvexHttpClient } = require('convex/browser');

// Get the deployment URL from environment
const deploymentUrl = process.env.EXPO_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!deploymentUrl) {
  console.error('❌ EXPO_PUBLIC_CONVEX_URL or CONVEX_URL environment variable is required');
  console.error('   Run "npx convex dev" first to set up your deployment');
  console.error('   Or set EXPO_PUBLIC_CONVEX_URL manually');
  process.exit(1);
}

const client = new ConvexHttpClient(deploymentUrl);

async function showStats() {
  try {
    console.log('📊 Database Statistics:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');

    const stats = await client.query('migrations:getStats');

    console.log(`📁 Categories: ${stats.categories}/${stats.expectedCategories}`);
    console.log(`💪 Muscle Groups: ${stats.muscleGroups}/${stats.expectedMuscleGroups}`);
    console.log(`🏋️  Exercises: ${stats.exercises}/${stats.expectedExercises}`);

    const isComplete =
      stats.categories === stats.expectedCategories &&
      stats.muscleGroups === stats.expectedMuscleGroups &&
      stats.exercises === stats.expectedExercises;

    console.log(`\n✅ Migration Status: ${isComplete ? 'COMPLETE' : 'INCOMPLETE'}`);
  } catch (error) {
    console.error('❌ Error getting stats:', error.message);
  }
}

async function seedCategories() {
  try {
    console.log('📁 Seeding exercise categories...');
    const result = await client.mutation('migrations:seedCategories', {});
    console.log(`✅ ${result.message}`);
    return result;
  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
    throw error;
  }
}

async function seedMuscleGroups() {
  try {
    console.log('💪 Seeding muscle groups...');
    const result = await client.mutation('migrations:seedMuscleGroups', {});
    console.log(`✅ ${result.message}`);
    return result;
  } catch (error) {
    console.error('❌ Error seeding muscle groups:', error.message);
    throw error;
  }
}

async function seedExercises() {
  try {
    console.log('🏋️  Seeding default exercises...');
    const result = await client.mutation('migrations:seedExercises', {});
    console.log(`✅ ${result.message}`);

    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Exercise seeding errors:');
      result.errors.forEach((error) => console.log(`   ${error}`));
    }

    return result;
  } catch (error) {
    console.error('❌ Error seeding exercises:', error.message);
    throw error;
  }
}

async function runFullMigration() {
  try {
    console.log('🚀 Starting full migration...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const result = await client.mutation('migrations:fullMigration', {});
    console.log(`\n✅ ${result.message}`);

    console.log('\n📋 Migration Details:');
    result.results.forEach((step) => {
      const icon = step.success ? '✅' : '❌';
      console.log(`${icon} ${step.step}: ${step.message}`);
    });

    return result;
  } catch (error) {
    console.error('❌ Error running full migration:', error.message);
    throw error;
  }
}

async function resetAll() {
  try {
    console.log('⚠️  WARNING: This will delete ALL seeded data!');
    console.log('🗑️  Resetting all seeded data...');

    const result = await client.mutation('migrations:resetAll', { confirm: true });
    console.log(`✅ ${result.message}`);

    return result;
  } catch (error) {
    console.error('❌ Error resetting data:', error.message);
    throw error;
  }
}

// Main script logic
async function main() {
  const command = process.argv[2] || 'stats';

  console.log('🏋️  Mobile Gym Tracker - Migration Tool');
  console.log(`📡 Connected to: ${deploymentUrl}`);
  console.log('');

  try {
    switch (command) {
      case 'stats':
        await showStats();
        break;

      case 'seed':
        await runFullMigration();
        await showStats();
        break;

      case 'categories':
        await seedCategories();
        await showStats();
        break;

      case 'muscle-groups':
        await seedMuscleGroups();
        await showStats();
        break;

      case 'exercises':
        await seedExercises();
        await showStats();
        break;

      case 'reset':
        await resetAll();
        await showStats();
        break;

      case 'help':
      case '--help':
      case '-h':
        console.log('Available commands:');
        console.log('  stats         - Show current database statistics');
        console.log('  seed          - Run full seeding migration');
        console.log('  categories    - Seed only categories');
        console.log('  muscle-groups - Seed only muscle groups');
        console.log('  exercises     - Seed only exercises');
        console.log('  reset         - Reset all seeded data (WARNING: destructive)');
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.error('   Run "node test-migration.js help" for available commands');
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n💥 Migration failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
