import { prisma } from '../../config';
import type { ICRoom } from '../types';

export class RoomDao {
    public async create(roomData: ICRoom) {
        try {
            return await prisma.room.create({
                data: {
                    roomName: roomData.roomName,
                    roomType: roomData.roomType,
                    totalRoom: roomData.totalRoom,
                    floor: roomData.floor,
                    roomSize: roomData.roomSize,
                    roomUnit: roomData.roomUnit,
                    smokingPolicy: roomData.smokingPolicy,
                    maxOccupancy: roomData.maxOccupancy,
                    maxNumberOfAdults: roomData.maxNumberOfAdults,
                    maxNumberOfChildren: roomData.maxNumberOfChildren,
                    numberOfBedrooms: roomData.numberOfBedrooms,
                    numberOfLivingRoom: roomData.numberOfLivingRoom,
                    extraBed: roomData.extraBed,
                    description: roomData.description,
                    image: roomData.image || [],
                    available: roomData.available ?? true,
                    propertyId: roomData.propertyId,
                    priority: roomData.priority,
                },
            });
        } catch (error) {
            throw new Error('Failed to create room');
        }
    }
    public async findByRoomId(roomId: string) {
        try {
            return await prisma.room.findUnique({
                where: {
                    id: roomId,
                    isDeleted: false,
                },
                include: {
                    property: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to find room');
        }
    }

    public async findByRoomName(propertyId: string, roomName: string) {
        try {
            return await prisma.room.findFirst({
                where: {
                    roomName: roomName,
                    propertyId,
                },
            });
        } catch (error) {
            throw new Error('Failed to find room by name');
        }
    }
    public async findByRoomType(propertyId: string, roomType: string) {
        try {
            return await prisma.room.findFirst({
                where: {
                    roomType: roomType,
                    propertyId,
                },
                include: {
                    RoomViews: {
                        include: {
                            MasterRoomView: true,
                        },
                    },
                    TouristTaxs: {
                        select: {
                            id: true,
                            name: true,
                            discountType: true,
                            discountValue: true,
                            currencyCode: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Failed to find room by type');
        }
    }

    public async updateRoom(id: string, roomData: ICRoom) {
        try {
            const updatedRoom = await prisma.room.update({
                where: { id },
                data: {
                    roomName: roomData.roomName,
                    roomType: roomData.roomType,
                    totalRoom: roomData.totalRoom,
                    floor: roomData.floor,
                    roomSize: roomData.roomSize,
                    roomUnit: roomData.roomUnit,
                    smokingPolicy: roomData.smokingPolicy,
                    maxOccupancy: roomData.maxOccupancy,
                    maxNumberOfAdults: roomData.maxNumberOfAdults,
                    maxNumberOfChildren: roomData.maxNumberOfChildren,
                    numberOfBedrooms: roomData.numberOfBedrooms,
                    numberOfLivingRoom: roomData.numberOfLivingRoom,
                    extraBed: roomData.extraBed,
                    description: roomData.description,
                    image: roomData.image || [],
                    available: roomData.available ?? true,
                    propertyId: roomData.propertyId,
                    priority: roomData.priority,
                },
            });
            return updatedRoom;
        } catch (error) {
            throw new Error('Failed to update room');
        }
    }

    public async delete(id: string) {
        try {
            const deletedRoom = await prisma.room.delete({
                where: { id },
            });

            return deletedRoom;
        } catch (error) {
            throw new Error('Failed to delete room');
        }
    }

    public async getRoomsByPropertyId(propertyId: string, isDeleted: boolean) {
        try {
            const rooms = await prisma.room.findMany({
                where: { propertyId, isDeleted },
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    roomAmenities: {
                        include: {
                            amenity: {
                                select: {
                                    amenityName: true,
                                    id: true,
                                    icon: true,
                                    description: true,
                                },
                            },
                        },
                    },
                },
            });
            return rooms;
        } catch (error) {
            throw new Error('Failed to fetch rooms');
        }
    }
    public async getAllPropertyRoomsForInvSetup(propertyId: string) {
        try {
            const rooms = await prisma.room.findMany({
                where: { propertyId, isDeleted: false },
                select: {
                    id: true,
                    roomName: true,
                    roomType: true,
                    totalRoom: true,
                    maxNumberOfAdults: true,
                    maxNumberOfChildren: true,
                    maxOccupancy: true,
                },
            });
            return rooms;
        } catch (error) {
            throw new Error('Failed to fetch rooms');
        }
    }
    public async add360ViewLinkToRoom(roomId: string, view360Link: string) {
        try {
            const updatedRoom = await prisma.room.update({
                where: { id: roomId },
                data: {
                    view360Link: view360Link,
                },
            });
            return updatedRoom;
        } catch (error) {
            throw new Error('Failed to add 360 view link');
        }
    }
    public async createRoomView(viewData: {
        roomId: string;
        masterViewId: string;
    }): Promise<any> {
        try {
            return await prisma.mRoomView.create({
                data: {
                    roomId: viewData.roomId,
                    masterRoomViewId: viewData.masterViewId,
                },
            });
        } catch (error) {
            throw new Error('Failed to create room view');
        }
    }
    public async updateRoomView(viewData: {
        roomId: string;
        masterViewId: string;
    }): Promise<any> {
        try {
            return await prisma.mRoomView.upsert({
                where: {
                    roomId: viewData.roomId,
                },
                create: {
                    roomId: viewData.roomId,
                    masterRoomViewId: viewData.masterViewId,
                },
                update: {
                    masterRoomViewId: viewData.masterViewId,
                },
            });
        } catch (error) {
            // console.log('Error updating room view:', error);
            throw new Error('Failed to update room view');
        }
    }
    public async deleteRoomView(roomId: string): Promise<any> {
        try {
            // Tolerate delete when mapping doesn't exist.
            const existing = await prisma.mRoomView.findUnique({
                where: { roomId },
                select: { roomId: true },
            });

            if (!existing) {
                return { success: true, deleted: false };
            }

            return await prisma.mRoomView.delete({
                where: { roomId },
            });
        } catch (error) {
            throw new Error('Failed to delete room view');
        }
    }
}

export class RoomAmenityDao {
    public async createAmenities(
        roomId: string,
        amenities: Record<string, boolean>
    ) {
        try {
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: {
                    roomAmenities: true,
                },
            });

            if (!room) {
                throw new Error('Room not found');
            }

            const selectedAmenities = Object.entries(amenities)
                .filter(([_, isSelected]) => isSelected)
                .map(([amenityName]) => amenityName);

            if (selectedAmenities.length === 0) {
                if (room.roomAmenities && room.roomAmenities.length > 0) {
                    await prisma.roomAmenitySelection.deleteMany({
                        where: { roomId },
                    });
                }
                return room;
            }

            const masterAmenities = await prisma.masterAmenity.findMany({
                where: {
                    amenityName: {
                        in: selectedAmenities,
                    },
                    amenityType: 'room',
                    isActive: true,
                },
            });
            if (masterAmenities.length === 0) {
                throw new Error('No valid amenities found in master amenities');
            }

            if (masterAmenities.length < selectedAmenities.length) {
                const foundNames = masterAmenities.map(a => a.amenityName);
                const notFound = selectedAmenities.filter(
                    name => !foundNames.includes(name)
                );
                console.warn(
                    `Warning: Some amenities not found in master table: ${notFound.join(', ')}`
                );
            }

            if (room.roomAmenities && room.roomAmenities.length > 0) {
                await prisma.roomAmenitySelection.deleteMany({
                    where: { roomId },
                });
            }

            const updatedRoom = await prisma.room.update({
                where: { id: roomId },
                data: {
                    roomAmenities: {
                        create: masterAmenities.map(amenity => ({
                            amenityId: amenity.id,
                        })),
                    },
                },
                include: {
                    roomAmenities: {
                        include: {
                            amenity: true,
                        },
                    },
                },
            });

            return updatedRoom;
        } catch (error) {
            throw new Error('Failed to create room amenities');
        }
    }

    private async findByRoomId(
        roomId: string
    ): Promise<Record<string, boolean> | null> {
        try {
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: {
                    roomAmenities: {
                        include: {
                            amenity: true,
                        },
                    },
                },
            });

            if (!room) {
                throw new Error('Room not found');
            }

            const amenitiesMap: Record<string, boolean> = {};
            room.roomAmenities.forEach(selection => {
                amenitiesMap[selection.amenity.amenityName] = true;
            });

            return Object.keys(amenitiesMap).length > 0 ? amenitiesMap : null;
        } catch (error) {
            throw new Error('Failed to find amenities by room ID');
        }
    }

    public async updateByRoomId(
        roomId: string,
        amenities: Record<string, boolean>
    ): Promise<Record<string, boolean> | null> {
        try {
            await prisma.roomAmenitySelection.deleteMany({
                where: { roomId },
            });
            const selectedAmenities = Object.entries(amenities)
                .filter(([_, isSelected]) => isSelected)
                .map(([amenityName]) => amenityName);

            if (selectedAmenities.length === 0) {
                return {}; // All amenities removed
            }
            const masterAmenities = await prisma.masterAmenity.findMany({
                where: {
                    amenityName: {
                        in: selectedAmenities,
                    },
                    amenityType: 'room',
                    isActive: true,
                },
            });
            const updated = await prisma.room.update({
                where: { id: roomId },
                data: {
                    roomAmenities: {
                        create: masterAmenities.map(amenity => ({
                            amenityId: amenity.id,
                        })),
                    },
                },
                include: {
                    roomAmenities: {
                        include: {
                            amenity: true,
                        },
                    },
                },
            });
            const amenitiesMap: Record<string, boolean> = {};
            updated.roomAmenities.forEach(selection => {
                amenitiesMap[selection.amenity.amenityName] = true;
            });

            return amenitiesMap;
        } catch (error) {
            throw new Error('Failed to update amenities');
        }
    }

    public async deleteByRoomId(roomId: string): Promise<{ deleted: boolean }> {
        try {
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: { roomAmenities: true },
            });

            if (!room) {
                throw new Error('Room not found');
            }

            if (!room.roomAmenities || room.roomAmenities.length === 0) {
                throw new Error('Amenities do not exist for this room');
            }
            await prisma.roomAmenitySelection.deleteMany({
                where: { roomId },
            });

            return { deleted: true };
        } catch (error) {
            throw new Error('Failed to delete amenities');
        }
    }

    public async existsByRoomId(roomId: string): Promise<boolean> {
        try {
            const count = await prisma.roomAmenitySelection.count({
                where: { roomId },
            });

            return count > 0;
        } catch (error) {
            throw new Error('Failed to check amenities existence');
        }
    }

    public async getActiveAmenities(roomId: string): Promise<string[]> {
        try {
            const selections = await prisma.roomAmenitySelection.findMany({
                where: { roomId },
                include: {
                    amenity: true,
                },
            });

            return selections
                .filter(selection => selection.amenity.isActive)
                .map(selection => selection.amenity.amenityName);
        } catch (error) {
            throw new Error('Failed to get active amenities');
        }
    }
}
