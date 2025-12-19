import { type User,type Member,type Hotel,type LogEntry,type Role,type Property } from './types';

export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@hotel.com',
    role: 'Admin',
    linkedProperty: 'Grand Plaza Hotel',
    level: 'Senior',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@hotel.com',
    role: 'Manager',
    linkedProperty: 'Oceanview Resort',
    level: 'Mid',
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@hotel.com',
    role: 'Staff',
    linkedProperty: 'City Center Inn',
    level: 'Junior',
    createdAt: '2024-02-01'
  }
];

export const mockMembers: Member[] = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice.smith@email.com',
    role: 'Premium Member',
    propertyLink: 'Grand Plaza Hotel',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Wilson',
    email: 'bob.wilson@email.com',
    role: 'Gold Member',
    propertyLink: 'Oceanview Resort',
    createdAt: '2024-01-18'
  },
  {
    id: '3',
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.davis@email.com',
    role: 'Silver Member',
    createdAt: '2024-02-05'
  }
];

export const mockHotels: Hotel[] = [
  {
    id: '1',
    name: 'Grand Plaza Hotel',
    location: 'New York, NY',
    rooms: 150,
    occupancyRate: 85,
    revenue: 125000,
    status: 'active'
  },
  {
    id: '2',
    name: 'Oceanview Resort',
    location: 'Miami, FL',
    rooms: 200,
    occupancyRate: 92,
    revenue: 180000,
    status: 'active'
  },
  {
    id: '3',
    name: 'City Center Inn',
    location: 'Chicago, IL',
    rooms: 80,
    occupancyRate: 76,
    revenue: 85000,
    status: 'active'
  },
  {
    id: '4',
    name: 'Mountain View Lodge',
    location: 'Denver, CO',
    rooms: 120,
    occupancyRate: 68,
    revenue: 95000,
    status: 'inactive'
  }
];

export const mockLogs: LogEntry[] = [
  {
    id: '1',
    date: '2024-01-15T10:30:00',
    action: 'Property Created',
    performedBy: 'John Doe',
    details: 'Created Grand Plaza Hotel with 150 rooms',
    type: 'property'
  },
  {
    id: '2',
    date: '2024-01-18T14:15:00',
    action: 'Member Added',
    performedBy: 'Sarah Johnson',
    details: 'Added Bob Wilson as Gold Member',
    type: 'member'
  },
  {
    id: '3',
    date: '2024-01-20T09:45:00',
    action: 'Property Updated',
    performedBy: 'Mike Chen',
    details: 'Updated Oceanview Resort room inventory',
    type: 'property'
  },
  {
    id: '4',
    date: '2024-02-01T16:20:00',
    action: 'Member Created',
    performedBy: 'John Doe',
    details: 'Created Emma Davis as Silver Member',
    type: 'member'
  }
];

export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    permissions: { read: true, write: true, delete: true }
  },
  {
    id: '2',
    name: 'Manager',
    permissions: { read: true, write: true, delete: false }
  },
  {
    id: '3',
    name: 'Staff',
    permissions: { read: true, write: false, delete: false }
  }
];

export const mockProperty: Property = {
  id: '1',
  name: 'Grand Plaza Hotel',
  location: 'New York, NY',
  images: [
    'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
    'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg'
  ],
  description: 'A luxury hotel in the heart of Manhattan with world-class amenities and service.',
  rooms: [
    {
      id: '1',
      type: 'Standard Room',
      price: 250,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Mini Bar', 'AC']
    },
    {
      id: '2',
      type: 'Deluxe Room',
      price: 350,
      capacity: 3,
      amenities: ['WiFi', 'TV', 'Mini Bar', 'AC', 'City View', 'Room Service']
    },
    {
      id: '3',
      type: 'Suite',
      price: 550,
      capacity: 4,
      amenities: ['WiFi', 'TV', 'Mini Bar', 'AC', 'City View', 'Room Service', 'Balcony', 'Living Area']
    }
  ],
  ratePlans: [
    {
      id: '1',
      name: 'Standard Rate',
      baseRate: 250,
      seasonalRates: [
        { season: 'Peak', rate: 300 },
        { season: 'Off-Peak', rate: 200 }
      ]
    },
    {
      id: '2',
      name: 'Weekend Special',
      baseRate: 280,
      seasonalRates: [
        { season: 'Peak', rate: 350 },
        { season: 'Off-Peak', rate: 220 }
      ]
    }
  ],
  bankDetails: {
    bankName: 'Chase Bank',
    accountNumber: '****1234',
    routingNumber: '021000021',
    accountHolder: 'Grand Plaza Hotel LLC'
  }
};

export const bookingData = [
  { name: 'Jan', bookings: 65, revenue: 125000 },
  { name: 'Feb', bookings: 59, revenue: 110000 },
  { name: 'Mar', bookings: 80, revenue: 145000 },
  { name: 'Apr', bookings: 81, revenue: 152000 },
  { name: 'May', bookings: 56, revenue: 105000 },
  { name: 'Jun', bookings: 95, revenue: 180000 }
];