// Script to clear all data from database (BE CAREFUL!)
// Usage: DATABASE_URL="postgresql://appuser:apppass@localhost:5433/nextstack-saas-starter-qa" node scripts/debug/clear-database.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('⚠️  WARNING: This will delete ALL data from the database!');
    console.log('🔄 Clearing database...\n');

    // Delete in reverse dependency order
    console.log('🗑️  Deleting favorite products...');
    await prisma.favoriteProduct.deleteMany();

    console.log('🗑️  Deleting favorite projects...');
    await prisma.favoriteProject.deleteMany();

    console.log('🗑️  Deleting products...');
    const deletedProducts = await prisma.product.deleteMany();

    console.log('🗑️  Deleting projects...');
    const deletedProjects = await prisma.project.deleteMany();

    console.log('🗑️  Deleting users...');
    const deletedUsers = await prisma.user.deleteMany();

    console.log('\n✅ Database cleared successfully!');
    console.log(`   - ${deletedUsers.count} users deleted`);
    console.log(`   - ${deletedProducts.count} products deleted`);
    console.log(`   - ${deletedProjects.count} projects deleted`);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
