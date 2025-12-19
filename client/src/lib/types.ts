export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  linkedProperty?: string;
  level: string;
  createdAt: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  propertyLink?: string;
  createdAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  rooms: number;
  occupancyRate: number;
  revenue: number;
  status: 'active' | 'inactive';
}

export interface LogEntry {
  id: string;
  date: string;
  action: string;
  performedBy: string;
  details: string;
  type: 'property' | 'member';
}

export interface Role {
  id: string;
  name: string;
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
}

export interface Property {
  id: string;
  name: string;
  location: string;
  images: string[];
  description: string;
  rooms: Room[];
  ratePlans: RatePlan[];
  bankDetails?: BankDetails;
}

export interface Room {
  id: string;
  type: string;
  price: number;
  capacity: number;
  amenities: string[];
}

export interface RatePlan {
  id: string;
  name: string;
  baseRate: number;
  seasonalRates: {
    season: string;
    rate: number;
  }[];
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountHolder: string;
}