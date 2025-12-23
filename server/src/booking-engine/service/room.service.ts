import dayjs from "dayjs";
import { RoomBookingRepository } from "../repository";
import { IBookingSearchPayload, IRoom, IRoomPrice } from "../types";

export class RoomBookingService {
  public static async fetchRooms(payload: IBookingSearchPayload) {
    const { PropertyCode, startDate, endDate, guests } = payload;

    const property = await RoomBookingRepository.getPropertyByCode(PropertyCode);
    if (!property || !property.isAvailable) {
      return {
        success: false,
        message: "Property not available",
      };
    }

    // Build date array
    const dates: string[] = [];
    let current = dayjs(startDate);
    const last = dayjs(endDate);

    while (current.isBefore(last) || current.isSame(last, "day")) {
      dates.push(current.format("YYYY-MM-DD"));
      current = current.add(1, "day");
    }

    const totalGuests = guests.adults + guests.children;
    const rooms: IRoom[] = [];

    for (const room of property.propertyRooms) {
      // Check inventory for all dates
      const inventory = await RoomBookingRepository.getInventoryByProperty(
        PropertyCode,
        room.roomType,
        dates
      );

      if (inventory.length !== dates.length) continue;

      const room_price: IRoomPrice[] = [];

      for (const ratePlan of property.ratePlans) {
        const charges = await RoomBookingRepository.getCharges(
          PropertyCode,
          room.roomType,
          ratePlan.ratePlanCode,
          dates[0]
        );

        if (!charges.length) continue;

        const charge = charges[0];

        // Sort base guest amounts
        const sortedBase = [...charge.baseGuestAmounts].sort(
          (a, b) => a.numberOfGuests - b.numberOfGuests
        );

        // Pick base amount for total guests
        const base =
          sortedBase.find(b => b.numberOfGuests >= totalGuests) ||
          sortedBase[sortedBase.length - 1];

        // Initialize totalAmount
        let totalAmount = Number(base.amountBeforeTax);

        // Calculate additional charges
        if (totalGuests > base.numberOfGuests) {
          const remainingGuests = totalGuests - base.numberOfGuests;

          // Separate remaining adults and children
          const remainingAdults = Math.max(guests.adults - base.numberOfGuests, 0);
          const remainingChildren = Math.max(guests.children - base.numberOfGuests, 0);

          const adultExtra = charge.additionalGuestAmounts.find(
            a => Number(a.ageQualifyingCode) === 10
          );
          const childExtra = charge.additionalGuestAmounts.find(
            a => Number(a.ageQualifyingCode) === 8
          );

          if (adultExtra) totalAmount += Number(adultExtra.amount) * remainingAdults;
          if (childExtra) totalAmount += Number(childExtra.amount) * remainingChildren;
        }

        room_price.push({
          ratePlanName: ratePlan.ratePlanName,
          ratePlanCode: ratePlan.ratePlanCode,
          totalAmount,
          currencyCode: charge.currencyCode,
          baseByGuestAmts: sortedBase.map(b => ({
            numberOfGuests: b.numberOfGuests,
            amountBeforeTax: Number(b.amountBeforeTax)
          })),
          policy: {
            depositPolicy: ratePlan.depositPolicy,
            cancellationPolicy: ratePlan.cancellationPolicy,
            guaranteePolicy: ratePlan.guaranteePolicy
          }
        });
      }

      rooms.push({
        id: room.id,
        room_name: room.roomName,
        room_type: room.roomType,
        room_size: Number(room.roomSize),
        room_unit: room.roomUnit,
        room_view: room.roomView,
        max_occupancy: room.maxOccupancy,
        description: room.description || "",
        images: room.image || [],
        amenities: room.roomAmenities.map(r => r.amenity),
        has_valid_rate: room_price.length > 0,
        room_price
      });
    }

    return {
      success: true,
      message: "Rooms fetched successfully",
      data: {
        propertyDetails: {
          id: property.id,
          propertyName: property.propertyName,
          propertyCode: property.propertyCode,
          starRating: property.starRating,
          bookingEngineConfig: property.bookingEngineConfig,
          address: property.propertyAddress
        },
        rooms,
        addons: [],
        searchCriteria: payload
      }
    };
  }
}
