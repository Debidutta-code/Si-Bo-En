# Audit Spa Module — Translation Completeness Report

## Summary
The current translation coverage for the Spa module has regressed from the previous ~70% baseline to approximately **50%**. While core entities (Spa services) have dynamic translation support for basic fields, the recent **slot-capacity feature** was implemented almost entirely without i18n support in the extranet, and with incomplete key mappings in the booking engine.

*   **Frontend Static Translation:** ~40% coverage. Most new components for slot management are hardcoded.
*   **Backend Dynamic Translation:** ~70% coverage. Basic fields (name, description, location) are supported, but newer/complex fields (benefits, conditions) are not.

---

## Broken key-display bugs
These keys are referenced in the code but display as raw text in the UI because they are missing from the locale resource files.

| File Path | Component | Broken Key Shown | Likely Root Cause |
| :--- | :--- | :--- | :--- |
| `client/src/pages/spa/components/SpaSlotDialog.tsx` | `SpaSlotDialog` | `SpaSlotDialog.noOfSlots` | Key missing from all `translation.json` files in `client`. |
| `website/src/app/(unauth)/spa/spaid/SpaClient.tsx` | `SpaClient` | `SpaClient.modal.confirmAndBook` | Key missing from `website` translation files. |
| `website/src/app/(unauth)/spa/spaid/SpaClient.tsx` | `SpaClient` | `SpaClient.modal.price.totalAmount` | Key missing from `website` translation files. |
| `website/src/app/(unauth)/spa/spaid/SpaClient.tsx` | `SpaClient` | `SpaClient.modal.price.totalGuests` | Key missing from `website` translation files. |
| `website/src/app/(unauth)/spa/spaid/SpaClient.tsx` | `SpaClient` | `SpaClient.modal.price.totalSlots` | Key missing from `website` translation files. |
| `website/src/app/(unauth)/spa/spaid/SpaClient.tsx` | `SpaClient` | `SpaClient.modal.subtitle` | Key missing from `website` translation files. |
| `website/src/app/(unauth)/spa/spaid/SpaClient.tsx` | `SpaClient` | `SpaClient.toast.noMoreSpots` | Key missing from `website` translation files. |

---

## Hardcoded static strings not yet translated
User-facing strings that are currently hardcoded in English and not wrapped in `t()`.

| File Path | Line Number | String | Suggested Key Name |
| :--- | :--- | :--- | :--- |
| `client/src/pages/spa/components/SpaConfigDialog.tsx` | 108 | "Configure Spa Dates" | `SpaConfigDialog.title` |
| `client/src/pages/spa/components/SpaConfigDialog.tsx` | 134 | "Day Config Only" | `SpaConfigDialog.modeDayOnly` |
| `client/src/pages/spa/components/SpaConfigDialog.tsx` | 143 | "Day + Slots" | `SpaConfigDialog.modeDaySlots` |
| `client/src/pages/spa/components/SpaConfigDialog.tsx` | 154 | "First slot start time" | `SpaConfigDialog.firstSlotStartTime` |
| `client/src/pages/spa/components/SpaConfigDialog.tsx` | 167 | "Number of slots" | `SpaConfigDialog.numberOfSlots` |
| `client/src/pages/spa/components/SpaConfigDialog.tsx` | 179 | "Availability per slot" | `SpaConfigDialog.availabilityPerSlot` |
| `client/src/pages/spa/components/SpaConfigDialog.tsx` | 213 | "Cancel" | `Common.cancel` |
| `client/src/pages/spa/components/SpaSlotAvailabilityModal.tsx` | 100 | "Slot Availability —" | `SpaSlotAvailabilityModal.title` |
| `client/src/pages/spa/components/SpaSlotAvailabilityModal.tsx` | 104 | "of available" | `SpaSlotAvailabilityModal.availabilityStatus` |
| `client/src/pages/spa/components/SpaSlotAvailabilityModal.tsx` | 112 | "No availability records" | `SpaSlotAvailabilityModal.noRecords` |
| `client/src/pages/spa/components/SpaSlotAvailabilityModal.tsx` | 172 | "Reservation Details" | `SpaSlotAvailabilityModal.resDetails` |
| `client/src/pages/spa/components/SpaSlotAvailabilityModal.tsx` | 198 | "Delete availability slot?" | `SpaSlotAvailabilityModal.deleteTitle` |
| `website/src/app/(unauth)/spa/spaid/SpaClient.tsx` | 381 | "Add ?code=PROPERTY_CODE to the URL." | `SpaClient.states.urlInstruction` |
| `website/src/app/(unauth)/spa/spaid/SpaClient.tsx` | 665 | "Per Person" | `SpaClient.modal.perPerson` |
| `server/src/spa/templates/spa-booking-confirmation.ts` | 36 | "Your spa booking has been confirmed" | (Backend Template - requires i18n support) |

