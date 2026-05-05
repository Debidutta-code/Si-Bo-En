import { Router } from 'express';
import { AvailabilityController } from '../controllers';
import { protect } from '../../middlewares/auth.middleware';
import {attachPropertyDetails} from "../../middlewares/property.middleware"
export const availabilityRouter = Router();

availabilityRouter
  .route('/calendar')
  .post(
    protect,
    attachPropertyDetails({
      identifierType: "id",
      key: "propertyId",
      source: "body"
    }),
    AvailabilityController.getCalendarAvailability
  );
