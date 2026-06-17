
export interface ISpa {
    id: string,
    name: string,
    itemCode: string,
    description: string,
    benefits: string[],
    conditions: any,
    isInclusive: boolean,
    images: string[],
    serviceTime: number,
    location: string,
    createdBy: string,
    categoryId: string,
    subCategoryId: string,
    isActive: boolean,
    discountValue: number,
    currencyCode: string,
    createdAt: string,
    propertyId: string,
    category: ISpaCategory,
    SubCategory: ISpaSubCategory,
    SpaDates: [],

}

interface ISpaCategory {
    id: string,
    name: string,
}

interface ISpaSubCategory {
    id: string,
    name: string,
    categoryId: string,
    isActive: boolean
}
interface ISpaDates {
    id: string,
    date: Date,
    spaModuleId: string,
    slots: ISpaSlots[]
}

interface ISpaSlots {
    id: string,
    startTime: Date,
    endTime: Date,
    spaDateId: string,
    isActive: boolean,
    slotsAvailable: ISpaSlotsAvailable[]
}

interface ISpaSlotsAvailable {
    id: string,
    status: ISpaSlotAvailableStatus,
    spaSlotId: string,
    reservationId: string | null,
    slotBooking: string|null
}
type ISpaSlotAvailableStatus = "active" | "Inactive" | "booked" | "completed"