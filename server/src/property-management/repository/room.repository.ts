import { prisma } from "../../config";
import type {roomView,roomUnit,smokingPolicy} from "../types/room.type";

export class RoomDao {
  public static async create(roomData: {
    roomName: string;
    roomType: string;
    totalRoom: number;
    floor: number;
    roomView?: roomView;
    roomSize: number;
    roomUnit?: roomUnit;
    smokingPolicy?: smokingPolicy;
    maxOccupancy: number;
    maxNumberOfAdults: number;
    maxNumberOfChildren: number;
    numberOfBedrooms?: number;
    numberOfLivingRoom?: number;
    extraBed?: number;
    description?: string;
    image?: string[];
    available?: boolean;
    propertyId: string;
    amenities?: any;
  }) {
    try {
      const newRoom = await prisma.room.create({
        data: {
          roomName: roomData.roomName,
          roomType: roomData.roomType,
          totalRoom: roomData.totalRoom,
          floor: roomData.floor,
          roomView: roomData.roomView ,
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
          // Note: amenities are handled separately via RoomAmenityDao
        },
      });

      return newRoom;
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async findById(id: string) {
    try {
      const room = await prisma.room.findFirst({
        where: {
          id: id,
          isDeleted: false,
        },
      });
      return room;
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async findByRoomName(
    propertyId: string,
    roomName: string
  ) {
    try {
      const room = await prisma.room.findFirst({
        where: {
          roomName: roomName,
          propertyId
        },
      });
      return room;
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async findAll(
    isDeleted: boolean,
    available: boolean
  ) {
    try {
      const rooms = await prisma.room.findMany({
        where: {
          isDeleted: isDeleted,
          available: available,
        },
      });
      return rooms;
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async update(
    id: string,
    roomData: {
      roomName?: string;
      roomType?: string;
      totalRoom?: number;
      floor?: number;
      roomView?: string;
      roomSize?: number;
      roomUnit?: string;
      smokingPolicy?: string;
      maxOccupancy?: number;
      maxNumberOfAdults?: number;
      maxNumberOfChildren?: number;
      numberOfBedrooms?: number;
      numberOfLivingRoom?: number;
      extraBed?: number;
      description?: string;
      image?: string[];
      available?: boolean;
      amenities?: any;
    }
  ) {
    try {
      const updatedRoom = await prisma.room.update({
        where: { id },
        data: {
          ...(roomData.roomName && { roomName: roomData.roomName }),
          ...(roomData.roomType && { roomType: roomData.roomType }),
          ...(roomData.totalRoom !== undefined && { totalRoom: roomData.totalRoom }),
          ...(roomData.floor !== undefined && { floor: roomData.floor }),
          ...(roomData.roomView && { roomView: roomData.roomView as any }),
          ...(roomData.roomSize !== undefined && { roomSize: roomData.roomSize }),
          ...(roomData.roomUnit && { roomUnit: roomData.roomUnit as any }),
          ...(roomData.smokingPolicy && { smokingPolicy: roomData.smokingPolicy as any }),
          ...(roomData.maxOccupancy !== undefined && { maxOccupancy: roomData.maxOccupancy }),
          ...(roomData.maxNumberOfAdults !== undefined && { maxNumberOfAdults: roomData.maxNumberOfAdults }),
          ...(roomData.maxNumberOfChildren !== undefined && { maxNumberOfChildren: roomData.maxNumberOfChildren }),
          ...(roomData.numberOfBedrooms !== undefined && { numberOfBedrooms: roomData.numberOfBedrooms }),
          ...(roomData.numberOfLivingRoom !== undefined && { numberOfLivingRoom: roomData.numberOfLivingRoom }),
          ...(roomData.extraBed !== undefined && { extraBed: roomData.extraBed }),
          ...(roomData.description && { description: roomData.description }),
          ...(roomData.image && { image: roomData.image }),
          ...(roomData.available !== undefined && { available: roomData.available }),
          ...(roomData.amenities && { amenities: roomData.amenities }),
        },
      });
      return updatedRoom;
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async delete(id: string) {
    try {
      const deletedRoom = await prisma.room.update({
        where: { id },
        data: {
          isDeleted: true,
        },
      });

      return deletedRoom;
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async getRoomsByPropertyId(propertyId: string,isDeleted:boolean) {
    try {
      const rooms = await prisma.room.findMany({
        where: { propertyId,isDeleted },
        include:{
          roomAmenities:{
            include:{
              amenity:{
                select:{
                  amenityName:true,
                  id:true,
                  icon:true,
                  description:true
                }
              }
            }
          }
        }
      });
      return rooms;
    } catch (error: any) {
      if(error instanceof Error){
        throw new Error(error.message);
      }
      throw new Error("Failed to fetch rooms");
    }
  }
  public static async getAllPropertyRoomsForInvSetup(propertyId: string) {
    try {
      const rooms = await prisma.room.findMany({
        where: { propertyId ,isDeleted:false},
        select: {
          id: true,
          roomName: true,
          roomType: true,
          totalRoom: true,
      }});
      return rooms;
    } catch (error: any) {
      if(error instanceof Error){
        throw new Error(error.message);
      }
      throw new Error("Failed to fetch rooms");
    }
  }
  public static async add360ViewLinkToRoom(
    roomId: string,
    view360Link: string
  ) {
    try {
      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          view360Link: view360Link,
        },
      });
      return updatedRoom;
    } catch (error: any) {
      throw new Error(`Failed to add 360 view link: ${error.message}`);
    }
  }
}

export class RoomAmenityDao {
  public static async createAmenities(
    roomId: string,
    amenities: Record<string, boolean>
  ) {
    try {
      // Verify room exists
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          roomAmenities: true
        },
      });

      if (!room) {
        throw new Error('Room not found');
      }

      // Get amenity names that are selected (true)
      const selectedAmenities = Object.entries(amenities)
        .filter(([_, isSelected]) => isSelected)
        .map(([amenityName]) => amenityName);

      if (selectedAmenities.length === 0) {
        // If no amenities selected, delete existing ones if any
        if (room.roomAmenities && room.roomAmenities.length > 0) {
          await prisma.roomAmenitySelection.deleteMany({
            where: { roomId }
          });
        }
        return room;
      }

      // Find the master amenities by name
      const masterAmenities = await prisma.masterAmenity.findMany({
        where: {
          amenityName: {
            in: selectedAmenities
          },
          amenityType: 'room',
          isActive: true
        }
      });
      //console.log(masterAmenities)
      if (masterAmenities.length === 0) {
        throw new Error('No valid amenities found in master amenities');
      }

      // Warn if some amenities weren't found
      if (masterAmenities.length < selectedAmenities.length) {
        const foundNames = masterAmenities.map(a => a.amenityName);
        const notFound = selectedAmenities.filter(name => !foundNames.includes(name));
        console.warn(`Warning: Some amenities not found in master table: ${notFound.join(', ')}`);
      }

      // Delete existing amenities first (upsert behavior)
      if (room.roomAmenities && room.roomAmenities.length > 0) {
        await prisma.roomAmenitySelection.deleteMany({
          where: { roomId }
        });
      }

      // Create new room amenity selections
      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          roomAmenities: {
            create: masterAmenities.map(amenity => ({
              amenityId: amenity.id
            }))
          }
        },
        include: {
          roomAmenities: {
            include: {
              amenity: true
            }
          }
        }
      });

      return updatedRoom;
    } catch (error: any) {
      throw new Error(`Failed to create room amenities: ${error.message}`);
    }
  }

  private static async findByRoomId(
    roomId: string
  ): Promise<Record<string, boolean> | null> {
    try {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          roomAmenities: {
            include: {
              amenity: true
            }
          }
        },
      });

      if (!room) {
        throw new Error('Room not found');
      }

      // Convert relational data to the old format for backward compatibility
      const amenitiesMap: Record<string, boolean> = {};
      room.roomAmenities.forEach(selection => {
        amenitiesMap[selection.amenity.amenityName] = true;
      });

      return Object.keys(amenitiesMap).length > 0 ? amenitiesMap : null;
    } catch (error: any) {
      throw new Error(
        `Failed to find amenities by room ID: ${error.message}`
      );
    }
  }

