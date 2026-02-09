# Simplified Booking Engine

A comprehensive hotel management and booking platform built with a modern tech stack. This system provides a complete solution for property management, reservations, pricing, promotions, and customer loyalty programs.

## 🏗️ Architecture Overview

The project follows a **monorepo structure** with three main components:

```
simplified-booking-engine/
├── client/          # React Admin Dashboard (Extranet)
├── server/          # Node.js Express API Backend
└── website/         # Next.js Public Booking Website
```

---

## 📦 Tech Stack

### Client (Admin Dashboard)

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Data Fetching**: TanStack React Query, Axios
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Routing**: React Router DOM

### Server (Backend API)

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Primary) + MongoDB
- **ORM**: Prisma
- **Authentication**: JWT with bcrypt
- **File Storage**: Cloudinary
- **Email Service**: SendGrid, Nodemailer
- **PDF Generation**: Puppeteer, html-pdf-node

### Website (Public Booking Portal)

- **Framework**: Next.js 13 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit with persist
- **Forms**: React Hook Form
- **Deployment**: PM2 process manager

---

## 🚀 Features

### Property Management

- Multi-level organizational structure (Super → Group → Brand → Property)
- Property creation and configuration
- Room inventory management
- 360° room view support
- Amenity management

### Booking Engine

- Real-time availability management
- Multiple rate plans (B2B & B2C)
- Dynamic pricing
- Start/Stop sell controls
- Restriction management (CTA/CTD)

### Pricing & Revenue Management

- Seasonal pricing
- Rate plan mapping
- Tax system with groups and rules
- Geo-based pricing
- Day-of-week restrictions

### Promotions & Discounts

- Promo codes
- Early bird promotions
- Device-specific offers
- Last-minute deals
- MLOS (Minimum Length of Stay) rules
- Customizable deals

### Channel Management

- Agency management
- Agent management
- Agentic properties
- Commission tracking
- Corporate booking support

### Loyalty Program

- Guest loyalty registration
- Tiered loyalty programs (Basic/Advance)
- Loyalty conditions and rules
- Custom registration fields
- Guest management

### Communication Services
- SMS notifications
- Email service integration
- Booking confirmations
- Payment reminders

### Payment Gateway Integration
- **Fikafi Payment Gateway** - Secure payment link generation
  - Support for single and installment payments
  - WhatsApp and Email communication modes
  - Real-time payment status tracking
  - Webhook support for payment events
- Pay at Hotel
- Bank Transfer
- UPI Payment
- Online Payment Gateway

### Access Control

- Role-based permissions (RBAC)
- Multiple user roles:
  - Super Admin
  - Group Manager
  - Brand Manager
  - Hotel Manager
  - Staff
  - Revenue Manager

---

## 📁 Project Structure

### Client Structure

```
client/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components
│   │   ├── auth/        # Authentication components
│   │   ├── layout/      # Layout components
│   │   └── ...
│   ├── pages/           # Route pages
│   │   ├── dashboard/
│   │   ├── property/
│   │   ├── bookings/
│   │   ├── rate-plan/
│   │   ├── promotions/
│   │   ├── agency/
│   │   ├── loyalty/
│   │   └── ...
│   ├── redux/          # Redux store and slices
│   ├── lib/            # Utilities and types
│   ├── contexts/       # React contexts
│   └── Route.tsx       # Main routing configuration
```

### Server Structure

```
server/
├── prisma/
│   └── schema.prisma   # Database schema
├── src/
│   ├── access-control/ # RBAC implementation
│   ├── add-on/        # Add-on services
│   ├── agency/        # Agency management
│   ├── ari/           # Availability, Rates, Inventory
│   ├── auth/          # Authentication
│   ├── booking-engine/# Core booking logic
│   ├── config/        # Configuration
│   ├── dashboard/     # Dashboard analytics
│   ├── logs/          # Audit logging
│   ├── loyalty/       # Loyalty programs
│   ├── middlewares/   # Express middlewares
│   ├── pms/          # PMS integration
│   ├── policies/     # Policy management
│   ├── promocode/    # Promo code management
│   ├── promotions/    # Promotion rules
│   ├── property-management/
│   ├── sms-email-service/
│   ├── tax-system/   # Tax configuration
│   └── utils/         # Utility functions
```

