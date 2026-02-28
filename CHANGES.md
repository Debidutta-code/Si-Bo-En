# Rev-Chill — Pricing Engine Fixes & Frontend Alignment

**Date:** February 28, 2026  

---

## 1. Bug Fix — `endDate.getTime is not a function`

### Root Cause
In `server/src/booking-engine/controllers/pricing.controller.ts`, the `startDate` and `endDate` values from `req.body` were being passed **as raw strings** directly into `getRoomRentService()`. Inside `BasePriceClass.calculateTotalPrice()`, `.getTime()` was called on these values, which threw `TypeError: endDate.getTime is not a function` because they were strings, not `Date` objects.

---

### Fix 1 — Controller: `pricing.controller.ts`

**File:** `server/src/booking-engine/controllers/pricing.controller.ts`

**Change:** Wrapped `startDate` and `endDate` with the already-imported `toUTC()` utility before passing them to the service.

```ts
// Before
const response = await this.pricingService.getRoomRentService(
    propertyId,
    invTypeCode,
    startDate,        // ❌ raw string from req.body
    endDate,          // ❌ raw string from req.body
    ratePlanCode,
    ...
);

// After
const response = await this.pricingService.getRoomRentService(
    propertyId,
    invTypeCode,
    toUTC(startDate), // ✅ converted to UTC Date object
    toUTC(endDate),   // ✅ converted to UTC Date object
    ratePlanCode,
    ...
);
```

---

### Fix 2 — Service: `pricing.service.ts`

**File:** `server/src/booking-engine/service/pricing.service.ts`

**Change:** Added a defensive parse at the top of `getRoomRentService` that coerces `Date | string` inputs to proper `Date` objects. This guards against any other callers (e.g. direct service invocations) passing in strings.

```ts
// Method signature updated to accept string | Date
public async getRoomRentService(
    propertyId: string,
    invTypeCode: string,
    startDate: Date | string,
    endDate: Date | string,
    ...
): Promise<IApiResponse<PriceBrakeDown>> {
    try {
        // Defensive parse at entry point
        const parsedStartDate: Date = startDate instanceof Date ? startDate : new Date(startDate);
        const parsedEndDate: Date = endDate instanceof Date ? endDate : new Date(endDate);
        startDate = parsedStartDate;
        endDate = parsedEndDate;
        
        const [ratePlan, selectedAddons, appliedPromotions] = await Promise.all([...]);
        ...
    }
}
```

---

## 2. Frontend Alignment — New `PriceBrakeDown` Interface

### Background
The booking engine's pricing API (`/booking-engine/pricing/get-price`) was updated to return a new `PriceBrakeDown` response shape. The website's `GuestFormModal` was still referencing **old legacy fields** that no longer existed, causing blank/broken price display in the guest booking modal.

### New `PriceBrakeDown` Interface (server)

```ts
interface PriceBrakeDown {
    totalAmount: number;
    amountBeforeTax: number;        // ← replaces breakdown.totalBaseAmount
    taxedAmount: number;            // ← replaces totalTax
    totalAddonAmount: number;
    totalPromotionAmount: number;
    currentChargeableAmount: number;
    latterpayableAmount: number;    // ← tourist tax (pay at hotel)
    promoCodeDiscount: number;
    loyalityDiscount: number;
    currencyCode: CurrencyCode;
    dailyPriceBrakeDown: DailyPriceBrakeDown[];
    taxBrakeDown: TaxBrakeDown[];   // ← replaces tax[] with { name, taxedAmount, currencyCode }
    addonBrakeDown: AddOnBrakeDown[];
    promotionBrakeDown: PromotionBrakeDown[];
}
```

### Pages Audited

| File | Status | Notes |
|------|--------|-------|
| `website/src/components/GuestModals/GuestFormModal.tsx` | ❌ **Fixed** | Was using legacy fields |
| `website/src/components/RoomPage/Pricesummerysidebar.tsx` | ✅ OK | Already using normalized fields |
| `website/src/app/Rooms/page.tsx` | ✅ OK | `normalizePriceBrakeDown()` maps correctly |
| `website/src/app/Payment/page.tsx` | ✅ OK | Only uses `totalAmount` & `dailyBreakdown[0].*` |
| `website/src/components/payment/PriceDetails.tsx` | ✅ OK | Only uses `totalAmount` |

---

### Fix 3 — Guest Form Modal: `GuestFormModal.tsx`

**File:** `website/src/components/GuestModals/GuestFormModal.tsx`

#### Field Mapping (Old → New)

| Old (Legacy) | New (PriceBrakeDown) |
|---|---|
| `finalPrice.breakdown.totalBaseAmount` | `finalPrice.amountBeforeTax` |
| `finalPrice.breakdown.totalAdditionalCharges` | `finalPrice.additionalGuestCharges` |
| `finalPrice.tax` (array) | `finalPrice.taxBrakeDown` (array) |
| `taxItem.amount` | `taxItem.taxedAmount` |
| `finalPrice.totalTax` | `finalPrice.taxedAmount` |

#### Tooltip (Daily Breakdown) — Fixed

```tsx
// Before (broken)
const dayProportion = day.totalPerRoom / finalPrice.breakdown.totalBaseAmount;
const dayTax = (finalPrice.totalTax || 0) * dayProportion;
...
<span>${finalPrice.breakdown.totalBaseAmount}</span>
<span>${finalPrice.totalTax || 0}</span>

// After (fixed)
const dayProportion = finalPrice.amountBeforeTax > 0
    ? day.totalPerRoom / finalPrice.amountBeforeTax
    : 0;
const dayTax = (finalPrice.taxedAmount || 0) * dayProportion;
...
<span>${(finalPrice.amountBeforeTax ?? 0).toFixed(2)}</span>
<span>${(finalPrice.taxedAmount || 0).toFixed(2)}</span>
```

#### Price Details Card — Fixed + Enhanced

Previously only showed `totalBaseAmount`, `additionalCharges`, and a legacy `tax` array.

Now correctly shows all available breakdown fields from the new interface:

```tsx
- Base Amount (before tax)        → finalPrice.amountBeforeTax
- Additional Guest Charges        → finalPrice.additionalGuestCharges  (conditional)
- Add-ons                         → finalPrice.totalAddonAmount         (conditional)
- Promotions                      → finalPrice.totalPromotionAmount     (conditional, green)
- Loyalty Discount                → finalPrice.loyalityDiscount         (conditional, green)
- Promo Code Discount             → finalPrice.promoCodeDiscount        (conditional, green)
- Tax breakdown items             → finalPrice.taxBrakeDown[].taxedAmount
- Total Tax                       → finalPrice.taxedAmount
- Pay at Hotel (Tourist Tax)      → finalPrice.latterpayableAmount      (conditional, amber)
- Number of Nights                → finalPrice.numberOfNights
- Grand Total                     → finalPrice.totalAmount
```

---

## Summary of Files Changed

| File | Change |
|------|--------|
| `server/src/booking-engine/controllers/pricing.controller.ts` | Wrap `startDate`/`endDate` with `toUTC()` before passing to service |
| `server/src/booking-engine/service/pricing.service.ts` | Accept `Date \| string`, add defensive parse at entry point |
| `website/src/components/GuestModals/GuestFormModal.tsx` | Replace all legacy price fields with new `PriceBrakeDown` fields; enhance price breakdown card |
