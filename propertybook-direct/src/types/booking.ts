// API Request Interface
export interface FindRoomsRequest {
  startDate: string;
  endDate: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  PropertyCode: string;
}
export interface Guest {
  adults: number;
  children: number;
  rooms: number;
}
// Amenity Interface
export interface IAmenity {
  id: string;
  amenityName: string;
  amenityType: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Room Video Interface
export interface IRoomVideo {
  id: string;
  roomId: string;
  url: string;
  thumbnail: string;
  createdAt: string;
}

// Property Video Interface
export interface IPropertyVideo {
  id: string;
  propertyId: string;
  url: string;
  thumbnail: string;
  createdAt: string;
}

// Base By Guest Amount Interface
export interface IBaseByGuestAmt {
  numberOfGuests: number;
  amountBeforeTax: number;
}

// Policy Interface
export interface IPolicy {
  depositPolicy: any | null;
  cancellationPolicy: any | null;
  guaranteePolicy: any | null;
}

// Add-on Interface
export interface IAddon {
  id: string;
  name: string;
  price: number;
  postingRhythm: string;
}

// Promotion Interface
export interface IPromotion {
  id: string;
  promotionName: string;
  promotionType: string;
  discountType: string;
  discountValue: number;
  minLos?: number;
  validFrom: string | null;
  validTo: string | null;
  advanceBookingDays?: number;
  monApplicable?: boolean;
  tueApplicable?: boolean;
  wedApplicable?: boolean;
  thuApplicable?: boolean;
  friApplicable?: boolean;
  satApplicable?: boolean;
  sunApplicable?: boolean;
}

// Tourist Tax Interface
export interface ITouristTax {
  id: string;
  discountType: string;
  discountValue: number;
  currencyCode: string;
  calculatedTaxAmount: number;
}

// Room Price Interface
export interface IRoomPrice {
  ratePlanName: string;
  ratePlanCode: string;
  totalAmount: number;
  currencyCode: string;
  baseByGuestAmts: IBaseByGuestAmt[];
  policy: IPolicy;
  addons: IAddon[];
  availablePromotions: IPromotion[];
  touristTax: ITouristTax;
}

// Room Interface
export interface IRoom {
  id: string;
  room_name: string;
  room_type: string;
  room_size: number;
  room_unit: string;
  room_view: string;
  max_occupancy: number;
  description: string;
  images: string[];
  amenities: IAmenity[];
  has_valid_rate: boolean;
  room_price: IRoomPrice[];
  roomVideos: IRoomVideo | null;
}

// Loyalty Condition Interface
export interface ILoyaltyCondition {
  id: string;
  loyaltyProgramId: string;
  text: string;
  language: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
}

// Loyalty Special Condition Interface
export interface ILoyaltySpecialCondition {
  id: string;
  loyaltyProgramId: string;
  title: string;
  subTitle: string | null;
  language: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
}

// Loyalty Program Field Config Interface
export interface ILoyaltyProgramFieldConfig {
  id: string;
  loyaltyProgramId: string;
  masterRegistrationFieldId: string;
  fieldName: string;
  visibleInRegistration: boolean;
  visibleInCustomerForm: boolean;
  required: boolean;
  updatedAt: string;
}

// Basic Loyalty Program Interface
export interface IBasicLoyaltyProgram {
  id: string;
  loyaltyProgramId: string;
  isActive: boolean;
  logo: string[];
  createdAt: string;
}

// Creation Loyalty Config Interface
export interface ICreationLoyaltyConfig {
  id: string;
  creationId: string;
  loyaltyDiscountType: string;
  discountValue: number;
  currencyCode: string;
  createdAt: string;
  AdvanceLoyaltyProgram: any | null;
  BasicLoyaltyProgram: IBasicLoyaltyProgram | null;
  loyaltyConditions: ILoyaltyCondition[];
  LoyaltyProgramFieldConfig: ILoyaltyProgramFieldConfig[];
  loyaltySpecialConditions: ILoyaltySpecialCondition[];
}

// Loyalty Program Config Interface
export interface ILoyaltyProgramConfig {
  id: string;
  creationLoyaltyConfigId: string;
  propertyId: string;
  propertyCode: string;
  propertyName: string;
  isActive: boolean;
  CreationLoyaltyConfig: ICreationLoyaltyConfig;
}

// Booking Engine Config Interface
export interface IBookingEngineConfig {
  id: string;
  propertyId: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  buttonTextColor: string;
  bannerImage: string | null;
  logo: string;
}

// Address Interface
export interface IAddress {
  id: string;
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
  location: string;
  landmark: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  propertyId: string;
}

// Property Details Interface
export interface IPropertyDetails {
  id: string;
  propertyName: string;
  propertyVideos: IPropertyVideo | null;
  loyaltyProgramConfig: ILoyaltyProgramConfig | null;
  propertyCode: string;
  starRating: number;
  bookingEngineConfig: IBookingEngineConfig;
  address: IAddress;
}

// Search Criteria Interface
export interface ISearchCriteria {
  PropertyCode: string;
  startDate: string;
  endDate: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  
}

// Response Data Interface
export interface IFetchRoomsData {
  propertyDetails: IPropertyDetails;
  rooms: IRoom[];
  searchCriteria: ISearchCriteria;
}

// Guest Details Interface for Booking
export interface IGuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequest?: string;
  countryCode?: string;
}

// Selected Add-on Interface
export interface ISelectedAddOn {
  addOn: IAddon;
  quantity: number;
  ratePlanCode: string; // To associate with specific rate plan
}

// Loyalty Info Interface
export interface ILoyaltyInfo {
  isApplied: boolean;
  programId: string;
  programName: string;
  discountType: string;
  discountValue: number;
  currencyCode: string;
  logo?: string[];
}

// Booking Session Interface
export interface IBookingSession {
  searchCriteria: ISearchCriteria | null;
  propertyDetails: IPropertyDetails | null;
  selectedRoom: IRoom | null;
  selectedRatePlan: IRoomPrice | null;
  guestDetails: IGuestDetails | null;
  rooms: IRoom[];
  loyaltyInfo: ILoyaltyInfo | null;
  selectedAddOns: ISelectedAddOn[];
  selectedPromotion: IPromotion | null;
}

// Price Summary Interface
export interface IPriceSummary {
  nights: number;
  basePrice: number;
  taxes: number;
  touristTax: number;
  promotionDiscount: number;
  loyaltyDiscount: number;
  addOnsTotal: number;
  total: number;
  currency: string;
  roomName: string;
  ratePlanName: string;
  breakdown: {
    baseByGuestAmts: IBaseByGuestAmt[];
    selectedAddOns: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  };
}