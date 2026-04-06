import {
    fetchRoomsByPropertyId
} from "../api";
import { getAgentPricing } from "../api/agentic-room.api";

export const fetchRoomsByPropertyIdService = async (
  agenticPropertyId: string,
  startDate: string,
  endDate: string,
  guests: {
    adults: number;
    children: number;
    rooms: number;
    roomsArray: { adults: number; children: number; childAges: number[] }[];
  },
  agencyId: string
) => {
  try {
    if (!agenticPropertyId?.trim())
      return { success: false, message: "Property ID is required." };
    if (!startDate || !endDate)
      return { success: false, message: "Start date and end date are required." };
    if (new Date(startDate) > new Date(endDate))
      return { success: false, message: "Start date must be before end date." };

    return await fetchRoomsByPropertyId(agenticPropertyId, startDate, endDate, guests, agencyId);
  } catch {
    return { success: false, message: "Failed to fetch rooms." };
  }
};

export const getAgentPricingService = async (data: {
    propertyCode: string;
    invTypeCode: string;
    startDate: string;
    endDate: string;
    ratePlanCode: string;
    noOfAdults: number;
    noOfChildren: number;
    noOfRooms: number;
    agencyId: string;
    roomsArray: { adults: number; children: number; childAges: number[] }[];
    includedAddons?: string[];
}) => {
    try {
        if (!data.propertyCode?.trim())
            return { success: false, message: "Property code is required." };
        if (!data.invTypeCode?.trim())
            return { success: false, message: "Room type code is required." };
        if (!data.ratePlanCode?.trim())
            return { success: false, message: "Rate plan code is required." };
        if (!data.startDate || !data.endDate)
            return { success: false, message: "Start date and end date are required." };
        if (new Date(data.startDate) > new Date(data.endDate))
            return { success: false, message: "Start date must be before end date." };
        if (data.noOfAdults < 1)
            return { success: false, message: "At least 1 adult is required." };
        if (data.noOfChildren < 0)
            return { success: false, message: "Number of children cannot be negative." };
        if (data.noOfRooms < 1)
            return { success: false, message: "At least 1 room is required." };

        // Flatten child ages from all rooms
        const childAges = data.roomsArray.flatMap((r) => r.childAges ?? []);

        // Build guest distribution directly from roomsArray
        const guestDistribution = data.roomsArray.map((r) => ({
            adults: r.adults,
            children: r.children,
            childAges: r.childAges ?? [],
        }));

        const payload = {
            propertyCode: data.propertyCode,
            invTypeCode: data.invTypeCode,
            ratePlanCode: data.ratePlanCode,
            startDate: data.startDate,
            endDate: data.endDate,
            noOfAdults: data.noOfAdults,
            noOfChildren: data.noOfChildren,
            noOfRooms: data.noOfRooms,
            childAges,
            guestDistribution,
            agencyId: data.agencyId,
            ...(data.includedAddons?.length ? { includedAddons: data.includedAddons } : {}),
        };

        return await getAgentPricing(payload);
    } catch {
        return { success: false, message: "Failed to get pricing." };
    }
};