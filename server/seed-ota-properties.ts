import { prisma, connectPostgres } from './src/config/db.config';
import { v4 as uuidv4 } from 'uuid';

async function main() {
    await connectPostgres();
    // console.log('Starting OTA Dummy Properties Seeder...');

    try {
        // 1. Check or create an Admin User
        let adminUser = await prisma.user.findFirst({
            where: { role: 'super_admin' },
        });

        if (!adminUser) {
            // console.log(
            //     'No super_admin user found. Creating a dummy admin user...'
            // );
            adminUser = await prisma.user.create({
                data: {
                    firstName: 'System',
                    lastName: 'Admin',
                    email: `admin_${uuidv4().substring(0, 8)}@revchill.com`,
                    password: 'DummyPassword123!',
                    role: 'super_admin',
                    userLevel: 0,
                },
            });
        }
        // console.log(`✅ Using User ID: ${adminUser.id}`);

        // 2. Check or create a Master Property Category
        let luxuryCategory = await prisma.masterPropertyCategory.findFirst({
            where: { categoryName: 'Luxury' },
        });
        if (!luxuryCategory) {
            luxuryCategory = await prisma.masterPropertyCategory.create({
                data: {
                    categoryName: 'Luxury',
                    isActive: true,
                },
            });
        }

        // 3. Check or create Master Property Types
        let hotelType = await prisma.masterPropertyType.findFirst({
            where: { propertyTypeName: 'Hotel' },
        });
        if (!hotelType) {
            hotelType = await prisma.masterPropertyType.create({
                data: {
                    propertyTypeName: 'Hotel',
                    isActive: true,
                },
            });
        }

        let resortType = await prisma.masterPropertyType.findFirst({
            where: { propertyTypeName: 'Resort' },
        });
        if (!resortType) {
            resortType = await prisma.masterPropertyType.create({
                data: {
                    propertyTypeName: 'Resort',
                    isActive: true,
                },
            });
        }

        // 4. Create Dummy Properties
        const dummyProperties = [
            {
                propertyName: 'Grand Hilton Dubai',
                propertyCode: `HIL-${uuidv4().substring(0, 5).toUpperCase()}`,
                propertyEmail: 'info@grandhiltondubai.test',
                propertyContact: '+971501234567',
                description: 'A luxurious 5-star hotel in the heart of Dubai.',
                starRating: 5,
                city: 'Dubai',
                country: 'UAE',
                category: luxuryCategory.id,
                type: hotelType.id,
                image: [
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945',
                ],
            },
            {
                propertyName: 'Maldives Paradise Resort',
                propertyCode: `MAL-${uuidv4().substring(0, 5).toUpperCase()}`,
                propertyEmail: 'booking@maldivesresort.test',
                propertyContact: '+9603312345',
                description: 'Experience pure bliss at our water villas.',
                starRating: 4.5,
                city: 'Male',
                country: 'Maldives',
                category: luxuryCategory.id,
                type: resortType.id,
                image: [
                    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2',
                ],
            },
            {
                propertyName: 'City Center Inn New York',
                propertyCode: `NYC-${uuidv4().substring(0, 5).toUpperCase()}`,
                propertyEmail: 'stay@citycenterinn.test',
                propertyContact: '+12125550199',
                description: 'Convenient and comfortable stay in Manhattan.',
                starRating: 4,
                city: 'New York',
                country: 'USA',
                category: luxuryCategory.id,
                type: hotelType.id,
                image: [
                    'https://images.unsplash.com/photo-1551882547-ff40c0d128dc',
                ],
            },
        ];

        for (const dp of dummyProperties) {
            // console.log(
            //     `Creating Creation & Property for: ${dp.propertyName}...`
            // );

            // Create a Creation entity (Required by schema)
            const creation = await prisma.creation.create({
                data: {
                    type: 'property',
                    name: dp.propertyName,
                    createdById: adminUser.id,
                    images: dp.image,
                },
            });

            // Create the Property
            const property = await prisma.property.create({
                data: {
                    propertyName: dp.propertyName,
                    propertyEmail: dp.propertyEmail,
                    propertyContact: dp.propertyContact,
                    propertyCode: dp.propertyCode,
                    description: dp.description,
                    starRating: dp.starRating,
                    isDraft: false,
                    isAvailable: true,
                    isDeleted: false,
                    image: dp.image,
                    createdById: adminUser.id,
                    creationId: creation.id,

                    // Attach property configs (IMPORTANT for OTA Filter)
                    propertyConfigs: {
                        create: {
                            isAvailableForOTA: true,
                        },
                    },
                    // Attach Address (IMPORTANT for City/Country Filter)
                    propertyAddress: {
                        create: {
                            city: dp.city,
                            country: dp.country,
                            state: dp.city,
                            zipCode: '00000',
                            addressLine1: 'Main Street 1',
                            location: dp.city,
                            landmark: 'City Center',
                            latitude: 25.2048,
                            longitude: 55.2708,
                        },
                    },
                    // Attach Category
                    propertyCategory: {
                        create: {
                            masterCategoryId: dp.category,
                        },
                    },
                    // Attach Type
                    propertyType: {
                        create: {
                            masterPropertyTypeId: dp.type,
                        },
                    },
                },
            });

            // Link Creation to Property (1:1 relation requires both sides in some schemas, but Prisma usually handles it)
            await prisma.creation.update({
                where: { id: creation.id },
                data: { propertyId: property.id },
            });

            // console.log(
            //     `✅ Successfully created property: ${dp.propertyName} (Code: ${dp.propertyCode})`
            // );
        }

        // console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding properties:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
