# N-Genius Webhook Integration

## Overview

This integration adds webhook support for N-Genius Online payment notifications. The webhook endpoint can receive both encrypted and unencrypted payloads from N-Genius Online.

## Features

- ✅ Receives webhook notifications from N-Genius Online
- ✅ Supports both encrypted (AES-256-CBC) and unencrypted payloads
- ✅ Handles 30+ webhook event types
- ✅ Validates incoming requests
- ✅ Responds within 15 seconds (as required by N-Genius)
- ✅ Comprehensive logging of all webhook events

## API Endpoints

### Main Webhook Endpoint
**POST** `/api/v1/payment/webhook`

This is the endpoint that should be configured in your N-Genius Online merchant portal.

**Headers:**
- `Content-Type`: `application/json` (for unencrypted) or `text/plain` (for encrypted)
- `X-Webhook-Secret` (optional): Your 32-character secret key for encrypted payloads

**Response:**
```json
{
  "success": true,
  "message": "Webhook received and processed successfully",
  "eventId": "4120eec7-9dbe-4163-912e-c2f0b459ef2d",
  "eventName": "CAPTURED",
  "processingTime": "5ms"
}
```

### Test Endpoint
**POST** `/api/v1/payment/webhook/test`

A test endpoint to simulate webhook events during development.

## Supported Webhook Events

The integration supports all N-Genius webhook events including:

### Payment Events
- `AUTHORISED` - Payment authorized
- `DECLINED` - Payment declined
- `AUTHORISATION_FAILED` - Authorization failed
- `PURCHASED` - Purchase completed
- `PURCHASE_DECLINED` - Purchase declined
- `PURCHASE_FAILED` - Purchase failed

### Capture Events
- `CAPTURED` - Payment captured (full amount)
- `PARTIALLY_CAPTURED` - Payment partially captured
- `CAPTURE_FAILED` - Capture failed
- `CAPTURE_VOIDED` - Capture cancelled/voided

### Refund Events
- `REFUNDED` - Full refund processed
- `PARTIALLY_REFUNDED` - Partial refund processed
- `REFUND_FAILED` - Refund failed
- `REFUND_VOIDED` - Refund cancelled
- `REFUND_REQUESTED` - Refund requested (APM)

### Reversal Events
- `FULL_AUTH_REVERSED` - Authorization reversed
- `PURCHASE_REVERSED` - Purchase reversed

### Order Events
- `ORDER_CLOSED` - Order closed (no further transactions possible)
- `CANCELLED` - Payment cancelled
- `CANCELLATION_REQUESTED` - Cancellation requested

### Fraud Check Events
- `GATEWAY_RISK_PRE_AUTH_REJECTED` - Pre-auth risk check rejected
- `PRE_AUTH_FRAUD_CHECK_REJECTED` - Pre-auth fraud check rejected
- `POST_AUTH_FRAUD_CHECK_REJECTED` - Post-auth fraud check rejected
- `POST_AUTH_FRAUD_CHECK_REVIEW` - Post-auth fraud check under review
- `POST_AUTH_FRAUD_CHECK_ACCEPTED` - Post-auth fraud check accepted

### APM Events
- `APM_PAYMENT_ACCEPTED` - Alternative Payment Method accepted

## Configuration in N-Genius Portal

1. Log in to your N-Genius Online merchant dashboard
2. Navigate to **Settings** → **Integrations** → **Webhooks**
3. Click **New** to create a new webhook
4. Fill in the following:
   - **Name**: `Your App Name Webhook`
   - **URL**: `https://yourdomain.com/api/v1/payment/webhook`
   - **Header Key** (optional for encryption): `X-Webhook-Secret`
   - **Header Value** (optional): Your 32-character secret key

5. Submit and wait for approval (webhooks require whitelisting)

## Encryption Support

### How Encryption Works

When encryption is enabled:
1. N-Genius sends a Base64-encoded encrypted payload
2. The first 16 bytes are the Initialization Vector (IV)
3. The rest is the encrypted payload
4. Decryption uses AES-256-CBC with PKCS5 padding

### Secret Key Requirements

- Exactly 32 ASCII characters
- Must include letters, digits, and symbols
- Cannot be repeated characters
- No whitespace allowed

Example valid key:
```
f9K@82nNc%P!r4QwLxTzA#10UvM&b6Xe
```

## Testing the Webhook

### Test Unencrypted Webhook

```bash
curl -X POST http://localhost:8001/api/v1/payment/webhook/test \
  -H \"Content-Type: application/json\"
```

### Test with Custom Payload

