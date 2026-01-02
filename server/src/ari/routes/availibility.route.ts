import { Router } from 'express';
import { AvailabilityController } from '../controllers';
import { protect } from '../../middlewares/auth.middleware';

export const availabilityRouter = Router();

// GET /api/availability/calendar?propertyCode=INH63954&startDate=2025-12-29&endDate=2026-01-28
availabilityRouter
  .route('/calendar')
  .get(
    protect,
    AvailabilityController.getCalendarAvailability
  );