  public static async updateByRoomId(
    roomId: string,
    amenities: Record<string, boolean>
  ): Promise<Record<string, boolean> | null> {
    try {
      // First, delete all existing room amenity selections
      await prisma.roomAmenitySelection.deleteMany({
        where: { roomId }
      });

      // Get amenity names that are true
      const selectedAmenities = Object.entries(amenities)
        .filter(([_, isSelected]) => isSelected)
        .map(([amenityName]) => amenityName);

      if (selectedAmenities.length === 0) {
        return {}; // All amenities removed
      }

      // Find the master amenities by name
      const masterAmenities = await prisma.masterAmenity.findMany({
        where: {
          amenityName: {
            in: selectedAmenities
          },
          amenityType: 'room',
          isActive: true
        }
      });

      // Create new room amenity selections
      const updated = await prisma.room.update({
        where: { id: roomId },
        data: {
          roomAmenities: {
            create: masterAmenities.map(amenity => ({
              amenityId: amenity.id
            }))
          }
        },
        include: {
          roomAmenities: {
            include: {
              amenity: true
            }
          }
        }
      });

      // Convert to old format
      const amenitiesMap: Record<string, boolean> = {};
      updated.roomAmenities.forEach(selection => {
        amenitiesMap[selection.amenity.amenityName] = true;
      });

      return amenitiesMap;
    } catch (error: any) {
      throw new Error(`Failed to update amenities: ${error.message}`);
    }
  }

  public static async deleteByRoomId(
    roomId: string
  ): Promise<{ deleted: boolean }> {
    try {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { roomAmenities: true }
      });

      if (!room) {
        throw new Error('Room not found');
      }

      if (!room.roomAmenities || room.roomAmenities.length === 0) {
        throw new Error('Amenities do not exist for this room');
      }

      // Delete all room amenity selections
      await prisma.roomAmenitySelection.deleteMany({
        where: { roomId }
      });

      return { deleted: true };
    } catch (error: any) {
      throw new Error(`Failed to delete amenities: ${error.message}`);
    }
  }

  public static async existsByRoomId(
    roomId: string
  ): Promise<boolean> {
    try {
      const count = await prisma.roomAmenitySelection.count({
        where: { roomId }
      });

      return count > 0;
    } catch (error: any) {
      throw new Error(`Failed to check amenities existence: ${error.message}`);
    }
  }

  public static async getActiveAmenities(
    roomId: string
  ): Promise<string[]> {
    try {
      const selections = await prisma.roomAmenitySelection.findMany({
        where: { roomId },
        include: {
          amenity: true
        }
      });

      // Filter for active amenities and return their names
      return selections
        .filter(selection => selection.amenity.isActive)
        .map(selection => selection.amenity.amenityName);
    } catch (error: any) {
      throw new Error(`Failed to get active amenities: ${error.message}`);
    }
  }
}