### Database Schema (Prisma)

Key models include:

- **Creation**: Multi-level organizational entity
- **User**: System users with roles
- **Property**: Hotel/property details
- **Room**: Room inventory
- **RatePlan**: Pricing plans
- **Reservation**: Booking records
- **Guest**: Guest information
- **Promotion**: Promotional rules
- **Agency**: Travel agency management
- **LoyaltyProgram**: Loyalty configuration

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+
- npm or yarn
- PM2 (for production)

### Environment Variables

#### Server (.env)

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/booking
EXTRANET_MONGO_URI=mongodb://localhost:27017/extranet
JWT_SECRET_KEY=your-jwt-secret
JWT_EXPIRES_IN=7d
CLOUDINARY_URL=cloudinary://...
SENDGRID_API_KEY=your-sendgrid-key
EMAIL_USER=your-email@gmail.com
EMAIL_SERVICE_PASSWORD=your-password
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3036
```

#### Client (.env)

```env
VITE_BACKEND_URI=http://localhost:3000
```

#### Website (.env)

```env
NEXT_PUBLIC_BASE_API_URL=http://localhost:3000
```

### Installation Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd simplified-booking-engine
```

2. **Setup Server**

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```

3. **Setup Client**

```bash
cd client
npm install
npm run dev
```

4. **Setup Website**

```bash
cd website
npm install
npm run dev
```

---

## 📜 Available Scripts

### Server

```bash
npm run dev           # Start development server
npm run build         # Compile TypeScript
npm run start:test    # Start compiled server
npm run start:pm2     # Start with PM2
npm run db:push       # Push schema to database
npm run format        # Format code with Prettier
npm run lint          # Run ESLint
```

### Client

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run lint          # Run ESLint
```

### Website

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Build and start with PM2
npm run lint          # Run ESLint
```

---

## 🔐 Authentication Flow

1. User logs in via `/login`
2. Server validates credentials and issues JWT token
3. Token stored in cookies with credentials flag
4. Protected routes require valid token
5. Role-based access control enforced via middlewares

---

## 📊 Database Models

### User Roles & Permissions

| Role            | Description                  |
| --------------- | ---------------------------- |
| super_admin     | Full system access           |
| group_manager   | Manage multiple properties   |
| brand_manager   | Manage brand properties      |
| hotel_manager   | Single property management   |
| staff           | Limited operations           |
| revenue_manager | Pricing and inventory access |

### Booking Flow

```
Search → Select Property → Choose Room → Select Rate Plan
→ Add-ons → Review → Payment → Confirmation
```

---

## 🧪 API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/forgot-password` - Password reset

### Properties

- `GET /property` - List properties
- `POST /property` - Create property
- `PUT /property/:id` - Update property
- `GET /property/:id` - Get property details

### Bookings

- `GET /bookings` - List bookings
- `POST /bookings` - Create booking
- `PUT /bookings/:id` - Update booking
- `POST /bookings/:id/cancel` - Cancel booking

### Rate Plans

- `GET /rate-plans` - List rate plans
- `POST /rate-plans` - Create rate plan
- `PUT /rate-plans/:id` - Update rate plan

---

## 📱 Responsive Design

The client dashboard is fully responsive and works on:

- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

---

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- CORS configuration
- Rate limiting
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS protection

---

## 📈 Performance Optimizations

- React Query for data caching
- Lazy loading of routes
- Optimized bundle size
- Database indexing
- Connection pooling

---

## 🚀 Deployment

### Production Build

1. **Server**

```bash
cd server
npm run build
npm run start:pm2
```

2. **Client**

```bash
cd client
npm run build
# Serve static files
```

3. **Website**

```bash
cd website
npm run build
npm run start
```

---

## 📝 License

ISC License

---

## 👨‍💻 Author

**Quotus**

---
