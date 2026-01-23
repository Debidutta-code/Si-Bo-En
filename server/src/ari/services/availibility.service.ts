import { AvailabilityRepository } from '../repository';
import { errorResponse, successResponse } from '../../utils/return';
import {
  eachDayOfInterval,
  format,
  getDay,
  isSameDay,
  isWithinInterval,
  startOfDay,
  subDays,
} from 'date-fns';
import type { ICalendarResponse } from '../types/availability.types';

export class AvailabilityServices {
  public static async getCalendarAvailability(
    propertyCode: string,
    startDate: Date,
    endDate: Date,
    roomTypeCodes: string[] = []
  ) {
    try {
      // Fetch all required data
      const [property, inventories, charges, reservations] = await Promise.all([
        AvailabilityRepository.getPropertyByCode(propertyCode, roomTypeCodes),
        AvailabilityRepository.getInventoryForDateRange(propertyCode, startDate, endDate, roomTypeCodes),
        AvailabilityRepository.getChargesForDateRange(propertyCode, startDate, endDate, roomTypeCodes),
        AvailabilityRepository.getReservationsForDateRange(propertyCode, startDate, endDate, roomTypeCodes),
      ]);

      if (!property) {
        return errorResponse('Property not found');
      }

      // Filter property rooms if room type codes provided
      const filteredRooms = roomTypeCodes.length > 0
        ? property.propertyRooms.filter(room => roomTypeCodes.includes(room.roomType))
        : property.propertyRooms;

      // Get all dates in range (exclusive of end date - standard hotel logic)
      // If requesting Jan 6 to Jan 9, return [Jan 6, Jan 7, Jan 8]
      const dates = eachDayOfInterval({ 
        start: startDate, 
        end: subDays(endDate, 1) // Exclude end date
      });

      // Calculate sold rooms per day per room type
      const soldRoomsMap = this.calculateSoldRooms(reservations, dates);

      // Build calendar response
      const calendarDays = dates.map((date) => {
        return this.buildDayData(
          date,
          { ...property, propertyRooms: filteredRooms },
          inventories,
          charges,
          soldRoomsMap
        );
      });

      // Calculate summary
      const summary = this.calculateSummary(calendarDays, dates.length);

      const response: ICalendarResponse = {
        hotelCode: property.propertyCode,
        hotelName: property.propertyName,
        summary,
        days: calendarDays,
      };

      return successResponse('Calendar availability fetched successfully', response);
    } catch (error: any) {
      return errorResponse('Failed to fetch calendar availability', error?.message);
    }
  }

  private static calculateSoldRooms(reservations: any[], dates: Date[]) {
    const soldMap = new Map<string, Map<string, number>>();

    dates.forEach((date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      soldMap.set(dateKey, new Map());

      // Normalize the current date to start of day (removes time component)
      const normalizedDate = startOfDay(date);

      reservations.forEach((reservation) => {
        // Normalize reservation dates to start of day in local timezone
        const checkIn = startOfDay(new Date(reservation.checkInDate));
        const checkOut = startOfDay(new Date(reservation.checkOutDate));

        // Check if this date falls within the reservation period
        // A room is occupied from check-in day (inclusive) to check-out day (exclusive)
        const isWithin = isWithinInterval(normalizedDate, { start: checkIn, end: checkOut });
        const isSameCheckout = isSameDay(normalizedDate, checkOut);

        if (isWithin && !isSameCheckout) {
          const roomTypeCode = reservation.roomTypeCode;
          const currentSold = soldMap.get(dateKey)!.get(roomTypeCode) || 0;
          soldMap.get(dateKey)!.set(roomTypeCode, currentSold + 1);
        }
      });
    });

    return soldMap;
  }

  private static buildDayData(
    date: Date,
    property: any,
    inventories: any[],
    charges: any[],
    soldRoomsMap: Map<string, Map<string, number>>
  ) {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][getDay(date)];
    const soldMap = soldRoomsMap.get(dateKey) || new Map();

    // Get inventories for this date
    const dayInventories = inventories.filter((inv) => inv.date === dateKey);

    // Get charges for this date
    const dayCharges = charges.filter((charge) => {
      const chargeDate = format(new Date(charge.date), 'yyyy-MM-dd');
      return chargeDate === dateKey;
    });

