import { Router } from 'express';
import { RoomBookingController } from '../controllers';
import { attachPropertyDetails } from '../../middlewares/property.middleware';
import { pricingRouter } from './pricing.route';
import { groupSearchRouter } from './group-search.route';
export const BookingEngineRoutes = Router();

BookingEngineRoutes.post(
    '/fetch-rooms',
    attachPropertyDetails({
        identifierType: "code",
        key: "propertyCode",
        source: "body"
    }), RoomBookingController.fetchRooms);
BookingEngineRoutes.post("/calendar-prices",
    attachPropertyDetails({
        identifierType: "code",
        key: "propertyCode",
        source: "body"
    }), RoomBookingController.getCalendarPrices);
BookingEngineRoutes.use("/pricing", pricingRouter);
BookingEngineRoutes.use("/group-search", groupSearchRouter);
