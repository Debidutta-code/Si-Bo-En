import { Router } from "express";
import { RoomBookingController } from "../controllers";
import { attachPropertyDetails } from "../../middlewares/property.middleware";
import { pricingRouter } from "./pricing.route";
export const BookingEngineRoutes = Router();

BookingEngineRoutes.post("/fetch-rooms",
    attachPropertyDetails({
        identifierType: "code",
        key: "PropertyCode",
        source: "body"
    }), RoomBookingController.fetchRooms);
BookingEngineRoutes.use("/pricing", pricingRouter);

