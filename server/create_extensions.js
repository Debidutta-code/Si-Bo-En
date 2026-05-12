const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;');
    console.log("Extensions created successfully!");
  } catch (err) {
    console.error("Error creating extensions:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
