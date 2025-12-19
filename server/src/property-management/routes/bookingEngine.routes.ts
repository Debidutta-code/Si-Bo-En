import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { BookingEngineController } from "../controller/bookingEngine.controller";

export const bookingEngineRoute = Router({ mergeParams: true });

bookingEngineRoute
  .route("/:id")
  .post(
    protect,
    BookingEngineController.addConfig
  )
  .get(BookingEngineController.getConfigByPropertyId)
  .patch(
    protect,
    BookingEngineController.updateConfigByPropertyId
  )
  .delete(
    protect,
    BookingEngineController.deleteByPropertyId
  );
