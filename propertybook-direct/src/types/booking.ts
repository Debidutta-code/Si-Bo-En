// Booking Engine Types

export interface Guest {
  adults: number;
  children: number;
  rooms: number;
}

export interface SearchCriteria {
  startDate: string;
  endDate: string;
  guests: Guest;
  PropertyCode: string;
}

export interface RatePlan {
  id: string;
  name: string;
  description: string;
  price_per_night: number;
  total_price: number;
  currency: string;
  cancellation_policy: string;
  includes_tax: boolean;
  meal_plan?: string;
  is_refundable: boolean;
}

export interface RoomAmenity {
  id: string;
  name: string;
  icon?: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  short_description: string;
  images: string[];
  size: number;
  size_unit: string;
  view: string;
  max_occupancy: number;
  max_adults: number;
  max_children: number;
  amenities: RoomAmenity[];
  rate_plans: RatePlan[];
  has_valid_rate: boolean;
}

export interface BookingEngineConfig {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  buttonTextColor: string;
  logo: string;
  bannerImage: string;
  propertyName: string;
  propertyAddress: string;
  starRating: number;
  contactEmail?: string;
  contactPhone?: string;
}

export interface FetchRoomsResponse {
  rooms: Room[];
  bookingEngineConfig: BookingEngineConfig;
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequest?: string;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  priceType: 'per_night' | 'per_stay' | 'per_person';
  category: string;
  icon?: string;
  maxQuantity?: number;
}

export interface SelectedAddOn {
  addOn: AddOn;
  quantity: number;
}

export interface LoyaltyInfo {
  isApplied: boolean;
  programName: string;
  discountPercentage: number;
}

export interface BookingSession {
  searchCriteria: SearchCriteria | null;
  selectedRoom: Room | null;
  selectedRatePlan: RatePlan | null;
  guestDetails: GuestDetails | null;
  config: BookingEngineConfig | null;
  rooms: Room[];
  loyaltyInfo: LoyaltyInfo | null;
  selectedAddOns: SelectedAddOn[];
}

export interface PriceSummary {
  nights: number;
  basePrice: number;
  taxes: number;
  total: number;
  currency: string;
  roomName: string;
  ratePlanName: string;
  loyaltyDiscount?: number;
  loyaltyProgramName?: string;
  addOnsTotal?: number;
}
