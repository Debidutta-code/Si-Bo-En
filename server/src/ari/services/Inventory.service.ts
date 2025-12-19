import { InventoryDao } from '../repository';
import { errorResponse, successResponse } from '../../utils/return';
import { IWeekdayCharges, IWeekdayAdditionalCharges } from '../types/utills';
import { ICreateInventoryRepo, AdditionalGuestAmount, BaseGuestAmount, ICharges } from '../types';

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
    availableRooms: number
  ) {
    try {
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
      const response = await InventoryDao.createInventory(invTOCreated);
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
      const room = await InventoryDao.getRoom(propertyId, roomTypeCode);
      if (!room) {
        return errorResponse('No room found');
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

      // Create ICharges object for each date in the range
      const mappedRI: ICharges[] = [];
      for (
        let d = new Date(start.getTime());
        d.getTime() <= end.getTime();
        d.setDate(d.getDate() + 1)
      ) {
        const yyyyMmDd = new Date(d.getTime()).toISOString().split('T')[0];

        // Convert BaseGuestAmount to IBaseGuestAmounts
        const convertedBaseGuestAmounts = baseGuestAmounts.map(bg => ({
          noOfGuests: bg.numberOfGuests,
          amount: bg.amountBeforeTax
        }));

        // Convert AdditionalGuestAmount to IAdditionalGuestAmount
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
          date: yyyyMmDd,
        });
      }

      const daoRes = await InventoryDao.mapRatePlans(mappedRI);
      if (daoRes) {
        return successResponse('Mapping successful', daoRes);
      } else {
        return errorResponse('Failed to map ');
      }
    } catch (error: any) {
      console.log('Error', error?.message);
      return errorResponse('Failed to map room with rateplan');
    }
  }
}

export { InventoryServices };
