import { Router } from 'express';
import { protect, restrictTo } from '../../middlewares/auth.middleware';
import { checkRoleBased, } from '../../middlewares/checkRole.middleware';
import { Property } from "../controller";
import { propertyAddressRoute } from "./propertyAddress.route";
import { propertyAminityRoute } from "./propertyAmenity.route";
import { paymentDetailsRoute } from "./paymentDetails.route";
import { propertyRoomRoute } from "./room.route";
import { roomAminityRoute } from "./roomAmenity.route";
import { managementRoute } from "./management.route";
import { bookingEngineRoute } from './bookingEngine.routes';
import { attachPropertyDetails } from '../../middlewares/property.middleware';
import {
  vedioRouter
} from "./vedio.route"
export const propertyRouter = Router();
propertyRouter
  .route('/')
  .post(protect, checkRoleBased('canCreateHotel'), Property.createProperty);
propertyRouter.use('/management', protect, managementRoute);
propertyRouter.use('/booking-engine',  bookingEngineRoute)
propertyRouter.use("/video", vedioRouter)
propertyRouter
  .route('/:id')
  .get(
    protect,
    attachPropertyDetails({
      identifierType: "id",
      key: "id",
      source: "params"
    }),
    checkRoleBased('canViewHotel'), Property.getPropertyById)
  .patch(protect, checkRoleBased('canUpdateHotel'), Property.updatePropertyById)
  .delete(
    protect,
    attachPropertyDetails({
      identifierType: "id",
      key: "id",
      source: "params"
    }),
    checkRoleBased('canDeleteHotel'),
    Property.deletePropertyById
  );

// Property Address Routes
propertyRouter.use('/:id/address', protect, attachPropertyDetails({
  identifierType: "id",
  key: "id",
  source: "params"
}), propertyAddressRoute);


// Property Amenity Routes
propertyRouter.use('/:id/amenity', protect, attachPropertyDetails({
  identifierType: "id",
  key: "id",
  source: "params"
}), propertyAminityRoute);


// Property Payment Details Routes
propertyRouter.use('/:id/payment-details', attachPropertyDetails({
  identifierType: "id",
  key: "id",
  source: "params"
}), paymentDetailsRoute);


propertyRouter.use('/:id/room', protect, attachPropertyDetails({
  identifierType: "id",
  key: "id",
  source: "params"
}), propertyRoomRoute);


propertyRouter.use('/:id/room/aminity/:roomId', protect, attachPropertyDetails({
  identifierType: "id",
  key: "id",
  source: "params"
}), roomAminityRoute);


// Management Routes

// Amenity Management


export default propertyRouter;
