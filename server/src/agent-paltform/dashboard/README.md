# Agent Platform Dashboard API

This module provides analytics and dashboard data for the agent platform, showing reservation statistics filtered by agency ID.

## Architecture

The dashboard follows a layered architecture:

```
dashboard/
├── types/           # TypeScript interfaces and types
├── repository/      # Data access layer (Prisma queries)
├── services/        # Business logic layer
├── controllers/     # HTTP request handlers
└── routes/          # API route definitions
```

## API Endpoints

### Base URL
All endpoints are prefixed with `/api/agent-platform/dashboard`

### Authentication
All endpoints require agent authentication using the `partnerProtected` middleware. The agent's JWT token must be provided in cookies as `agentAccessToken`.

---

### 1. Get Agency Analytics

**Endpoint:** `GET /analytics`

**Description:** Fetches comprehensive analytics for the authenticated agent's agency, including reservation statistics, revenue metrics, guest analytics, and property breakdowns.

**Authentication:** Required (Agent JWT)

**Query Parameters:**
- `propertyId` (optional): Filter by specific property ID
- `bookingStatus` (optional): Filter by booking status (pending, confirmed, cancelled, etc.)
- `startDate` (optional): Filter reservations from this date (ISO 8601 format)
- `endDate` (optional): Filter reservations until this date (ISO 8601 format)

**Example Request:**
```http
GET /api/agent-platform/dashboard/analytics?startDate=2026-01-01&endDate=2026-02-07
Cookie: agentAccessToken=<jwt-token>
```

**Response Schema:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    reservation: {
      totalReservations: number;
      confirmedReservations: number;
      pendingReservations: number;
      cancelledReservations: number;
      todayCheckIns: number;
      todayCheckOuts: number;
      upcomingReservations: number;
      recentBookings: number;
      cancellationRate: number;
    };
    revenue: {
      totalRevenue: number;
      paidAmount: number;
      pendingAmount: number;
      refundedAmount: number;
      averageBookingValue: number;
      revenueByPaymentMethod: {
        pay_at_hotel: number;
        net_banking: number;
        upi: number;
        payment_gateway: number;
      };
    };
    guest: {
      totalGuests: number;
      adults: number;
      children: number;
      infants: number;
      repeatGuests: number;
    };
    bookingSource: {
      direct: number;
      google: number;
      trip_adviser: number;
      trivago: number;
      social_media: number;
      agency: number;
    };
    propertiesBreakdown: Array<{
      propertyId: string;
      propertyName: string;
      propertyCode: string;
      totalReservations: number;
      totalRevenue: number;
      averageBookingValue: number;
    }>;
  };
}
```

**Success Response Example:**
```json
{
  "success": true,
  "message": "Analytics fetched successfully",
  "data": {
    "reservation": {
      "totalReservations": 150,
      "confirmedReservations": 120,
      "pendingReservations": 20,
      "cancelledReservations": 10,
      "todayCheckIns": 5,
      "todayCheckOuts": 3,
      "upcomingReservations": 45,
      "recentBookings": 35,
      "cancellationRate": 6.67
    },
    "revenue": {
      "totalRevenue": 750000,
      "paidAmount": 600000,
      "pendingAmount": 150000,
      "refundedAmount": 25000,
      "averageBookingValue": 5000,
      "revenueByPaymentMethod": {
        "pay_at_hotel": 450000,
        "net_banking": 150000,
        "upi": 100000,
        "payment_gateway": 50000
      }
    },
    "guest": {
      "totalGuests": 300,
      "adults": 250,
      "children": 40,
      "infants": 10,
      "repeatGuests": 25
    },
    "bookingSource": {
      "direct": 50,
      "google": 30,
      "trip_adviser": 20,
      "trivago": 10,
      "social_media": 15,
      "agency": 25
    },
    "propertiesBreakdown": [
      {
        "propertyId": "prop-123",
        "propertyName": "Grand Hotel",
        "propertyCode": "GH001",
        "totalReservations": 75,
        "totalRevenue": 375000,
        "averageBookingValue": 5000
      }
    ]
  }
}
```

**Error Response Example:**
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Agent not authenticated or agency not found"
}
```

---

### 2. Get Agency Properties

**Endpoint:** `GET /properties`

**Description:** Retrieves the list of properties that the authenticated agent's agency has access to.

**Authentication:** Required (Agent JWT)

**Query Parameters:** None

**Example Request:**
```http
GET /api/agent-platform/dashboard/properties
Cookie: agentAccessToken=<jwt-token>
```

**Response Schema:**
```typescript
{
  success: boolean;
  message: string;
  data: Array<{
    propertyId: string;
    propertyCode: string;
    propertyName: string;
  }>;
}
```

**Success Response Example:**
```json
{
  "success": true,
  "message": "Properties fetched successfully",
  "data": [
    {
      "propertyId": "prop-123",
      "propertyCode": "GH001",
      "propertyName": "Grand Hotel"
    },
    {
      "propertyId": "prop-456",
      "propertyCode": "BH002",
      "propertyName": "Beach Resort"
    }
  ]
}
```

---

## Data Flow

1. **Request** → Agent sends authenticated request
2. **Middleware** → `partnerProtected` validates JWT and extracts `agencyId`
3. **Controller** → Parses request parameters and calls service
4. **Service** → Validates inputs and calls repository
5. **Repository** → Queries Prisma database filtering by `agencyId`
6. **Response** → Returns formatted analytics data

## Database Queries

The dashboard queries the `Reservation` model with the following key filters:

```prisma
where: {
  agencyId: <agent's agency ID>,
  bookingSource: 'agency',
  // Additional filters from query params
}
```

## Key Features

- ✅ **Real-time Analytics**: Live data from reservations
- ✅ **Flexible Filtering**: Filter by date range, property, and booking status
- ✅ **Revenue Tracking**: Track paid, pending, and refunded amounts
- ✅ **Guest Analytics**: Breakdown by guest types and repeat guests
- ✅ **Property Breakdown**: Per-property performance metrics
- ✅ **Secure**: Agency-scoped data access only

## Error Handling

All endpoints return standardized error responses:

```typescript
{
  success: false;
  message: string;  // Human-readable error message
  error?: string;   // Technical error details (optional)
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing or invalid token)
- `500` - Internal Server Error

## Usage Notes

1. **Agency Scoping**: All data is automatically filtered by the authenticated agent's agency ID
2. **Date Filters**: Dates should be in ISO 8601 format (e.g., `2026-02-07T00:00:00Z`)
3. **Performance**: Queries use database indexes on `agencyId`, `propertyId`, and `bookingStatus`
4. **Caching**: Consider implementing response caching for frequently accessed analytics
