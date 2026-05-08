export type GuestType = 'adult' | 'child' | 'infant';
export type IdentityType =
    | 'passport'
    | 'drivers_license'
    | 'national_id'
    | 'adhar_card'
    | 'pan_card'
    | 'others';
export interface ICGuest {
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string | null;
    userType: GuestType;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    zipCode: string | null;
    propertyId: string;
}
export interface IGuests extends ICGuest {
    id: string;
    isALoyalityGuest: boolean;
    createdAt: Date;
    updatedAt: Date;
    userIdentityCardType: IdentityType | null;
    identityCardNumber?: string | null;
    identityCardImage?: string | null;
}

export interface IAddGuestDocument {
    userIdentityCardType: IdentityType;
    identityCardNumber: string;
    identityCardImage?: string;
}
