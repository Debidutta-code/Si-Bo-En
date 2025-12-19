import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"; // 🔹 import plugin
import { RoomBookingRepository } from "../repository";
import { IBookingSearchPayload, IRoom } from "../types";

// Extend dayjs with the plugin
dayjs.extend(isSameOrBefore);

export class RoomBookingService {
  public static async fetchRooms(payload: IBookingSearchPayload) {
    const { PropertyCode, startDate, endDate, guests } = payload;

    const property = await RoomBookingRepository.getPropertyByCode(PropertyCode);
    if (!property || !property.isAvailable) {
      return {
        success: false,
        message: "Property not available",
        data: null
      };
    }

    const dates: string[] = [];
    let current = dayjs(startDate);
    const last = dayjs(endDate);

    while (current.isSameOrBefore(last, "day")) {
      dates.push(current.format("YYYY-MM-DD"));
      current = current.add(1, "day");
    }

    const totalGuests = guests.adults + guests.children;
    const rooms: IRoom[] = [];

    for (const room of property.propertyRooms) {
      const inventory = await RoomBookingRepository.getInventoryByProperty(
        PropertyCode,
        room.roomType,
        dates
      );

      if (inventory.length !== dates.length) continue;

      const room_price = [];

      for (const ratePlan of property.ratePlans) {
        const charges = await RoomBookingRepository.getCharges(
          PropertyCode,
          room.roomType,
          ratePlan.ratePlanCode,
          dates[0]
        );

        if (!charges.length) continue;

        const charge = charges[0];
        const sortedBase = [...charge.baseGuestAmounts].sort(
          (a, b) => a.numberOfGuests - b.numberOfGuests
        );

        const base =
          sortedBase.find(b => b.numberOfGuests >= totalGuests) ||
          sortedBase[sortedBase.length - 1];

        let totalAmount = Number(base.amountBeforeTax);

        if (totalGuests > base.numberOfGuests) {
          const extraGuests = totalGuests - base.numberOfGuests;
          const adultExtra = charge.additionalGuestAmounts.find(
            a => a.ageQualifyingCode === "adult"
          );
          if (adultExtra) totalAmount += Number(adultExtra.amount) * extraGuests;
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