    // Build room types data
 const roomTypes = property.propertyRooms.map((room: any) => {
  // Physical rooms from Room table
  const totalInventory = room.totalRoom || 0;
  
  // Find inventory for this specific room type on this date
  const dayInventory = dayInventories.find((inv) => inv.roomTypeCode === room.roomType);
  
  // Inventory availability for this date (if no inventory record, use 0)
  const inventoryAvailable = dayInventory?.availability ?? 0;
  
  // Sold rooms for this date
  const sold = soldMap.get(room.roomType) || 0;
  
  // Available = inventory available - sold (not totalRoom - sold)
  const available = Math.max(0, inventoryAvailable);
  
  const hasCharges = dayCharges.some((c) => c.roomTypeCode === room.roomType && !c.isSaleStopped);

  return {
    invTypeCode: room.roomType,
    available,
    sold,
    occupancy: totalInventory > 0 ? (sold / totalInventory) * 100 : 0,
    status: hasCharges && available > 0 ? 'open' : 'close',
    _totalInventory: totalInventory, // This is the physical room count
  };
});

    // Build rate plans data
    const ratePlanMap = new Map<string, any>();

    dayCharges.forEach((charge) => {
      if (!ratePlanMap.has(charge.ratePlanCode)) {
        const ratePlan = property.ratePlans.find((rp: any) => rp.ratePlanCode === charge.ratePlanCode);
        ratePlanMap.set(charge.ratePlanCode, {
          ratePlanCode: charge.ratePlanCode,
          ratePlanName: ratePlan?.ratePlanName || '',
          minLengthOfStay: ratePlan?.minimumLenghthOfStay || 0,
          maxLengthOfStay: ratePlan?.maximumLengthOfStay || 0,
          cta: charge.isClosedToArrival,
          ctd: charge.isClosedToDeparture,
          prices: [],
        });
      }

      const ratePlanData = ratePlanMap.get(charge.ratePlanCode);
      const inventory = dayInventories.find((inv) => inv.roomTypeCode === charge.roomTypeCode);
      const sold = soldMap.get(charge.roomTypeCode) || 0;
      const available = (inventory?.availability || 0) - sold;

      ratePlanData.prices.push({
        invTypeCode: charge.roomTypeCode,
        currencyCode: charge.currencyCode,
        sellStatus: charge.isSaleStopped || available <= 0 ? 'close' : 'open',
        cta: charge.isClosedToArrival,
        ctd: charge.isClosedToDeparture,
        baseByGuestAmts: charge.baseGuestAmounts.map((bg: any) => ({
          amountBeforeTax: Number(bg.amountBeforeTax),
          numberOfGuests: bg.numberOfGuests,
          _id: bg.id,
        })),
        additionalGuestAmounts: charge.additionalGuestAmounts.map((ag: any) => ({
          ageQualifyingCode: ag.ageQualifyingCode,
          amount: Number(ag.amount),
          _id: ag.id,
        })),
      });
    });

    const ratePlans = Array.from(ratePlanMap.values());

    // Calculate totals
    const totalInventory = roomTypes.reduce((sum: number, rt: any) => sum + rt._totalInventory, 0);
    const totalSold = roomTypes.reduce((sum: number, rt: any) => sum + rt.sold, 0);
    const totalAvailable = roomTypes.reduce((sum: number, rt: any) => sum + rt.available, 0);

    // Remove temp field before returning
    roomTypes.forEach((rt: any) => delete rt._totalInventory);

    return {
      date: date.getDate(),
      dayOfWeek,
      month: format(date, 'MMMM'),
      year: date.getFullYear(),
      fullDate: dateKey,
      roomTypes,
      ratePlans,
      total: totalInventory,
      sold: totalSold,
      available: totalAvailable,
      occupancyPercent: totalInventory > 0 ? (totalSold / totalInventory) * 100 : 0,
      restrictions: {
        CTA: dayCharges.some((c) => c.isClosedToArrival),
        CTD: dayCharges.some((c) => c.isClosedToDeparture),
      },
    };
  }

  private static calculateSummary(days: any[], totalDays: number) {
    const totalRooms = days.reduce((sum, day) => sum + day.total, 0);
    const totalSold = days.reduce((sum, day) => sum + day.sold, 0);

    return {
      totalRooms,
      totalSold,
      occupancy: totalRooms > 0 ? (totalSold / totalRooms) * 100 : 0,
      totalRevenue: 0,
    };
  }
}
