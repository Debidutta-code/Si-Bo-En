import { calculateNights, toUTCDate } from "../../utils";
import { RoomBookingRepository } from "../repository";
import { IBookingSearchPayload, IPromotion, IRoom, IRoomPrice } from "../types";

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

    console.log("✅ Property found:", property.propertyName);
    console.log("📊 Total rooms:", property.propertyRooms.length);
    console.log("💰 Total rate plans:", property.ratePlans.length);

    // Build date array
 // Build date array - ONLY for nights stayed (exclude checkout date)
const dates: Date[] = [];
let current = toUTCDate(startDate);
const last = toUTCDate(endDate);

while (current < last) {  // ✅ Already correct - excludes checkout date
  dates.push(current);
  current = new Date(current);
  current.setDate(current.getDate() + 1);
  current = toUTCDate(current);  // Convert the incremented date back to UTC
}

console.log("📅 Dates for pricing:", dates.map(d => d.toISOString()));
console.log("📅 Number of nights:", dates.length);

    console.log("📅 Date range:", dates);

    const totalGuests = guests.adults + guests.children;
    const numberOfNights = calculateNights(startDate, endDate);
    const rooms: IRoom[] = [];

    for (const room of property.propertyRooms) {
      console.log(`\n🏠 Processing room: ${room.roomName} (${room.roomType})`);
      
      // Check inventory for all dates
      const inventory = await RoomBookingRepository.getInventoryByProperty(
        PropertyCode,
        room.roomType,
        dates
      );

      console.log(`  📦 Inventory found: ${inventory.length} / ${dates.length} dates`);

      if (inventory.length !== dates.length) {
        console.log(`  ❌ Skipping room - insufficient inventory`);
        continue;
      }

      const room_price: IRoomPrice[] = [];

      for (const ratePlan of property.ratePlans) {
        console.log(`\n  💳 Processing rate plan: ${ratePlan.ratePlanName} (${ratePlan.ratePlanCode})`);
        
        // Get all addons for this rate plan
        const ratePlanAddons = await RoomBookingRepository.getRatePlanAddons(
          ratePlan.id
        );

        console.log(`    🎁 Addons found: ${ratePlanAddons.length}`);

        // Check addon availability for all dates
        let allAddonsAvailable = true;
        const addonPrices: { [addonId: string]: number } = {};

        for (const ratePlanAddon of ratePlanAddons) {
          const addonAvailability = await RoomBookingRepository.getAddonAvailability(
            ratePlanAddon.addonId,
            dates
          );

          console.log(`      🎁 Addon "${ratePlanAddon.addon.name}": ${addonAvailability.length} / ${dates.length} dates available`);

          // If any addon is not available for all dates, skip this rate plan
          if (addonAvailability.length !== dates.length) {
            allAddonsAvailable = false;
            console.log(addonAvailability)
            console.log(`❌ Addon not available for all dates`);
            break;
          }

          // Calculate addon price based on posting rhythm
          const addon = ratePlanAddon.addon;
          const totalAddonPrice = this.calculateAddonPrice(
            addon,
            addonAvailability,
            numberOfNights,
            totalGuests,
            guests.rooms
          );

          addonPrices[addon.id] = totalAddonPrice;
        }

        // Skip this rate plan if addons are not available
        if (!allAddonsAvailable) {
          console.log(`    ❌ Skipping rate plan - addons not available`);
          continue;
        }

        // Get charges for the first date to get base pricing structure
        const charges = await RoomBookingRepository.getCharges(
          PropertyCode,
          room.roomType,
          ratePlan.ratePlanCode,
          dates[0]
        );

        console.log(`    💵 Charges found: ${charges.length}`);

        if (!charges.length) {
          console.log(`    ❌ Skipping rate plan - no charges found`);
          continue;
        }

        const charge = charges[0];

        // Sort base guest amounts
        const sortedBase = [...charge.baseGuestAmounts].sort(
          (a, b) => a.numberOfGuests - b.numberOfGuests
        );

        console.log(`    👥 Base guest amounts:`, sortedBase.map(b => `${b.numberOfGuests} guests = ${b.amountBeforeTax}`));

        // Pick base amount for total guests (or last available if exceeds)
        const selectedTier =
          sortedBase.find(b => b.numberOfGuests >= totalGuests) ||
          sortedBase[sortedBase.length - 1];

        console.log(`    ✅ Selected tier: ${selectedTier.numberOfGuests} guests = ${selectedTier.amountBeforeTax}`);

        // Initialize totalAmount with selected tier price
        let totalAmount = Number(selectedTier.amountBeforeTax);

        // Apply geo-based pricing (silent)
        const geoAdjustment = await this.getGeoPricing(
          property.id,
          room.id,
          ratePlan.id,
          payload.countryCode || "US"
        );

        if (geoAdjustment) {
          console.log(`    🌍 Geo adjustment found for ${payload.countryCode}:`, geoAdjustment.restrictionType);
          const restrictionValue = geoAdjustment.restrictionValue
            ? Number(geoAdjustment.restrictionValue)
            : 0;
          const oldAmount = totalAmount;
          totalAmount = this.applyGeoAdjustment(
            totalAmount,
            geoAdjustment.restrictionType,
            geoAdjustment.restrictionTypeAction,
            restrictionValue,
            geoAdjustment.currencyCode || "USD"
          );
          console.log(`    🌍 Price adjusted: ${oldAmount} → ${totalAmount}`);
        }

        // Calculate and add addon prices to total
        const totalAddonPrice = Object.values(addonPrices).reduce(
          (sum, price) => sum + price,
          0
        );
        totalAmount += totalAddonPrice;

        console.log(`    💰 Final amount: ${totalAmount} (base: ${selectedTier.amountBeforeTax}, addons: ${totalAddonPrice})`);

        // Fetch available promotions
        const availablePromotions: IPromotion[] = [];
        
        const promotions = await this.getApplicablePromotions(
          property.id,
          room.id,
          ratePlan.id,
          dates,
          numberOfNights
        );

        console.log(`    🎉 Promotions found: ${promotions.length}`);

        // Add regular promotions to available list
        for (const promo of promotions) {
          availablePromotions.push({
            id: promo.id,
            promotionName: promo.promotionName,
            promotionType: promo.promotionType,
            discountType: promo.DiscountType,
            discountValue: Number(promo.DiscountValue),
            validFrom: promo.validFrom,
            validTo: promo.validTo,
            advanceBookingDays: promo.advanceBookingDays ?? 0,
            monApplicable: promo.monApplicable,
            tueApplicable: promo.tueApplicable,
            wedApplicable: promo.wedApplicable,
            thuApplicable: promo.thuApplicable,
            friApplicable: promo.friApplicable,
            satApplicable: promo.satApplicable,
            sunApplicable: promo.sunApplicable
          });
        }

        // Check for MLOS promotion from rate plan rule
        const ratePlanRule = await RoomBookingRepository.getRatePlanRule(ratePlan.id);

        if (ratePlanRule && ratePlanRule.isActive && ratePlanRule.minLos && numberOfNights >= ratePlanRule.minLos) {
          const isWithinPeriod = this.isDateRangeWithinPeriod(
            startDate,
            endDate,
            ratePlanRule.startDate,
            ratePlanRule.endDate
          );

          if (isWithinPeriod && ratePlanRule.discountType && ratePlanRule.discountValue) {
            console.log(`    🎉 MLOS promotion added: ${ratePlanRule.minLos} nights`);
            availablePromotions.push({
              id: ratePlanRule.id,
              promotionName: `Minimum ${ratePlanRule.minLos} nights stay`,
              promotionType: "mlos",
              discountType: ratePlanRule.discountType,
              discountValue: Number(ratePlanRule.discountValue),
              minLos: ratePlanRule.minLos,
              maxLos: ratePlanRule.maxLos || undefined,
              validFrom: ratePlanRule.startDate,
              validTo: ratePlanRule.endDate
            });
          }
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
          },
          addons: ratePlanAddons.map(rpa => ({
            id: rpa.addon.id,
            name: rpa.addon.name,
            price: addonPrices[rpa.addon.id],
            postingRhythm: rpa.addon.postingRhythm
          })),
          availablePromotions
        });

        console.log(`    ✅ Rate plan added successfully`);
      }

      console.log(`\n  📝 Room "${room.roomName}" has ${room_price.length} rate plans`);

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

    console.log(`\n✅ Total rooms with valid rates: ${rooms.filter(r => r.has_valid_rate).length} / ${rooms.length}`);

    return {
      success: true,
      message: "Rooms fetched successfully",
      data: {
        propertyDetails: {
          id: property.id,
          propertyName: property.propertyName,
          loyaltyProgramConfig:property.loyaltyProgramConfig,
          propertyCode: property.propertyCode,
          starRating: property.starRating,
          bookingEngineConfig: property.bookingEngineConfig,
          address: property.propertyAddress
        },
        rooms,
        searchCriteria: payload
      }
    };
  }

  /**
   * Calculate addon price based on posting rhythm
   */
  private static calculateAddonPrice(
    addon: any,
    availabilities: any[],
    numberOfNights: number,
    totalGuests: number,
    numberOfRooms: number
  ): number {
    let totalPrice = 0;

    switch (addon.postingRhythm) {
      case "per_night":
        // Sum all daily prices
        totalPrice = availabilities.reduce((sum, avail) => sum + Number(avail.price), 0);
        break;

      case "per_person_per_night":
        // Daily price × total guests × nights
        const avgPricePerNight = availabilities.reduce(
          (sum, avail) => sum + Number(avail.price),
          0
        ) / availabilities.length;
        totalPrice = avgPricePerNight * totalGuests * numberOfNights;
        break;

      case "per_person_per_stay":
        // One-time charge × total guests
        const avgPrice = availabilities.reduce(
          (sum, avail) => sum + Number(avail.price),
          0
        ) / availabilities.length;
        totalPrice = avgPrice * totalGuests;
        break;

      case "per_stay":
        // One-time charge
        totalPrice = availabilities.reduce(
          (sum, avail) => sum + Number(avail.price),
          0
        ) / availabilities.length;
        break;

      case "per_person_per_room":
        // One-time charge per person per room
        const avgPricePerRoom = availabilities.reduce(
          (sum, avail) => sum + Number(avail.price),
          0
        ) / availabilities.length;
        totalPrice = avgPricePerRoom * totalGuests * numberOfRooms;
        break;

      case "per_room":
        // One-time charge per room
        const roomPrice = availabilities.reduce(
          (sum, avail) => sum + Number(avail.price),
          0
        ) / availabilities.length;
        totalPrice = roomPrice * numberOfRooms;
        break;

      case "per_room_per_night":
        // Daily charge per room
        const dailyRoomPrice = availabilities.reduce(
          (sum, avail) => sum + Number(avail.price),
          0
        ) / availabilities.length;
        totalPrice = dailyRoomPrice * numberOfRooms * numberOfNights;
        break;

      default:
        totalPrice = 0;
    }

    return totalPrice;
  }

  /**
   * Get geo-based pricing adjustment
   */
  private static async getGeoPricing(
    propertyId: string,
    roomId: string,
    ratePlanId: string,
    countryCode: string
  ) {
    return RoomBookingRepository.getGeoRatePlan(
      propertyId,
      roomId,
      ratePlanId,
      countryCode
    );
  }

  /**
   * Apply geo-based pricing adjustment
   */
  private static applyGeoAdjustment(
    baseAmount: number,
    restrictionType: string,
    restrictionTypeAction: string,
    restrictionValue: number,
    currencyCode?: string
  ): number {
    if (restrictionType === "restricted") {
      return 0; // Don't show this rate
    }

    if (restrictionType === "percentage") {
      if (restrictionTypeAction === "increase") {
        return baseAmount * (1 + restrictionValue / 100);
      } else if (restrictionTypeAction === "decrease") {
        return baseAmount * (1 - restrictionValue / 100);
      }
    }

    if (restrictionType === "fixed") {
      if (restrictionTypeAction === "increase") {
        return baseAmount + restrictionValue;
      } else if (restrictionTypeAction === "decrease") {
        return baseAmount - restrictionValue;
      }
    }

    return baseAmount;
  }

  /**
   * Get applicable promotions (excluding device-specific)
   */
  private static async getApplicablePromotions(
    propertyId: string,
    roomId: string,
    ratePlanId: string,
    dates: Date[],
    numberOfNights: number,
    deviceType?: string
  ) {
    const today = new Date();
    const checkInDate = dates[0];
    
    return RoomBookingRepository.getPromotions(
      propertyId,
      roomId,
      ratePlanId,
      checkInDate,
      today,
      numberOfNights,
      deviceType
    );
  }

  /**
   * Check if booking dates are within promotion period
   */
  private static isDateRangeWithinPeriod(
    startDate: string,
    endDate: string,
    periodStart: Date | null | undefined,
    periodEnd: Date | null | undefined
  ): boolean {
    if (!periodStart && !periodEnd) return true; // No date restrictions

    const bookingStart = new Date(startDate);
    const bookingEnd = new Date(endDate);

    if (periodStart && bookingStart < periodStart) return false;
    if (periodEnd && bookingEnd > periodEnd) return false;

    return true;
  }
}