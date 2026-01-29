import { Router } from 'express';
import { AvailabilityController } from '../controllers';
import { protect } from '../../middlewares/auth.middleware';
import {attachPropertyDetails} from "../../middlewares/property.middleware"
export const availabilityRouter = Router();

availabilityRouter
  .route('/calendar')
  .get(
    protect,
    attachPropertyDetails({
      identifierType: "id",
      key: "propertyId",
      source: "query"
    }),
    AvailabilityController.getCalendarAvailability
  );