```bash
curl -X POST http://localhost:8001/api/v1/payment/webhook \
  -H \"Content-Type: application/json\" \
  -d '{
    \"outletId\": \"your-outlet-id\",
    \"eventId\": \"test-event-123\",
    \"eventName\": \"CAPTURED\",
    \"order\": {
      \"_id\": \"urn:order:test-123\",
      \"_links\": {
        \"self\": {\"href\": \"http://test\"},
        \"tenant-brand\": {\"href\": \"http://test\"},
        \"merchant-brand\": {\"href\": \"http://test\"}
      },
      \"type\": \"SINGLE\",
      \"action\": \"SALE\",
      \"amount\": {
        \"currencyCode\": \"AED\",
        \"value\": 10000
      },
      \"language\": \"en\",
      \"reference\": \"test-ref-123\",
      \"outletId\": \"your-outlet-id\",
      \"createDateTime\": \"2026-02-04T00:00:00.000Z\",
      \"formattedAmount\": \"AED 100.00\"
    }
  }'
```

## Webhook Payload Structure

### Example Payload

```json
{
  \"outletId\": \"670bfc06-63d6-472b-af75-ad0207ac44f5\",
  \"eventId\": \"4120eec7-9dbe-4163-912e-c2f0b459ef2d\",
  \"eventName\": \"CAPTURED\",
  \"order\": {
    \"_id\": \"urn:order:2fc2d9d9-3b5f-45b2-9c85-9d11a3eb43ce\",
    \"reference\": \"2fc2d9d9-3b5f-45b2-9c85-9d11a3eb43ce\",
    \"action\": \"SALE\",
    \"amount\": {
      \"currencyCode\": \"AED\",
      \"value\": 9876543
    },
    \"_embedded\": {
      \"payment\": [{
        \"state\": \"CAPTURED\",
        \"reference\": \"4f13abd2-77fa-442d-9288-e91b757be1ce\",
        \"paymentMethod\": {
          \"name\": \"VISA\",
          \"pan\": \"411111******1111\"
        }
      }]
    }
  }
}
```

## File Structure

```
/app/server/src/payment/
├── config/
│   └── ngenius.config.ts          # N-Genius API configuration
├── controllers/
│   ├── ngenius.controller.ts      # Order & payment controllers
│   └── webhook.controller.ts      # Webhook receiver controller
├── services/
│   ├── ngenius.service.ts         # N-Genius API service
│   └── webhook.service.ts         # Webhook processing service
├── types/
│   ├── ngenius.types.ts           # N-Genius API types
│   └── webhook.types.ts           # Webhook payload types
└── routes/
    ├── index.ts                   # Main payment router
    ├── ngenius.routes.ts          # N-Genius API routes
    └── webhook.routes.ts          # Webhook routes
```

## Implementation Details

### Webhook Service (`webhook.service.ts`)

- `decryptPayload()` - Decrypts encrypted webhook payloads using AES-256-CBC
- `processWebhookEvent()` - Processes and logs webhook events
- `validateWebhookRequest()` - Validates incoming webhook requests

### Webhook Controller (`webhook.controller.ts`)

- `receiveWebhook()` - Main webhook receiver endpoint
- `testWebhook()` - Test endpoint for development

## Logging

All webhook events are logged to the console with the following information:

```
========================================
📥 N-Genius Webhook Event Received
========================================
Event ID: 4120eec7-9dbe-4163-912e-c2f0b459ef2d
Event Name: CAPTURED
Outlet ID: 670bfc06-63d6-472b-af75-ad0207ac44f5
Order Reference: 2fc2d9d9-3b5f-45b2-9c85-9d11a3eb43ce
Order ID: urn:order:2fc2d9d9-3b5f-45b2-9c85-9d11a3eb43ce
Order Action: SALE
Amount: 9876543 AED
Payment State: CAPTURED
Payment Reference: 4f13abd2-77fa-442d-9288-e91b757be1ce
Payment Method: VISA
Card PAN: 411111******1111
========================================
✅ Webhook Event Logged Successfully
========================================
```

## Best Practices

1. **Response Time**: Always respond with 200/201 within 15 seconds
2. **Idempotency**: Process each event only once using `eventId`
3. **Logging**: Log all webhook events for audit trail
4. **Security**: Use encrypted webhooks with secret header validation
5. **Error Handling**: Handle errors gracefully and still acknowledge receipt

## Important Notes

⚠️ **No Retries**: N-Genius does not retry failed webhooks. If your server is down, the event is lost.

⚠️ **Multiple Events**: A single payment may trigger multiple events (e.g., AUTHORISED → CAPTURED).

⚠️ **Validation**: Always validate webhook payloads before processing.

## Future Enhancements

To extend this integration, you can:

1. **Database Storage**: Store webhook events in a database for audit purposes
2. **Idempotency**: Implement event deduplication using `eventId`
3. **Event Processing**: Add business logic to handle different event types
4. **Notifications**: Send email/SMS notifications based on events
5. **Order Updates**: Automatically update order status in your system
6. **Downstream Processing**: Trigger fulfillment, inventory updates, etc.

## Support

For more information, refer to the [N-Genius Online Webhook Documentation](https://docs.network.ae).
