// ⚠️ DEPRECATED: This file has been moved to /src/promocode/types/promo-code.type.ts
// All promo code functionality is now in the dedicated /src/promocode folder
// Please use the new location instead

export interface IPromoCode {
    name: string
    code: string
    description?: string
    propertyId: string
    discountType: "percentage" | "amount"
    discountValue: number
    validFrom: Date | string
    validTo: Date | string
    minBookingAmount?: number | null
    maxDiscountAmount?: number | null

    // Platform applicability
    isApplicableForMobileApp?: boolean
    isApplicableForDesktop?: boolean
    isApplicableForTablet?: boolean

    // Booking source applicability
    isApplicableForWalkIn?: boolean
    isApplicableForOTA?: boolean
    isApplicableForCorporate?: boolean

    usageLimit?: number | null
    usageLimitPerUser?: number | null
    applicableRoomTypes?: any[]
    applicableRatePlans?: any[]
    isActive?: boolean
}

export interface IUpdatePromoCode {
    name?: string
    code?: string
    description?: string
    discountType?: "percentage" | "amount"
    discountValue?: number
    validFrom?: Date | string
    validTo?: Date | string
    minBookingAmount?: number | null
    maxDiscountAmount?: number | null

    // Platform applicability
    isApplicableForMobileApp?: boolean
    isApplicableForDesktop?: boolean
    isApplicableForTablet?: boolean

    // Booking source applicability
    isApplicableForWalkIn?: boolean
    isApplicableForOTA?: boolean
    isApplicableForCorporate?: boolean

    usageLimit?: number | null
    usageLimitPerUser?: number | null
    applicableRoomTypes?: any[]
    applicableRatePlans?: any[]
    isActive?: boolean
}

export interface IResPromoCode {
    id: string
    name: string
    code: string
    description: string | null
    propertyId: string
    discountType: "percentage" | "amount"
    discountValue: number
    validFrom: Date
    validTo: Date
    minBookingAmount: number | null
    maxDiscountAmount: number | null

    // Platform applicability
    isApplicableForMobileApp: boolean
    isApplicableForDesktop: boolean
    isApplicableForTablet: boolean

    // Booking source applicability
    isApplicableForWalkIn: boolean
    isApplicableForOTA: boolean
    isApplicableForCorporate: boolean

    usageLimit: number | null
    usageLimitPerUser: number | null
    applicableRoomTypes: any[]
    applicableRatePlans: any[]
    isActive: boolean
    isDeleted: boolean
    createdAt: Date
    updatedAt: Date
}