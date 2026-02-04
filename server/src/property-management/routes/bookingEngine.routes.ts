import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { BookingEngineController } from "../controller/bookingEngine.controller";
import { attachPropertyDetails } from "../../middlewares/property.middleware";

export const bookingEngineRoute = Router({ mergeParams: true });

bookingEngineRoute
  .route("/:id")
  .post(
    protect, attachPropertyDetails({
      identifierType: "id",
      key: "id",
      source: "params"
    }),
    BookingEngineController.addConfig
  )
  .get(

    BookingEngineController.getConfigByPropertyId)
  .patch(
    protect, attachPropertyDetails({
      identifierType: "id",
      key: "id",
      source: "params"
    }),
    BookingEngineController.updateConfigByPropertyId
  )
  .delete(
    protect, attachPropertyDetails({
      identifierType: "id",
      key: "id",
      source: "params"
    }),
    BookingEngineController.deleteByPropertyId
  );
