// Quick script to check users in database
// Usage: DATABASE_URL="postgresql://appuser:apppass@localhost:5433/nextstack-saas-starter-qa" node scripts/debug/check-users.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');

    const users = await prisma.user.findMany();

    if (users.length === 0) {
      console.log('📭 No users found in database');
    } else {
      console.log(`👥 Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. User ID: ${user.id}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
