import { prisma } from './src/config';

async function main() {
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;');
    await prisma.$executeRawUnsafe(
      'CREATE EXTENSION IF NOT EXISTS unaccent;'
    );
    // console.log("Extensions created successfully!");
  } catch (err) {
    console.error("Error creating extensions:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
