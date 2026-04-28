import { InitializeDB } from '../auth/repository/initial.repository';

async function seed() {
    console.log('🌱 Starting database seed...');
    try {
        const db = new InitializeDB();
        await db.initDb();
        console.log('✅ Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
