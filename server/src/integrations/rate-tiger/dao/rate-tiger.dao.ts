// repository/ratetiger.repository.ts

import { prisma } from '../../../config';
import { RateTigerMappingData } from '../types';

export class RateTigerDao {
  
  /**
   * Get property with all room types and rate plans
   */
  public static async getPropertyMappingData(
    propertyCode: string
  ): Promise<RateTigerMappingData | null> {
    try {
      // 1. Get property and rooms
      const property = await prisma.property.findUnique({
        where: { propertyCode },
        select: {
          propertyCode: true,
          propertyRooms: {
            where: {
              isDeleted: false,
              available: true
            },
            select: {
              roomType: true,
              roomName: true,
              maxOccupancy: true,
              maxNumberOfAdults: true
            }
          }
        }
      });

      if (!property) {
        return null;
      }

      // 2. Get all rate plans with date ranges
      const ratePlans = await prisma.ratePlan.findMany({
        where: {
          property: {
            propertyCode: propertyCode
          }
        },
        select: {
          ratePlanCode: true,
          ratePlanName: true,
          ratePlanRules: {
            select: {
              startDate: true,
              endDate: true
            }
          }
        }
      });

      // 3. Get inventory to determine room-rate plan mappings
      const inventories = await prisma.inventory.findMany({
        where: {
          propertyCode: propertyCode,
          date: {
            gte: new Date() // Only current/future inventory
          }
        },
        select: {
          roomTypeCode: true,
          ratePlans: true, // This is the String[] array
          date: true
        }
      });

      // 4. Build room-rate plan mappings from inventory
      const roomRateMappings = new Map<string, Set<string>>();
      
      inventories.forEach(inventory => {
        const roomTypeCode = inventory.roomTypeCode;
        
        if (!roomRateMappings.has(roomTypeCode)) {
          roomRateMappings.set(roomTypeCode, new Set());
        }
        
        // Add all rate plans from this inventory record
        inventory.ratePlans.forEach(ratePlanCode => {
          roomRateMappings.get(roomTypeCode)!.add(ratePlanCode);
        });
      });

      // 5. Build roomRates array (the mapping!)
      const roomRates: Array<{
        ratePlanCode: string;
        roomTypeCode: string;
        status: "Active" | "inActive";
      }> = [];

      // Get all unique room types
      const allRoomTypes = property.propertyRooms.map(r => r.roomType);
      const allRatePlanCodes = ratePlans.map(rp => rp.ratePlanCode);

      // Create cross-reference for all combinations
      allRoomTypes.forEach(roomTypeCode => {
        allRatePlanCodes.forEach(ratePlanCode => {
          const isActive = roomRateMappings.get(roomTypeCode)?.has(ratePlanCode) || false;
          
          roomRates.push({
            ratePlanCode,
            roomTypeCode,
            status: isActive ? "Active" : "inActive"
          });
        });
      });

      // 6. Format rate plans with date ranges
      const formattedRatePlans = ratePlans.map(rp => ({
        ratePlanCode: rp.ratePlanCode,
        ratePlanName: rp.ratePlanName,
        effectiveDate: rp.ratePlanRules?.startDate || null,
        expireDate: rp.ratePlanRules?.endDate || null
      }));

      // 7. Format room types
      const formattedRoomTypes = property.propertyRooms.map(room => ({
        roomTypeCode: room.roomType,
        roomTypeName: room.roomName,
        maxOccupancy: room.maxOccupancy,
        maxNumberOfAdults: room.maxNumberOfAdults
      }));

      return {
        propertyCode: property.propertyCode,
        ratePlans: formattedRatePlans,
        roomTypes: formattedRoomTypes,
        roomRates: roomRates
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch property mapping data: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching property mapping data');
    }
  }

  /**
   * Verify property exists
   */
  public static async propertyExists(propertyCode: string): Promise<boolean> {
    try {
      const property = await prisma.property.findUnique({
        where: { propertyCode },
        select: { id: true }
      });
      return !!property;
    } catch (error) {
      throw new Error('Failed to verify property existence');
    }
  }
}