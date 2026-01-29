import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { BookingEngineController } from "../controller/bookingEngine.controller";
import { attachPropertyDetails } from "../../middlewares/property.middleware";

export const bookingEngineRoute = Router({ mergeParams: true });

bookingEngineRoute
  .route("/:id")
  .post(
    
    BookingEngineController.addConfig
  )
  .get(
    BookingEngineController.getConfigByPropertyId)
  .patch(
    BookingEngineController.updateConfigByPropertyId
  )
  .delete(
    BookingEngineController.deleteByPropertyId
  );
