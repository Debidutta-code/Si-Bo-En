export type GuestType = 'adult' | 'child' | 'infant';

export type IdentityCardType = 'adhar_card' | 'passport' | 'driving_license' | 'voter_id';

export type PaymentMethod = 'pay_at_hotel' | 'pay_online';

export type ReservationStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'pending';

export interface Property {
  id: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  images?: string[];
  totalRooms?: number;
  availableRooms?: number;
  rating?: number;
  amenities?: string[];
  propertyType?: string;
  addedOn?: string;
  contactEmail?: string;
  contactPhone?: string;
  checkInTime?: string;
  checkOutTime?: string;
  description?: string;
  propertyCode?: string;
  
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  type: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  image: string;
  isAvailable: boolean;
}

export interface Guest {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  userType: GuestType;
  propertyId: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  userIdentityCardType?: IdentityCardType;
  identityCardNumber?: string;
  identityCardImage?: string;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  selected: boolean;
}

export interface Reservation {
  id: string;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  totalGuests: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: ReservationStatus;
  createdAt: string;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  pendingBookings: number;
  todayCheckIns: number;
  todayCheckOuts: number;
}