---

## Missing/mismatched keys in resource files
Keys that are used in the code but are missing from specific language files.

| Key | Referenced in File | Missing from which language file(s) |
| :--- | :--- | :--- |
| `SpaClient.modal.addGuest` | `SpaClient.tsx` | `ar`, `hi` |
| `SpaClient.modal.additionalGuests` | `SpaClient.tsx` | `ar`, `hi` |
| `SpaClient.slots.lastSpot` | `SpaClient.tsx` | `ar`, `hi` |
| `SpaClient.slots.spotsLeft` | `SpaClient.tsx` | `ar`, `hi` |
| `MySpa.table.na` | `My-Spa.tsx` | `ar`, `ru`, `tr`, `zh`, `hi` |

---

## Dynamic fields translation status
Status of fields that support multiple language variants via the "Add Translation" pattern.

| Field Name | Backend Translation Support | Frontend Locale-Aware Rendering | Notes |
| :--- | :--- | :--- | :--- |
| Spa Name | Yes | Yes | Works in Extranet List and Booking Engine. |
| Description | Yes | Yes | Works in Booking Engine; Extranet View Dialog uses hardcoded `spa.description`. |
| Location | Yes | Yes | Works in Booking Engine; Extranet View Dialog uses hardcoded `spa.location`. |
| Benefits | **No** | No | Stored as `String[]` in Prisma without translation model mapping. |
| Conditions | **No** | No | Stored as `Json` in Prisma; no translation track implemented. |
| Category Name | Yes | Yes | Nested entity; handled by Interceptor. |
| SubCategory Name | Yes | Yes | Nested entity; handled by Interceptor. |

---

## Slot-capacity feature specific findings
The recent refactor introduced several gaps:
1.  **Extranet Configuration:** The `SpaConfigDialog` and `SpaSlotAvailabilityModal` components (crucial for setting slot capacity) are **100% hardcoded in English**.
2.  **Booking Engine Display:** The "X spots left" and "Last spot" labels are translation-wrapped in the code but the keys were not added to the locale files.
3.  **Pluralization Logic:** The UI uses manual JavaScript template literals for pluralization (e.g., `${availability} seat{availability > 1 ? 's' : ''}`) instead of the built-in i18next pluralization feature (`t('key', { count: availability })`). This makes it impossible to translate correctly for languages like Arabic or Russian which have complex plural rules.
4.  **Concatenation:** Some labels are built using concatenation (e.g., `Slot Availability — ` + `time`), which breaks right-to-left (RTL) layout expectations for Arabic.

---

## Recommended fix plan

### Phase 1: Critical UI Fixes (Immediate)
*   **Fix broken key displays:** Backfill the missing keys in `client` and `website` translation files for all languages.
*   **Fix Extranet hardcoding:** Wrap all strings in `SpaConfigDialog.tsx` and `SpaSlotAvailabilityModal.tsx` with `t()` and add keys to `translation.json`.

### Phase 2: Refactor & Best Practices
*   **Implement proper pluralization:** Replace `${n} seats` with i18next `count` based translation keys.
*   **Fix Extranet View Dialog:** Update `SpaViewDialog.tsx` to respect `_translations` field for description and location, similar to the main `Spa.tsx` list.
*   **Remove concatenation:** Refactor concatenated labels to use interpolation (e.g., `t('slotAvailabilityAt', { time: ... })`).

### Phase 3: Dynamic Translation Expansion
*   **Add translation support for 'benefits' and 'conditions':**
    *   Update backend `SpaTranslation` model/schema.
    *   Update Extranet `AddTranslationDialog` field list.
    *   Update Frontend rendering to fallback to the original field if translation is missing.

### Phase 4: Backend/Email Localisation
*   **Localize Email Templates:** Refactor `spa-booking-confirmation.ts` and `spa-booking-cancellation.ts` to accept a locale and use translated strings for the email body and headers.
