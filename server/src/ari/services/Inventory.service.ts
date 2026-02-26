import { InventoryDao } from '../repository';
import { errorResponse, successResponse } from '../../utils/return';
import { ICreateInventoryRepo, AdditionalGuestAmount, BaseGuestAmount, ICharges } from '../types';
import {toUTC} from "../../utils";

class InventoryServices {
  public static async getInventoryServices(
    hotelCode: string,
    page: number,
    resultPerPage: number,
    startDate: Date,
    endDate?: Date,
    invTypeCode?: string
  ) {
    try {
      const response = await InventoryDao.getInventoryDao(
        hotelCode,
        page,
        invTypeCode && invTypeCode,
        startDate && startDate,
        endDate && endDate
      );
      if (response) {
        return successResponse(
          'Rate Plans and availability fetched successfully',
          response
        );
      } else {
        return errorResponse('Failed to fetch rateplans');
      }
    } catch (error: any) {
      return errorResponse(`Failed to delete RatePlan`, error?.message);
    }
  }
  public static async getAllRoomTypeService(hotelCode: string) {
    try {
      const property = await InventoryDao.isPropertyExists(hotelCode);
      if (!property) {
        return errorResponse('Property not found');
      }
      const roomTypes = await InventoryDao.getAllRoomTypeDao(property.id);
      if (!roomTypes) {
        return errorResponse('No Room found under this property');
      }
      return successResponse('RoomTypes fetched successfully', roomTypes);
    } catch (error: any) {
      return errorResponse(`Failed to delete RatePlan`, error?.message);
    }
  }
  public static async createInventoryService(
    propertyCode: string,
    roomType: string,
    startDate: string,
    endDate: string,
    availableRooms: number,
    pushFromCalender?:boolean
  ) {
    try {
      console.log(startDate)
      console.log(endDate)
      const property = await InventoryDao.isPropertyExists(propertyCode);
      if (!property) {
        return errorResponse('Property not found');
      }
      const isRoomExists = await InventoryDao.getRoom(
        property.id,
        roomType
      );
      if (!isRoomExists) {
        return errorResponse('Room  not found');
      }
      if (availableRooms > isRoomExists.totalRoom) {
        return errorResponse(
          'Available rooms cannot be greater than No of rooms exist'
        );
      }
      // Validate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return errorResponse('Invalid startDate or endDate');
      }
      if (end < start) {
        return errorResponse('endDate cannot be earlier than startDate');
      }

      // Build one availability record per date in the inclusive range
      const invTOCreated: ICreateInventoryRepo[] = [];
      for (
        let d = new Date(start.getTime());
        d.getTime() <= end.getTime();
        d.setDate(d.getDate() + 1)
      ) {
        const yyyyMmDd = new Date(d.getTime()).toISOString().split('T')[0];
        invTOCreated.push({
          propertyCode,
          roomTypeCode: roomType,
          date: yyyyMmDd,
          availability: availableRooms,
        });
      }
      const response = await InventoryDao.createInventory(invTOCreated );
      if (response) {
        return successResponse(
          'Availability added/updated successfully',
          response
        );
      } else {
        return errorResponse('Failed to added/updated availability');
      }
    } catch (error: any) {
      return errorResponse('Failed to add/update availability');
    }
  }
  public static async mapRatePlanService(
  propertyId: string,
  propertyCode: string,
  roomTypeName: string,
  roomTypeCode: string,
  ratePlanName: string,
  ratePlanCode: string,
  baseGuestAmounts: BaseGuestAmount[],
  additionalGuestAmounts: AdditionalGuestAmount[],
  currencyCode: string,
  startDate: string,
  endDate: string
) {
  try {
    console.log('📋 mapRatePlanService called with:', {
      propertyId,
      propertyCode,
      roomTypeCode,
      ratePlanCode,
      startDate,
      endDate
    });

    const room = await InventoryDao.getRoom(propertyId, roomTypeCode);
    console.log('🏨 Room lookup result:', room ? `Found room: ${room.roomType}` : 'No room found');
    
    if (!room) {
      return errorResponse(`No room found with roomTypeCode: ${roomTypeCode} for property: ${propertyId}`);
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return errorResponse('Invalid startDate or endDate');
    }
    if (end < start) {
      return errorResponse('endDate cannot be earlier than startDate');
    }

    // ✅ Check inventory availability for the date range
    console.log('🔍 Checking inventory availability for:', { propertyCode, roomTypeCode, startDate, endDate });
    const inventoryCheck = await InventoryDao.checkInventoryAvailability(
      propertyCode,
      roomTypeCode,
      startDate,
      endDate
    );
    console.log('📦 Inventory check result:', inventoryCheck);

    // If no inventory at all for the entire range
    if (inventoryCheck.availableDates.length === 0) {
      return errorResponse(
        `Please add your inventory before mapping rate plans for this room `
      );
    }

    // If some dates are missing inventory
    if (inventoryCheck.missingDates.length > 0) {
      // Create charges only for dates with inventory
      const mappedRI: ICharges[] = [];
      for (const dateStr of inventoryCheck.availableDates) {
        const convertedBaseGuestAmounts = baseGuestAmounts.map(bg => ({
          noOfGuests: bg.numberOfGuests,
          amount: bg.amountBeforeTax
        }));

        const convertedAdditionalGuestAmounts = additionalGuestAmounts.map(ag => ({
          ageCode: ag.ageQualifyingCode as "10" | "8" | "5",
          amount: ag.amount
        }));

        mappedRI.push({
          propertyCode,
          roomTypeName,
          roomTypeCode,
          ratePlanName,
          ratePlanCode,
          baseGuestAmounts: convertedBaseGuestAmounts,
          additionalGuestAmounts: convertedAdditionalGuestAmounts,
          currencyCode,
          date: dateStr,
        });
      }

      const daoRes = await InventoryDao.mapRatePlans(mappedRI);
      
      if (daoRes) {
        // Format the missing dates for better readability
        const firstMissing = inventoryCheck.missingDates[0];
        const lastMissing = inventoryCheck.missingDates[inventoryCheck.missingDates.length - 1];
        
        return successResponse(
          `Rate plan mapped successfully for available dates. WARNING: Please update your inventory from ${firstMissing} to ${lastMissing} to map rate plans for the remaining dates.`,
          {
            ...daoRes,
            warning: {
              message: 'Inventory missing for some dates',
              missingDates: inventoryCheck.missingDates,
              missingDateRange: `${firstMissing} to ${lastMissing}`,
              mappedDates: inventoryCheck.availableDates
            }
          }
        );
      } else {
        return errorResponse('Failed to map rate plans');
      }
    }
    const mappedRI: ICharges[] = [];
    for (
      let d = new Date(start.getTime());
      d.getTime() <= end.getTime();
      d.setDate(d.getDate() + 1)
    ) {
      const yyyyMmDd = new Date(d.getTime()).toISOString().split('T')[0];

      const convertedBaseGuestAmounts = baseGuestAmounts.map(bg => ({
        noOfGuests: bg.numberOfGuests,
        amount: bg.amountBeforeTax
      }));

      const convertedAdditionalGuestAmounts = additionalGuestAmounts.map(ag => ({
        ageCode: ag.ageQualifyingCode as "10" | "8" | "5",
        amount: ag.amount
      }));

      mappedRI.push({
        propertyCode,
        roomTypeName,
        roomTypeCode,
        ratePlanName,
        ratePlanCode,
        baseGuestAmounts: convertedBaseGuestAmounts,
        additionalGuestAmounts: convertedAdditionalGuestAmounts,
        currencyCode,
        date: toUTC(yyyyMmDd),
      });
    }

    const daoRes = await InventoryDao.mapRatePlans(mappedRI);
    if (daoRes) {
      return successResponse('Rate plan mapped successfully', daoRes);
    } else {
      return errorResponse('Failed to map rate plans');
    }
  } catch (error) {
    console.log(error)
    if(error instanceof Error){
      return errorResponse("Failed to map room with rate plan",error.message);
    }
    return errorResponse('Failed to map room with rate plan');
  }
}
}

export { InventoryServices };
