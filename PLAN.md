1. *Fix `ReservationService.deleteReservation` in `server/src/pms/frontoffice/reservation/services/reservation.service.ts`.*
   - Import `PaymentConfigResolver` and `NGeniusSecrets`.
   - Resolve N-Genius configuration using `PaymentConfigResolver.resolveConfig` within `deleteReservation`.
   - Update calls to `ngeniusService.processSameDayRefund` and `ngeniusService.processRefund` to include the resolved configuration.
2. *Verify the fix.*
   - Run TypeScript type check again to ensure no more errors in `ReservationService`.
3. *Complete pre commit steps*
   - Ensure proper testing, verification, and review.
4. *Submit the changes.*
