export type DiscountType = 'percentage' | 'flat';
export type CurrencyCode = 'USD' | 'EUR' | 'INR';

export interface ICCreateCustomizableDeal {
    discountType: DiscountType;
    discountValue: number;
    currencyCode?: CurrencyCode;
    applicableRoomTypes: string[]; // Array of room IDs
    applicableRatePlans: string[]; // Array of rate plan IDs
    applicableAddons: string[];    // Array of addon IDs
      isAutoApplied: boolean;

}

export interface ICUpdateCustomizableDeal {
    discountType?: DiscountType;
    discountValue?: number;
    currencyCode?: CurrencyCode;
    applicableRoomTypes?: string[];
    applicableRatePlans?: string[];
    applicableAddons?: string[];
      isAutoApplied: boolean;

}

export interface IGetCustomizableDeal {
    id: string;
    propertyId: string;
    propertyCode: string;
    discountType: DiscountType;
    discountValue: number;
    currencyCode: CurrencyCode;
    createdAt: Date;
    applicableRoomTypes: Array<{
        id: string;
        roomId: string;
        roomTypeCode: string;
        Room: {
            id: string;
            roomName: string;
            roomType: string;
        };
    }>;
    applicableRatePlans: Array<{
        id: string;
        ratePlanId: string;
        ratePlanCode: string;
        RatePlan: {
            id: string;
            ratePlanName: string;
            ratePlanCode: string;
        };
    }>;
    applicableAddons: Array<{
        id: string;
        addOnId: string;
        AddOn: {
            id: string;
            name: string;
            code: string;
        };
    }>;
      isAutoApplied: boolean;

}

export interface ICustomizableDealWithDetails extends IGetCustomizableDeal {
    totalApplicableRooms: number;
    totalApplicableRatePlans: number;
    totalApplicableAddons: number;
}