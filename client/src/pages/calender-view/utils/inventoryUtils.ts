// utils/inventoryUtils.ts

import type { InventoryDay } from "../types/inventory";

/**
 * Calculate occupancy percentage
 */
export const calculateOccupancyPercent = (
  total: number,
  sold: number,
): number => {
  return total > 0 ? Math.round((sold / total) * 100) : 0;
};

/**
 * Get unique room types from days data
 */
export const getRoomTypes = (days: InventoryDay[]): string[] => {
  const roomTypes = new Set<string>();
  days.forEach((day) => {
    if (day.roomTypes && Array.isArray(day.roomTypes)) {
      day.roomTypes.forEach((room) => {
        if (room.invTypeCode) {
          roomTypes.add(room.invTypeCode);
        }
      });
    }
  });
  return Array.from(roomTypes);
};

/**
 * Get unique rate plans from days data
 */
export const getRatePlans = (days: InventoryDay[]): string[] => {
  const ratePlans = new Set<string>();
  days.forEach((day) => {
    if (day.ratePlans && Array.isArray(day.ratePlans)) {
      day.ratePlans.forEach((plan) => {
        if (plan.ratePlanCode) {
          ratePlans.add(plan.ratePlanCode);
        }
      });
    }
  });
  return Array.from(ratePlans);
};

/**
 * Get rate plans for a specific room type
 */
export const getRatePlansForRoomType = (
  roomType: string,
  days: InventoryDay[],
): string[] => {
  const ratePlansSet = new Set<string>();

  days.forEach((day) => {
    if (day.ratePlans && Array.isArray(day.ratePlans)) {
      day.ratePlans.forEach((plan) => {
        const hasPricingForRoomType = plan.prices?.some(
          (price) => price.invTypeCode === roomType,
        );

        if (hasPricingForRoomType) {
          ratePlansSet.add(plan.ratePlanCode);
        }
      });
    }
  });

  return Array.from(ratePlansSet);
};

/**
 * Get room type data across all days
 */
export const getRoomTypeData = (roomTypeCode: string, days: InventoryDay[]) => {
  return days.map((day) => {
    if (!day.roomTypes || !Array.isArray(day.roomTypes)) {
      return null;
    }
    const roomType = day.roomTypes.find(
      (room) => room.invTypeCode === roomTypeCode,
    );
    return roomType || null;
  });
};

/**
 * Get rate plan details for a specific day and room type
 */
export const getRatePlanDetails = (
  day: InventoryDay,
  roomTypeCode: string,
  ratePlanCode: string,
) => {
  if (!day.ratePlans || !Array.isArray(day.ratePlans)) {
    return null;
  }

  const ratePlan = day.ratePlans.find(
    (plan) => plan.ratePlanCode === ratePlanCode,
  );
  if (!ratePlan || !ratePlan.prices || !Array.isArray(ratePlan.prices)) {
    return null;
  }

  const priceDetail = ratePlan.prices.find(
    (price) => price.invTypeCode === roomTypeCode,
  );
  return priceDetail ? { ...priceDetail, ratePlan } : null;
};

/**
 * Format date for API requests
 */
export const formatDateForAPI = (day: InventoryDay): string => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthNumber = monthNames.indexOf(day.month) + 1;

  return `${day.year}-${String(monthNumber).padStart(2, "0")}-${String(day.date).padStart(2, "0")}`;
};

/**
 * Get effective restriction value (considering optimistic updates)
 */
export const getEffectiveRestrictionValue = (
  uniqueKey: string,
  originalValue: boolean,
  optimisticRestrictions: Map<string, boolean>,
): boolean => {
  return optimisticRestrictions.has(uniqueKey)
    ? optimisticRestrictions.get(uniqueKey)!
    : originalValue;
};

/**
 * Generate unique key for various entities
 */
export const generateKey = {
  ratePlan: (ratePlanCode: string, dayIndex: number, roomTypeCode: string) =>
    `${ratePlanCode}-${dayIndex}-${roomTypeCode}`,

  restriction: (
    restrictionType: string,
    dayIndex: number,
    roomTypeCode: string,
    ratePlanCode?: string,
  ) =>
    ratePlanCode
      ? `${restrictionType}-${dayIndex}-${roomTypeCode}-${ratePlanCode}`
      : `${restrictionType}-${dayIndex}-${roomTypeCode}`,

  los: (
    roomType: string,
    ratePlan: string | null,
    dayIndex: number,
    type: "min" | "max",
  ) => `${roomType}-${ratePlan || "roomtype"}-${dayIndex}-${type}`,

  availability: (roomType: string, dayIndex: number) =>
    `${roomType}-availability-${dayIndex}`,

  price: (
    roomType: string,
    ratePlan: string,
    dayIndex: number,
    numberOfGuests?: number,
    ageQualifyingCode?: string,
  ) =>
    numberOfGuests
      ? `${roomType}-${ratePlan}-${dayIndex}-price-${numberOfGuests}-${ageQualifyingCode}`
      : `${roomType}-${ratePlan}-${dayIndex}-price`,

  additionalCharge: (
    roomType: string,
    ratePlan: string,
    dayIndex: number,
    ageQualifyingCode: string,
  ) => `${roomType}-${ratePlan}-${dayIndex}-additional-${ageQualifyingCode}`,

  customTier: (roomType: string, ratePlan: string) => `${roomType}-${ratePlan}`,

  bookingOffset: (
    roomType: string,
    ratePlan: string,
    dayIndex: number,
    field: string,
  ) => `${roomType}-${ratePlan}-${dayIndex}-bookingOffset-${field}`,
};

/**
 * Age qualifying code labels
 */
export const AGE_LABELS: { [key: string]: string } = {
  "10": "Adult",
  "8": "Child",
  "7": "Infant",
};
