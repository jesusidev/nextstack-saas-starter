// Quick script to check products in database
// Usage: DATABASE_URL="postgresql://appuser:apppass@localhost:5433/nextstack-saas-starter-qa" node scripts/debug/check-products.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('🔍 Checking products in database...\n');

    const products = await prisma.product.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (products.length === 0) {
      console.log('📭 No products found in database');
    } else {
      console.log(`📦 Found ${products.length} product(s):\n`);
      products.forEach((product, index) => {
        console.log(`${index + 1}. Product ID: ${product.id}`);
        console.log(`   Name: ${product.name}`);
        console.log(`   Brand: ${product.brand || 'N/A'}`);
        console.log(`   SKU: ${product.sku || 'N/A'}`);
        console.log(`   Favorite: ${product.isFavorite}`);
        console.log(`   Owner: ${product.user?.firstName} ${product.user?.lastName}`);
        console.log(`   Images: ${product.images?.length || 0} image(s)`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
