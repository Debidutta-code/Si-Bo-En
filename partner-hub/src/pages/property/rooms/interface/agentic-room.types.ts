import { CurrencyCode } from "@/components/currencyCode/currency-code.type";
import { CommissionType, IPromotionBrakeDown } from "@/pages/reservations/interfaces/agent-reservation.interfaces";

export interface IRoomAmenity {
    id: string;
    amenityName: string;
    amenityType: string;
    description?: string | null;
    icon?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IRoomAmenityItem {
    id: string;
    roomId: string;
    amenityId: string;
    amenity: IRoomAmenity;
}

export interface IRoomVideo {
    id: string;
    roomId: string;
    url: string;
    thumbnail: string | null;
    createdAt: string;
}

export interface IRoomDetails {
    id: string;
    roomName: string;
    roomType: string;
    totalRoom: number;
    floor: number;
    roomView: string;
    roomSize: string;
    roomUnit: string;
    smokingPolicy: string;
    maxOccupancy: number;
    maxNumberOfAdults: number;
    maxNumberOfChildren: number;
    numberOfBedrooms: number;
    numberOfLivingRoom: number;
    extraBed: number;
    description: string;
    view360Link?: string | null;
    image: string[];
    available: boolean;
    isDeleted: boolean;
    propertyId: string;
    createdAt: string;
    updatedAt: string;
    roomVideos: IRoomVideo | null;
    roomAmenities: IRoomAmenityItem[];
}


export interface ITouristTax {
    id: string;
    name: string;
    discountType: "flat" | "percentage";
    discountValue: number;
    currencyCode: string;
    calculatedTaxAmount: number;
}


export interface IAddonCategory {
    id: string;
    name: string;
    code: string;
}

export interface IAddonVariant {
    id: string;
    name: string;
    code: string;
}

export interface IRoomAddon {
    id: string;
    name: string;
    code: string;
    price: number;
    postingRhythm: PostingRhythm;
    description: string;
    images: string[];
    category: IAddonCategory;
    subCategory: IAddonCategory;
    addonVariant: IAddonVariant;
}
export type PostingRhythm = "per_night" | "per_stay" | "per_person_per_night" | "per_person_per_stay" | "per_person_per_room" | "per_room" | "per_room_per_night";

// ─── Policy interfaces ─────────────────────────────────────────────────────────

export interface IPolicy {
    id?: string;
    policyName?: string;
    type?: IPolicyType;
    description?: string;
}

export type IPolicyType = "deposit" | "cancellation" | "guarantee";

export interface IRatePlanPolicy {
    depositPolicy: IPolicy | null;
    cancellationPolicy: IPolicy | null;
    guaranteePolicy: IPolicy | null;
}

// ─── Rate plan pricing ─────────────────────────────────────────────────────────

export interface IBaseByGuestAmt {
    numberOfGuests: number;
    amountBeforeTax: number;
    ageQualifyingCode: string; // "10" = adult, "8" = child
}








export interface IAgenticRoomPrice {
    ratePlanName: string;
    ratePlanCode: string;
    currencyCode: CurrencyCode;
    baseByGuestAmts: IBaseByGuestAmt[];
    policy: IRatePlanPolicy;
    baseAmount:number;
    appliedCommission:IAppliedCommisions;
    totalPromotionAmount:number;
    promotionBrakeDown:IPromotionBrakeDown[]
    touristTax: ITouristTax | null;
    comboLabel: string;
    addons: IRoomAddon[];
    totalAmount: number;
}

export interface IAppliedCommisions{
 commissionType:CommissionType;
 commissionValue:number;
 commissionCurrency:CurrencyCode;
 calculatedCommissionAmount:number;    
}
export interface IAppliedCommisions{
 commissionType:CommissionType;
 commissionValue:number;
 commissionCurrency:CurrencyCode;
 calculatedCommissionAmount:number;    
}

export interface IAgenticAmenity {
  amenity:{
    amenityName:string|null;
    description:string|null;
    icon:string|null;
  }
}

  


export interface IAgenticRoomFull {
    id: string;
    roomName: string;
    roomType: string;
    roomSize: number;
    roomUnit: string;
    roomView: string;
    maxOccupancy: number;
    description: string | null;
    images:string[];
    roomVideos:IRoomVideo | null;
    amenities: IAgenticAmenity[];
    hasValidRate: boolean;
    roomPrice: IAgenticRoomPrice[];
    
}

export interface IRoomVideo{
    roomId:string;
    url: string; 
    thumbnail: string | null
}
export interface IRoomVideo{
    roomId:string;
    url: string; 
    thumbnail: string | null
}
export interface IAgenticRoomsResponse {
    propertyDetails: {
        id: string;
        propertyName: string;
        propertyCode: string;
    };
    rooms: IAgenticRoomFull[];
    searchCriteria: {
        startDate: string;
        endDate: string;
        guests: {
            adults: number;
            children: number;
            rooms: number;
            roomsArray: { adults: number; children: number; childAges: number[] }[];
        };
    };
}

// ─── Agent pricing response ────────────────────────────────────────────────────

export interface IAgentPricingResponse {
    // Extend this as the pricing endpoint response shape becomes known
    [key: string]: unknown;
}

// ─── Charge interfaces ─────────────────────────────────────────────────────────

export interface IAdditionalGuestAmount {
    id: string;
    chargeId: string;
    ageQualifyingCode: string;
    amount: string;
}

export interface IBaseGuestAmount {
    id: string;
    chargeId: string;
    amountBeforeTax: string;
    numberOfGuests: number;
}

export interface ICharge {
    id: string;
    propertyCode: string;
    ratePlanName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    roomTypeName: string;
    currencyCode: string;
    date: string;
    isAvailable: boolean;
    isSaleStopped: boolean;
    monApplicable: boolean;
    tueApplicable: boolean;
    wedApplicable: boolean;
    thuApplicable: boolean;
    friApplicable: boolean;
    satApplicable: boolean;
    sunApplicable: boolean;
    isClosedToArrival: boolean;
    isClosedToDeparture: boolean;
    restrictionNotes: string | null;
    createdAt: string;
    updatedAt: string;
    additionalGuestAmounts: IAdditionalGuestAmount[];
    baseGuestAmounts: IBaseGuestAmount[];
}

export interface IChargePerDay {
    date: string;
    price: number;
    isAvailable: boolean;
    charge: ICharge;
}




export interface IDateRange {
    startDate: string;
    endDate: string;
}
