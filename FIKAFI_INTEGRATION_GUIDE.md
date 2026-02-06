# Fikafi Payment Gateway Integration Guide

## Overview

This guide explains how to integrate the Fikafi payment gateway into the Simplified Booking Engine. Fikafi is a payment solution that allows hotels to create payment links for guests to pay online via credit/debit cards or other payment methods.

## Fikafi API Details (from official documentation)

### Base URL
- **Sandbox/Demo**: `https://demo.encorepay.co/FikafiSandbox/FikafiApi/api`
- **Production**: Use your production URL (contact Fikafi for details)

### Endpoint
```
POST /payment/createPayment
```

### Authentication
- **Authorization**: Bearer token (JWT format)
- Header: `Authorization: Bearer {your_token}`

### Request Format

```json
{
  "bookingRefNum": "BKGYGUIAT34534",
  "guestDetails": {
    "guestName": "Joseph 3",
    "phoneNum": "(757) 620-4011",
    "email": "zaidwaqar66@gmail.com"
  },
  "bookingDetails": {
    "propertyID": "KSA_MUK_01",
    "referenceDetails": "nulla qui do",
    "communicationMode": "EMAIL",
    "arrivalDate": "2025-09-15",
    "numberOfNights": 2
  },
  "paymentDetails": {
    "currency": "AED",
    "totalAmounts": 132.79,
    "numOfPayments": 1,
    "validity": "8 hours",
    "payments": [
      {
        "paymentNumber": 1,
        "amount": 132.79,
        "date": "2025-09-02"
      }
    ]
  },
  "webhook": {
    "payment_details_url": "https://your-domain.com/api/v1/fikafi/webhook/payment-details",
    "payment_event_url": "https://your-domain.com/api/v1/fikafi/webhook/payment-event"
  }
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "paymentLink": "https://payment.fikafi.com/pay/xxx",
    "paymentId": "xxx",
    "expiresAt": "2025-09-15T08:00:00Z"
  }
}
```

## Environment Variables

### Server (.env)

Add these variables to your server's `.env` file:

```env
# Fikafi Payment Gateway Configuration

# Base URL (Sandbox or Production)
FIKAFI_BASE_URL=https://demo.encorepay.co/FikafiSandbox/FikafiApi/api

# API Key (Bearer token from Fikafi dashboard)
# Get this from your Fikafi account
FIKAFI_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Webhook secret for signature verification
FIKAFI_WEBHOOK_SECRET=your_webhook_secret
```

### Getting Your Fikafi Credentials

1. **Log into Fikafi Dashboard**:
   - Contact Fikafi support to get access to their merchant dashboard

2. **Find API Credentials**:
   - Navigate to API/Developer settings
   - Copy the Bearer token for Authorization header
   - Note the correct Base URL (sandbox vs production)

3. **Property Configuration**:
   - Ensure your property is registered in Fikafi system
   - Get the correct `propertyID` (e.g., "KSA_MUK_01")

## API Endpoints

The integration provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/fikafi/create-payment-link` | POST | Create a new payment link |
| `/api/v1/fikafi/generate-from-reservation` | POST | Generate link from existing reservation |
| `/api/v1/fikafi/payment-status/:paymentId` | GET | Check payment status |
| `/api/v1/fikafi/webhook/payment-details` | POST | Receive payment details webhook |
| `/api/v1/fikafi/webhook/payment-event` | POST | Receive payment events webhook |

## Frontend Integration

### 1. Payment Page Configuration

The Payment page (`website/src/app/Payment/page.tsx`) is configured to show:
- **Pay at Hotel** - For pay-on-arrival bookings
- **Pay Online (Fikafi)** - For online card payments

### 2. Payment Button

When users select "Pay Online", they see the FikafiPaymentButton which:
1. Calls the backend to create a payment link
2. Redirects the user to complete payment on Fikafi
3. Handles success/failure callbacks

## Webhook Configuration

### Payment Details Webhook
- **URL**: `https://your-domain.com/api/v1/fikafi/webhook/payment-details`
- **Purpose**: Receives detailed payment information

### Payment Event Webhook
- **URL**: `https://your-domain.com/api/v1/fikafi/webhook/payment-event`
- **Purpose**: Receives payment status updates (success, failed, expired, etc.)

### Supported Events
- `payment_initiated` - Payment started
- `payment_completed` - Payment successful
- `payment_failed` - Payment failed
- `payment_expired` - Payment link expired
- `payment_refunded` - Payment refunded

## Testing

### 1. Using Sandbox/Demo
1. Set `FIKAFI_BASE_URL` to the sandbox URL
2. Use the demo Bearer token provided by Fikafi
3. Use test property IDs from Fikafi documentation

### 2. Test Scenarios
- ✅ Create payment link successfully
- ✅ Redirect to payment page
- ✅ Complete test payment
- ✅ Receive webhook notifications

### 3. Common Issues

| Error | Solution |
|-------|----------|
| `ENOTFOUND api.fikafi.com` | Check FIKAFI_BASE_URL is correct |
| `401 Unauthorized` | Verify FIKAFI_API_KEY is valid |
| `404 Not Found` | Check endpoint path is correct |
| `Invalid propertyID` | Contact Fikafi to register property |

## Production Deployment

### 1. Update Environment Variables
```env
FIKAFI_BASE_URL=https://api.fikafi.com  # Production URL
FIKAFI_API_KEY=your_production_token
```

### 2. Security Checklist
- [ ] Use HTTPS for all endpoints
- [ ] Enable webhook signature verification
- [ ] Store API keys securely
- [ ] Configure proper CORS settings
- [ ] Set up proper error logging

### 3. Monitoring
- Monitor webhook delivery success rates
- Set up alerts for failed payments
- Log all payment events for debugging

## File Structure

```
server/src/fikafi-payment/
├── controller/
│   └── fikafi.controller.ts    # API controllers and endpoints
├── routes/
│   └── fikafi.routes.ts        # Route definitions
├── service/
│   └── fikafi.service.ts        # Fikafi API client
└── types/
    └── fikafi.types.ts         # TypeScript interfaces

website/src/components/payment/
└── FikafiPaymentButton.tsx      # Frontend payment button
```

## Support

For issues with:
- **Fikafi API**: Contact Fikafi support
- **Integration code**: Check server logs for error details
- **Environment setup**: Verify all .env variables are set correctly

