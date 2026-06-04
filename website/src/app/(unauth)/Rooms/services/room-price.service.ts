import {
  IAddonAvailability,
  IAvailableAddonsResponse,
  IFinalPrice,
  IGetPricePayload,
  IParsedAddon,
  IPricePayloadPromotion,
  IRawPriceBreakdown,
  IRoomGuestDetail,
  ISelectedAddon,
  ISelectedPromotion,
} from "@/src/app/(unauth)/Rooms/types";
import { fetchAvailableAddonsApi, fetchRoomPriceApi } from "../apis";
import { AddonAvailability } from "@/src/components/RoomPage/AddonSelectionModal";

// ─── Normalize price breakdown ────────────────────────────────────────────────

export const normalizePriceBreakdown = (
  raw: IRawPriceBreakdown,
  opts: { noOfRooms: number; ratePlanCode: string }
): IFinalPrice => {
  const numberOfNights = new Set(
    raw.dailyPriceBrakeDown.map((d) => d.date)
  ).size;

  const baseRatePerNight =
    numberOfNights > 0 ? raw.amountBeforeTax / numberOfNights : 0;

  const additionalGuestCharges = raw.dailyPriceBrakeDown.reduce(
    (sum, d) => sum + (d.additionalChargesAmount ?? 0),
    0
  );

  const dailyBreakdown = raw.dailyPriceBrakeDown.map((d) => ({
    ...d,
    ratePlanCode: opts.ratePlanCode,
    dayOfWeek: new Date(d.date).toLocaleDateString("en-US", { weekday: "long" }),
    baseRate: d.baseChargesAmount,
    totalPerRoom: d.totalAmount,
    totalForAllRooms: d.totalAmount * opts.noOfRooms,
  }));

  return {
    ...raw,
    numberOfNights,
    baseRatePerNight,
    requestedRooms: opts.noOfRooms,
    additionalGuestCharges,
    totalTaxAmount: raw.taxedAmount,
    dailyBreakdown,
  };
};

// ─── Build get-price payload ──────────────────────────────────────────────────

export const buildPricePayload = (opts: {
  propertyCode: string;
  roomType: string;
  ratePlanCode: string;
  startDate: string;
  endDate: string;
  noOfAdults: number;
  noOfChildren: number;
  noOfRooms: number;
  roomsArray: IRoomGuestDetail[];
  promoCode: string;
  selectedPromotions: ISelectedPromotion[];
  selectedAddons: ISelectedAddon[];
  includedAddonIds: string[];
}): IGetPricePayload => {
  const childAges = opts.roomsArray.flatMap((r) => r.childAges ?? []);

  const payload: IGetPricePayload = {
    propertyCode: opts.propertyCode,
    invTypeCode: opts.roomType,
    ratePlanCode: opts.ratePlanCode,
    startDate: opts.startDate,
    endDate: opts.endDate,
    noOfAdults: opts.noOfAdults,
    noOfChildren: opts.noOfChildren,
    noOfRooms: opts.noOfRooms,
    childAges,
    promoCode: opts.promoCode,
    guestDistribution: opts.roomsArray,
  };

  if (opts.selectedPromotions.length > 0) {
    payload.promotions = opts.selectedPromotions.map(
      (p): IPricePayloadPromotion => ({
        id: p.id,
        promotionType: p.promotionType === "mlos" ? "mlos" : "normal",
      })
    );
  }

  if (opts.selectedAddons.length > 0) {
    const addonMap: Record<string, IParsedAddon> = {};
    opts.selectedAddons.forEach((addon) => {
      if (!addonMap[addon.addonId]) {
        addonMap[addon.addonId] = { addOnId: addon.addonId, availability: [] };
      }
      addonMap[addon.addonId].availability.push({
        date: addon.date,
        quantity: addon.quantity,
      });
    });
    payload.parsedAddons = Object.values(addonMap);
  }

  if (opts.includedAddonIds.length > 0) {
    payload.includedAddons = opts.includedAddonIds;
  }

  return payload;
};

// ─── Fetch available addons ───────────────────────────────────────────────────
// Axios interceptor handles Accept-Language, no lang param needed.
// API returns one record per addon per date — grouped by addonId here
// so the UI receives one IAvailableAddon with a full availability[].

export const getAvailableAddons = async (
  propertyCode: string,
  startDate: string,
  endDate: string,
  ratePlanCode: string
): Promise<IAddonAvailability[]> => {
  const response: IAvailableAddonsResponse =
    await fetchAvailableAddonsApi(
      propertyCode,
      startDate,
      endDate,
      ratePlanCode
    );

  if (!response.success) {
    return [];
  }

  return response.data;
};

// ─── Fetch room price ─────────────────────────────────────────────────────────

export const getRoomPrice = async (
  payload: IGetPricePayload,
  loyaltyToggleOn: boolean
): Promise<IFinalPrice> => {
  const response = await fetchRoomPriceApi(payload, loyaltyToggleOn);

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch price");
  }

  const noOfRooms = payload.guestDistribution?.length ?? 1;
  return normalizePriceBreakdown(response.data, {
    noOfRooms,
    ratePlanCode: payload.ratePlanCode,
  });
};